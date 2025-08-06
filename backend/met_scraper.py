import requests
from artifact import Artifact
import random
import time
from db_connection import supabase


def get_ten_artifacts_range(start, end):
  """
  Takes in a start and end year and returns a list of 10 Artifact objects from the met API within that range
  start: int : start year 
  end: int : end year
  """
  response = supabase.table("art_ifacts") \
      .select('"Object ID"', '"Object Begin Date"', '"Object End Date"', '"image_url"', '"has_image"') \
      .eq("has_image", True) \
      .gte('"Object Begin Date"', start) \
      .lte('"Object End Date"', end) \
      .limit(10).execute()

  #having the limit too high causes the query to time out
  #TO DO: index the db
  rows = response.data

  if not rows:
    print(f"No artifacts found between {start} and {end}.")
    return []

  #eventually when we can return more than 10, this will randomly shuffle them
  random.shuffle(rows)
  selected = rows[:10]  #takes the first 10 artifacts from the shuffled list

  return selected