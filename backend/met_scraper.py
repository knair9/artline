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

  query = query.limit(10)
  response = query.execute()

  rows = response.data

  if not rows:
    print(f"No artifacts found between {start} and {end}.")
    return []

  random.shuffle(rows)
  selected = rows[:10]

  return selected


def get_ten_artifacts_MOMA(start, end):
  """
  Takes in a start and end year and returns a list of 10 artifacts from MOMA within that range
  start: int : start year 
  end: int : end year
  """
  def extract_year(date_str):
    """Extract year from format like '(1945)' or return None if invalid"""
    if not date_str or date_str == '0':
      return None
    # Remove parentheses and convert to int
    year_str = date_str.strip('()')
    try:
      year = int(year_str)
      return year if year > 0 else None
    except (ValueError, TypeError):
      return None

  # Query MOMA table - select only needed columns
  query = supabase.table("Museum of Modern Art").select(
    "Title", "Artist", "BeginDate", "EndDate", 
    "Classification", "ObjectID", "URL", "ImageURL"
  )
  response = query.execute()
  
  if not response.data:
    print(f"No MOMA artifacts found.")
    return []

  # Filter artifacts by date range and validate dates
  filtered_artifacts = []
  for artifact in response.data:
    begin_year = extract_year(artifact.get('BeginDate'))
    end_year = extract_year(artifact.get('EndDate'))
    
    # Skip artifacts with invalid dates or where end comes before begin
    if begin_year is None or end_year is None:
      continue
    if end_year < begin_year:
      continue
    
    # Check if artifact overlaps with requested range
    # Overlap occurs if: artifact_begin <= query_end AND artifact_end >= query_start
    if begin_year <= end and end_year >= start:
      filtered_artifacts.append(artifact)

  if not filtered_artifacts:
    print(f"No MOMA artifacts found between {start} and {end}.")
    return []

  # Shuffle and return up to 10
  random.shuffle(filtered_artifacts)
  return filtered_artifacts[:10]


def get_ten_artifacts_cleveland(start, end):
  """
  Takes in a start and end year and returns a list of 10 artifacts from Cleveland Museum within that range
  start: int : start year 
  end: int : end year
  """
  def extract_year(date_str):
    """Extract year from date string or return None if invalid"""
    if not date_str or date_str == '0':
      return None
    try:
      year = int(date_str)
      return year if year > 0 else None
    except (ValueError, TypeError):
      return None

  # Query Cleveland table - select only needed columns
  query = supabase.table("cleveland_artifacts").select(
    "title", "creators", "creation_date_earliest", "creation_date_latest", "url", 
    "image_web", "culture"
  )
  response = query.execute()
  
  if not response.data:
    print(f"No Cleveland artifacts found.")
    return []

  # Filter artifacts by date range and validate dates
  filtered_artifacts = []
  for artifact in response.data:
    begin_year = extract_year(artifact.get('creation_date_earliest'))
    end_year = extract_year(artifact.get('creation_date_latest'))
    
    # Skip artifacts with invalid dates or where end comes before begin
    if begin_year is None or end_year is None:
      continue
    if end_year < begin_year:
      continue
    
    # Check if artifact overlaps with requested range
    # Overlap occurs if: artifact_begin <= query_end AND artifact_end >= query_start
    if begin_year <= end and end_year >= start:
      filtered_artifacts.append(artifact)

  if not filtered_artifacts:
    print(f"No Cleveland artifacts found between {start} and {end}.")
    return []

  # Shuffle and return up to 10
  random.shuffle(filtered_artifacts)
  return filtered_artifacts[:10]


def get_ten_artifacts_walter(start, end):
  """
  Takes in a start and end year and returns a list of 10 artifacts from Walter Art Museum within that range
  start: int : start year 
  end: int : end year
  """
  def extract_year(date_str):
    """Extract year from date string or return None if invalid"""
    if not date_str or date_str == '0':
      return None
    try:
      year = int(date_str)
      return year if year > 0 else None
    except (ValueError, TypeError):
      return None

  # Query Walter table - select only needed columns
  query = supabase.table("walter_artifacts").select(
    "Title", "Creators", "DateBeginYear", "DateEndYear", "DateText", "Classification", "ObjectID", "ResourceURL", "Images", 
    "Culture"
  )
  response = query.execute()
  
  if not response.data:
    print(f"No Walter artifacts found.")
    return []

  # Filter artifacts by date range and validate dates
  filtered_artifacts = []
  for artifact in response.data:
    begin_year = extract_year(artifact.get('DateBeginYear'))
    end_year = extract_year(artifact.get('DateEndYear'))
    
    # Skip artifacts with invalid dates or where end comes before begin
    if begin_year is None or end_year is None:
      continue
    if end_year < begin_year:
      continue
    
    # Check if artifact overlaps with requested range
    # Overlap occurs if: artifact_begin <= query_end AND artifact_end >= query_start
    if begin_year <= end and end_year >= start:
      filtered_artifacts.append(artifact)

  if not filtered_artifacts:
    print(f"No Walter artifacts found between {start} and {end}.")
    return []

  # Shuffle and return up to 10
  random.shuffle(filtered_artifacts)
  return filtered_artifacts[:10]
