import os
import time
import requests
import re
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Load environment variables ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Helper: Clean up country names ---
def clean_country_name(raw_country):
    """Clean and standardize the country name."""
    if not raw_country:
        return None

    # Takes the first part befoer spaeces
    cleaned = raw_country.split(",")[0].split("|")[0].strip()

    # If its US take full name
    if cleaned.lower().startswith("united states"):
        cleaned = "United States"
    else:
        # Otherwise, split by space and take first word
        cleaned = cleaned.split(" ")[0].strip()

 

    return cleaned


# --- Forward lookup (country → coordinates) ---
def forward_lookup(query):
    """Convert a place name into coordinates (lat, lon)."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1, "accept-language": "en"}  # force English
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200 and response.json():
        result = response.json()[0]
        return result["lat"], result["lon"]
    return None


# --- Reverse lookup (coordinates → English address) ---
def reverse_lookup(lat, lon):
    """"Makes coordinates in english.""""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "accept-language": "en"  # ✅ force English output
    }
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data.get("display_name", "")
    return None


# --- Step 1: Clean country names and update Supabase ---
def clean_countries():
    data = supabase.table("test").select("*").execute()
    artifacts = data.data
    print(f"🧹 Fetched {len(artifacts)} artifacts for cleaning\n")

    for art in artifacts:
        curr_oi = art.get("Object ID")
        raw_country = art.get("Country")

        if not raw_country:
            print(f"⚠️ Skipping Object ID {curr_oi}: no country listed.")
            continue

        cleaned_country = clean_country_name(raw_country)

        if not cleaned_country:
            print(f"🚫 Skipping Object ID {curr_oi}: non-English or invalid → '{raw_country}'")
            continue

        # Update Supabase
        supabase.table("test").update({
            "Country Cleaned": cleaned_country
        }).eq("Object ID", curr_oi).execute()

        print(f"✅ Object ID {curr_oi}: '{raw_country}' → '{cleaned_country}'")

    print("\n✨ Finished cleaning country names.\n")


# --- Step 2: Use cleaned names to update coordinates ---
def update_coordinates():
    data = supabase.table("test").select("*").execute()
    artifacts = data.data
    print(f"📍 Fetched {len(artifacts)} artifacts for coordinate lookup\n")

    country_cache = {}  # hash table to store countries 

    for art in artifacts:
        curr_oi = art.get("Object ID")
        cleaned_country = art.get("Country Cleaned")

        if not cleaned_country:
            print(f"⚠️ Skipping Object ID {curr_oi}: no cleaned country.")
            continue

        # tries to use caches coordinates
        if cleaned_country in country_cache:
            lat, lon = country_cache[cleaned_country]
            print(f"🗂️ Using cached coordinates for '{cleaned_country}' → ({lat}, {lon})")
        else:
            coords = forward_lookup(cleaned_country)
            if not coords:
                print(f"❌ No coordinates found for '{cleaned_country}'.")
                continue

            lat, lon = coords
            verified_location = reverse_lookup(lat, lon)

            if not verified_location:
                print(f"⚠️ Could not verify location for '{cleaned_country}'.")
                continue

            if cleaned_country.lower() in verified_location.lower():
                print(f"✅ Verified: {cleaned_country} → ({lat}, {lon})")
                country_cache[cleaned_country] = (lat, lon)  # ✅ Store in cache
            else:
                print(f"❌ Reverse lookup mismatch: '{cleaned_country}' → '{verified_location[:60]}...'")
                continue

            time.sleep(1.1)  # Nominatim rate limit

        # Update Supabase with lat/lon (from cache or lookup)
        supabase.table("test").update({
            "latitude": lat,
            "longitude": lon
        }).eq("Object ID", curr_oi).execute()

    print("\n🎯 Finished updating coordinates.")


# --- Main execution ---
if __name__ == "__main__":
    clean_countries()
    update_coordinates()
