# import requests
# import time

# HEADERS = {
#     "apikey": SUPABASE_KEY,
#     "Authorization": f"Bearer {SUPABASE_KEY}",
#     "Content-Type": "application/json",
#     "Prefer": "return=representation"  # to get updated rows back
# }

# # --- Location helper functions ---
# LOCATION_FIELDS = [
#     "City", "State", "County", "Country", "Region", "Subregion",
#     "Locale", "Locus", "Excavation", "River"
# ]

# def title_case(s):
#     return s.title() if isinstance(s, str) else s

# def get_most_specific_location(row):
#     for field in LOCATION_FIELDS:
#         value = row.get(field.lower()) or row.get(field)
#         if value:
#             return title_case(value)
#     return None

# def forward_lookup(query):
#     url = "https://nominatim.openstreetmap.org/search"
#     params = {
#         "q": query,
#         "format": "json",
#         "limit": 1,
#         "accept-language": "en"
#     }
#     headers = {"User-Agent": "artline-location-app"}
#     response = requests.get(url, params=params, headers=headers)
#     if response.status_code == 200 and response.json():
#         result = response.json()[0]
#         return result["lat"], result["lon"]
#     return None, None

# # --- Main function using Supabase REST API ---
# def main():
#     # Fetch all artifacts
#     response = requests.get(SUPABASE_URL, headers=HEADERS)
#     if response.status_code != 200:
#         print("Error fetching data from Supabase:", response.text)
#         return

#     artifacts = response.json()
#     print(f"Fetched {len(artifacts)} artifacts.")

#     updated_count = 0

#     for art in artifacts:
#         artifact_id = art.get("id")
#         location_value = get_most_specific_location(art)
#         if location_value:
#             lat, lon = forward_lookup(location_value)
#             if lat and lon:
#                 # Update row using REST API
#                 update_payload = {"latitude": lat, "longitude": lon}
#                 update_response = requests.patch(
#                     f"{SUPABASE_URL}?id=eq.{artifact_id}",
#                     headers=HEADERS,
#                     json=update_payload
#                 )
#                 if update_response.status_code in [200, 204]:
#                     print(f"✅ Updated Artifact ID {artifact_id}: {location_value} → ({lat}, {lon})")
#                     updated_count += 1
#                 else:
#                     print(f"⚠️ Failed to update Artifact ID {artifact_id}: {update_response.text}")
#                 time.sleep(1)  # respect Nominatim rate limit

#     print(f"Finished updating {updated_count} artifacts.")


# if __name__ == "__main__":
#     main()



import pandas as pd
import requests
from supabase import create_client, Client

# --- Supabase connection ---

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

#### NIKHITA CODE:
# Ordered by specificity (most specific → least)
# LOCATION_FIELDS = [
#     "City",
#     "County",
#     "Country",
#     "Region",
#     "Subregion",
#     "Locale",
#     "Locus",
#     "Excavation",
#     "River"
# ]

# def title_case(s: str):
#     "Capitalize only the first letter of each word"
#     return s.title() if isinstance(s, str) else s

# def get_most_specific_location(row):
#     "Return (location_type, location_value) for the most specific non-empty field"
#     for field in LOCATION_FIELDS:
#         value = row.get(field.lower()) or row.get(field)
#     #fix this so it also includes country
#         if value:
#             return field, title_case(value)
#         return None, None



def update_table():
# Fetch data from Supabase table
    data = supabase.table("test").select("*").execute()
    artifacts = data.data
    print(f"Fetched {len(artifacts)} artifacts from Supabase")

    # Build new local "table"
    new_table = []
    for art in artifacts:
        curr_oi = art.get("Object ID")
        curr_country = art.get("Country")
        result = forward_lookup(curr_country)
        if result != None:
            supabase.table("test").update({
                        "latitude": result[0],
                        "longitude": result[1]
                    }).eq("Object ID", curr_oi).execute()

        # location_type, location_value = get_most_specific_location(art)
        # if location_value:
        #     new_table.append({
        #         "Artifact ID": art.get("id"),
        #         "Location Type": location_type,
        #         "Location": location_value
        #     })

    # print(f"✅ Built new table with {len(new_table)} entries")

    # # Convert to DataFrame for easier viewing/export
    # df = pd.DataFrame(new_table)
    # print(df.head())

    # # Save to CSV
    # df.to_csv("artifact_locations.csv", index=False)
    # print("📁 Saved as artifact_locations.csv")

    # return df

# if __name__ == "__main__":
#     df = main()

### GRACE's ORIGINAL CODE: 
import sys
import requests

def forward_lookup(query):
    """Convert a place name into coordinates."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1}
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        results = response.json()
        if results:
            result = results[0]
            print(f"\n📍 Forward lookup for '{query}':")
            print(f"Name: {result['display_name']}")
            print(f"Latitude: {result['lat']}, Longitude: {result['lon']}")
            return (result['lat'], result['lon'])
        else:
            print("No results found.")
    else:
        print(f"Error: {response.status_code}")
        return None


def reverse_lookup(lat, lon):
    """Convert coordinates into a readable address."""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"\n📍 Reverse lookup for ({lat}, {lon}):")
        print(f"Address: {data.get('display_name', 'Unknown location')}")
    else:
        print(f"Error: Unable to fetch data (status {response.status_code})")


if __name__ == "__main__":
    print("start")
    update_table()
    # Handle command-line arguments
    # args = sys.argv[1:]

    # if not args:
    #     print("Usage:")
    #     print("  python3 backend/location_call.py 'Place Name'")
    #     print("  python3 backend/location_call.py <latitude> <longitude>")
    #     sys.exit(1)

    # # Forward lookup if user provides a string (like "Pensacola")
    # if len(args) == 1:
    #     query = args[0]
    #     forward_lookup(query)

    # # Reverse lookup if user provides 2 numbers (lat, lon)
    # elif len(args) == 2:
    #     try:
    #         lat = float(args[0])
    #         lon = float(args[1])
    #         reverse_lookup(lat, lon)
    #     except ValueError:
    #         print("Error: Latitude and longitude must be numeric values.")
    # else:
    #     print("Error: Invalid number of arguments.")
