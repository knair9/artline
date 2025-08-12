import requests
from artifact import Artifact
import random
import time
from db_connection import supabase


def get_ten_artifacts_range(start, end, classification, country, culture):
  """
  Takes in a start and end year and returns a list of 10 Artifact objects from the met API within that range
  start: int : start year 
  end: int : end year
  """
  # querying the database for artifacts between the start and end year
  query = (supabase.table("random_artifacts") \
      .select('"Object ID"', '"Title"', '"Artist Display Name"', '"Object Date"','"Medium"','"Culture"','"City"','"Geography Type"','"City"','"State"','"Country"', '"Object Begin Date"', '"Object End Date"', '"image_url"', '"has_image"', "Classification") \
      .eq("has_image", True) \
      .gte('"Object Begin Date"', start) \
      .lte('"Object End Date"', end)
           )

  if classification:
    query = query.ilike('"Classification"', f'%{classification}%')
  if country:
    query = query.ilike('"Country"', f'%{country}%')
  if culture:
    query = query.ilike('"Culture"', f'%{culture}%')

  query = query.limit(10)  #should we increase this limit?
  response = query.execute()

  rows = response.data

  if not rows:
    print(f"No artifacts found between {start} and {end}.")
    return []

  random.shuffle(rows)
  selected = rows[:10]  #takes the first 10 artifacts from the shuffled list

  return selected
