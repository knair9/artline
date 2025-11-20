import os
import time
import requests
import re
from dotenv import load_dotenv
from supabase import create_client, Client

# load virtual environment for API keys
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# initializes a client to interact with Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# cleans up country names
def clean_country_name(raw_country):
#if country is already cleaned then don't do anything

    # takes everything before commas or other delimeters, to solve the issue of multiple countries
    # cleaned = raw_country.split("|")[0].split(",")[0].strip()
    if "|" in raw_country or "," in raw_country:
        return None
    
    return raw_country


# --- Forward lookup (country → coordinates) ---
def forward_lookup(query):
    #does the forward lookup into coordinates 
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1, "accept-language": "en"}  # force English response
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    #takes the response and stores it
    if response.status_code == 200 and response.json():
        result = response.json()[0]
        return result["lat"], result["lon"]
    return None


# takes lat and long 
def reverse_lookup(lat, lon):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "accept-language": "en"  # forces english
    }
    headers = {"User-Agent": "artline-location-app"}
    response = requests.get(url, params=params, headers=headers)

    #displays the name of the country given after reverse searching up the country
    if response.status_code == 200:
        data = response.json()
        return data.get("address", {}).get("country", None)
        #return data.get("address", "").get("country")
    return None


#cleans all the countries in the database and creates a new row with the cleaned names
def clean_countries(art):

    data = supabase.table("geo_filtered").select("*").execute()
    artifacts = data.data

    for art in artifacts:  # Skip if already cleaned
         # gets the object ID and raw country name
        curr_oi = art.get("Object ID")
        raw_country = art.get("Country")


#cleans the country and puts it in a seperate row
        cleaned_country = clean_country_name(raw_country)

#if country cannot be cleaned prints a statement
        if cleaned_country is None:
            print(f"Skipping Object ID {curr_oi}: non-English or invalid → '{raw_country}'")
            cleaned_country = "Invalid"
            continue

        # for every object the cleaned country is added
        supabase.table("geo_filtered").update({
            "Country Cleaned": cleaned_country
        }).eq("Object ID", curr_oi).execute()

        print(f" Object ID {curr_oi}: '{raw_country}' → '{cleaned_country}'")

    


# uses the cleaned country names to update coordinates 
def update_coordinates():
    #gets 1000 items from the database
    data = supabase.table("geo_filtered")\
        .select("*")\
        .is_("Country Cleaned", None)\
        .execute()
    
    artifacts = data.data
    print(f" Fetched {len(artifacts)} artifacts for coordinate lookup\n")

#creates a hash table to store the coordinates of countries
    country_cache = {} 


    for art in artifacts:

        curr_oi = art.get("Object ID")
        raw_country = art.get("Country")
        cleaned_country = art.get("Country Cleaned")
        curr_lat = art.get("latitude")
        curr_lon = art.get("longitude")
       
#will not get location if there isn't a cleaned country
        if cleaned_country == None:
            cleaned_country = clean_country_name(raw_country)
            if cleaned_country == None:
                print(f" Skipping Object ID {curr_oi}: non-English or invalid → '{raw_country}'")
                supabase.table("geo_filtered").update({
                    "Country Cleaned": raw_country
                }).eq("Object ID", curr_oi).execute()
                continue

        if curr_lat != None and curr_lon != None:
            print(f" Skipping Object ID {curr_oi}: already has coordinates → ({curr_lat}, {curr_lon})")
            continue
        
        # Sees if there are coordinates cahced
        if cleaned_country in country_cache:
            lat, lon = country_cache[cleaned_country]
            print(f" Using cached coordinates for '{cleaned_country}' → ({lat}, {lon})")
        else:
        #if there are no coordinates in the cache then finds new ones 
            coords = forward_lookup(cleaned_country)
            if coords == None:
                print(f" No coordinates found for '{cleaned_country}'.")
                supabase.table("geo_filtered").update({
                    "Country Cleaned": raw_country
                }).eq("Object ID", curr_oi).execute()
                continue
                

            lat, lon = coords
            verified_location = reverse_lookup(lat, lon)
            print(verified_location, lat, lon)

            if verified_location == None:
                print(f" Could not verify location for '{cleaned_country}'.")
                continue
        #if country is verified it gets added to the cache
            if verified_location.lower() in cleaned_country.lower():
                print(f"Verified: {cleaned_country} → ({lat}, {lon})")
                country_cache[cleaned_country] = (lat, lon)  # Store in cache
            else:
                print(f"Reverse lookup mismatch: '{cleaned_country}' → '{verified_location[:60]}...'")
                supabase.table("geo_filtered").update({
                    "Country Cleaned": cleaned_country
                }).eq("Object ID", curr_oi).execute()

                continue

            time.sleep(1.1)  # Nominatim rate limit

        # update supabase with the latitude and longitude
        supabase.table("geo_filtered").update({
            "latitude": lat,
            "longitude": lon, 
            "Country Cleaned": cleaned_country
            
        }).eq("Object ID", curr_oi).execute()



# --- Main execution ---
if __name__ == "__main__":
    # clean_countries()
    update_coordinates()
