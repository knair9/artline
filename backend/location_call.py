import requests
import time

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"  # to get updated rows back
}

# --- Location helper functions ---
LOCATION_FIELDS = [
    "City", "State", "County", "Country", "Region", "Subregion",
    "Locale", "Locus", "Excavation", "River"
]

def title_case(s):
    return s.title() if isinstance(s, str) else s

def get_most_specific_location(row):
    for field in LOCATION_FIELDS:
        value = row.get(field.lower()) or row.get(field)
        if value:
            return title_case(value)
    return None

def forward_lookup(query):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "accept-language": "en"
    }
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200 and response.json():
        result = response.json()[0]
        return result["lat"], result["lon"]
    return None, None

# --- Main function using Supabase REST API ---
def main():
    # Fetch all artifacts
    response = requests.get(SUPABASE_URL, headers=HEADERS)
    if response.status_code != 200:
        print("Error fetching data from Supabase:", response.text)
        return

    artifacts = response.json()
    print(f"Fetched {len(artifacts)} artifacts.")

    updated_count = 0

    for art in artifacts:
        artifact_id = art.get("id")
        location_value = get_most_specific_location(art)
        if location_value:
            lat, lon = forward_lookup(location_value)
            if lat and lon:
                # Update row using REST API
                update_payload = {"latitude": lat, "longitude": lon}
                update_response = requests.patch(
                    f"{SUPABASE_URL}?id=eq.{artifact_id}",
                    headers=HEADERS,
                    json=update_payload
                )
                if update_response.status_code in [200, 204]:
                    print(f"✅ Updated Artifact ID {artifact_id}: {location_value} → ({lat}, {lon})")
                    updated_count += 1
                else:
                    print(f"⚠️ Failed to update Artifact ID {artifact_id}: {update_response.text}")
                time.sleep(1)  # respect Nominatim rate limit

    print(f"Finished updating {updated_count} artifacts.")


if __name__ == "__main__":
    main()



import pandas as pd
from supabase import create_client, Client

# --- Supabase connection ---
SUPABASE_URL = "https://wnctglwmikvkdimacmvg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduY3RnbHdtaWt2a2RpbWFjbXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDYxNzcsImV4cCI6MjA2ODc4MjE3N30.qGQYfzqSTkZhlv-U-9GFkz_MuyR1a_AxhUxwT5mPvZA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

#### NIKHITA CODE:
# Ordered by specificity (most specific → least)
LOCATION_FIELDS = [
    "City",
    "State",
    "County",
    "Country",
    "Region",
    "Subregion",
    "Locale",
    "Locus",
    "Excavation",
    "River"
]

def title_case(s: str):
    """Capitalize only the first letter of each word"""
    return s.title() if isinstance(s, str) else s

def get_most_specific_location(row):
    """Return (location_type, location_value) for the most specific non-empty field"""
    for field in LOCATION_FIELDS:
        value = row.get(field.lower()) or row.get(field)
        if value:
            return field, title_case(value)
    return None, None

def main():
    # Fetch data from Supabase table
    data = supabase.table("art_ifacts").select("*").execute()
    artifacts = data.data
    print(f"Fetched {len(artifacts)} artifacts from Supabase")

    # Build new local "table"
    new_table = []
    for art in artifacts:
        location_type, location_value = get_most_specific_location(art)
        if location_value:
            new_table.append({
                "Artifact ID": art.get("id"),
                "Location Type": location_type,
                "Location": location_value
            })

    print(f"✅ Built new table with {len(new_table)} entries")

    # Convert to DataFrame for easier viewing/export
    df = pd.DataFrame(new_table)
    print(df.head())

    # Save to CSV
    df.to_csv("artifact_locations.csv", index=False)
    print("📁 Saved as artifact_locations.csv")

    return df

if __name__ == "__main__":
    df = main()