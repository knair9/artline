import os
import time
import requests
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Load environment variables ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Helper functions ---
def forward_lookup(query):
    """Convert a place name into coordinates (lat, lon)."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1}
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200 and response.json():
        result = response.json()[0]
        return result["lat"], result["lon"]
    return None


def reverse_lookup(lat, lon):
    """Convert coordinates into a readable address (for verification)."""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data.get("display_name", "")
    return None


# --- Main update function ---
def update_table():
    data = supabase.table("test").select("*").execute()
    artifacts = data.data
    print(f"📦 Fetched {len(artifacts)} artifacts from Supabase\n")

    for art in artifacts:
        curr_oi = art.get("Object ID")
        raw_country = art.get("Country")

        if not raw_country:
            print(f"⚠️ Skipping Object ID {curr_oi}: no country listed.")
            continue

        # Clean up the country field (handles commas, pipes, etc.)
        cleaned_country = raw_country.split(",")[0].split("|")[0].strip()
        print(f"🌍 Object ID {curr_oi} | Raw: '{raw_country}' → Cleaned: '{cleaned_country}'")

        coords = forward_lookup(cleaned_country)
        if not coords:
            print(f"  ❌ No coordinates found for '{cleaned_country}'.")
            continue

        lat, lon = coords
        verified_location = reverse_lookup(lat, lon)

        if not verified_location:
            print(f"  ⚠️ Could not verify location for {cleaned_country}.")
            continue

        if cleaned_country.lower() in verified_location.lower():
            print(f"  ✅ Verified match: {cleaned_country} → ({lat}, {lon})")
            supabase.table("test").update({
                "Country Cleaned": cleaned_country,
                "latitude": lat,
                "longitude": lon
            }).eq("Object ID", curr_oi).execute()
        else:
            print(f"  ❌ Reverse lookup mismatch for '{cleaned_country}' → got '{verified_location[:60]}...'")

        time.sleep(1.1)  # Nominatim rate limit

    print("\n🎯 Finished updating artifacts.")


if __name__ == "__main__":
    update_table()
