import requests
import time
import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials. Check your .env file.")

# --- Initialize Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Nominatim setup ---
NOMINATIM_HEADERS = {"User-Agent": "artline-location-app"}
NOMINATIM_URL = "https://nominatim.openstreetmap.org"
CACHE = {}  # cache {country_name: (lat, lon)}

# --- Helper functions ---
def get_country(row):
    """Extract the country name from a row."""
    for key in ["country", "Country"]:
        if key in row and row[key]:
            return row[key].strip()
    return None

def forward_lookup(country):
    """Fetch coordinates (lat, lon) for a given country using Nominatim."""
    if country in CACHE:
        return CACHE[country]

    params = {"q": country, "format": "json", "limit": 1, "accept-language": "en"}
    r = requests.get(f"{NOMINATIM_URL}/search", params=params, headers=NOMINATIM_HEADERS)

    if r.status_code == 200 and r.json():
        result = r.json()[0]
        lat, lon = float(result["lat"]), float(result["lon"])
        CACHE[country] = (lat, lon)
        return lat, lon

    CACHE[country] = (None, None)
    return None, None

# --- Main ---
def main():
    # Fetch data from Supabase
    data = supabase.table("geo_filtered").select("*").execute()
    artifacts = data.data
    print(f"📦 Fetched {len(artifacts)} artifacts from Supabase")

    new_table = []

    for art in artifacts:
        object_number = art.get("Object Number")
        country = get_country(art)

        # Skip if no country
        if not country:
            continue

        # Skip if latitude and longitude already exist
        if art.get("latitude") is not None and art.get("longitude") is not None:
            print(f"⏩ Skipping {object_number} (coordinates already exist)")
            continue

        # Get coordinates
        lat, lon = forward_lookup(country)
        if lat is None or lon is None:
            print(f"⚠️ No coordinates found for {country}")
            continue

        print(f"✅ {object_number} ({country}): ({lat}, {lon})")

        # Update Supabase
        try:
            update_data = {"latitude": lat, "longitude": lon}
            response = (
                supabase.table("geo_filtered")
                .update(update_data)
                .eq("Object Number", object_number)
                .execute()
            )
            if response.data:
                print(f"🗺️ Updated {object_number} in Supabase")
            else:
                print(f"⚠️ No row matched for {object_number}")
        except Exception as e:
            print(f"❌ Failed to update {object_number}: {e}")

        # Add to local table
        new_table.append({
            "Object Number": object_number,
            "Country": country,
            "Latitude": lat,
            "Longitude": lon
        })

        # Respect Nominatim rate limit
        time.sleep(1)

    # Convert to DataFrame
    df = pd.DataFrame(new_table)
    print(df.head())

    # Save to CSV backup
    df.to_csv("artifact_country_coords.csv", index=False)
    print("📁 Saved as artifact_country_coords.csv")

    print(f"\n✅ Finished updating {len(new_table)} artifacts.")
    return df

if __name__ == "__main__":
    df = main()
