import requests
from artifact import Artifact
import random
import time
from db_connection import supabase

def count_artifacts_range(start, end, classification=None, country=None, culture=None):
    query = (
        supabase.table("art_ifacts")
        .select("*", count="exact", head=True)
        .eq("has_image", True)
        .gte("Object Begin Date", start)
        .lte("Object End Date", end)
    )

    if classification:
        query = query.ilike("Classification", f"%{classification}%")
    if country:
        query = query.ilike("Country", f"%{country}%")
    if culture:
        query = query.ilike("Culture", f"%{culture}%")

    response = query.execute()
    return response.count

def count_artifacts():
     
     query = (
        supabase.table("art_ifacts")
        .select("*", count="exact", head=True)
        .eq("has_image", True)
        .eq("Medium", "Wood")
    )
     
     response = query.execute()

     print("count")
     print(response.count)
     
count_artifacts()

