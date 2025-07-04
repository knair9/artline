"""
Authors: Harper Noteboom and Kalyani Nair
Date: 7/3/2025 

Scrapes data from a specific year range in the Met API. Converts objects to Artifact objects and returns a list of 10 Artifacts. 
Also includes a function to return a list of just the image url's for display in the front end 
"""

import requests
from artifact import Artifact
import random 

def convert_met_data_to_artifact(met_data): 
  """
  Convert met data dictionary (json) to our Artifact class
  documentation: https://metmuseum.github.io/#object
  """
  return Artifact( #add more parameters as needed
      objectID=met_data.get("objectID", "Unknown ID"),
      objectDate=met_data.get("objectDate", "Unknown Date Range"),
      beginDate=met_data.get("objectBeginDate", "Unknown Begin Date"),
      endDate=met_data.get("objectEndDate", "Unknown End Date"),
      isHighlight=met_data.get("isHighlight", "Unkown Highlight Status"),
      isPublicDomain=met_data.get("isPublicDomain", "Unknown Public Domain Status"),
      image=met_data.get("primaryImage", "No Image Available"),
      image_small=met_data.get("primaryImageSmall", "No Small Image Available"),
      other_images=met_data.get("additionalImages", "No Additional Images Available"),
      department=met_data.get("department", "Unknown department"),
      objectName=met_data.get("objectName", "Unknown Name"),
      title=met_data.get("title", "Unknown Title"),
      culture=met_data.get("culture", "Unknown Culture"),
      period=met_data.get("period", "Unknown Period"),
      medium=met_data.get("medium", "Unknown Medium"),
      artist=met_data.get("artistDisplayName", "Unknown Artist"),
      met_url=met_data.get("objectURL", "Unknown URL")
  )

def get_artifacts_range(start, end): 
  """
  Takes in a start and end year and returns a list of 10 Artifacts from the met API within that range
  start: int : start year 
  end: int : end year
  """
  met_link = f"https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&dateBegin={start}&dateEnd={end}&q=*"
  response = requests.get(met_link)
  data = response.json()

  total = data.get("total", 0)
  object_ids = data.get("objectIDs", [])
  artifacts = [] #list of Artifacts to return to frontend 

  if total <= 10: 
    #convert all 10 objects in range to Artifacts and return as a list 
    for object_id in object_ids: 
      artifact_link= f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}" #link to met object
      artifact_response = requests.get(artifact_link) #requests data from met object
      artifact_data = artifact_response.json() #converts data to json
      artifact = convert_met_data_to_artifact(artifact_data) #converts to Artifact
      artifacts.append(artifact)
      return artifacts
  else: 
    #randomly generates the objectIDs of 10 random objects, converts them to Artifacts, and returns as a list
    for i in range(10): 
      int_random = random.randint(0, total)
      selected_obj = object_ids[int_random]
      artifact_link= f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{selected_obj}" #link to met object 
      artifact_response = requests.get(artifact_link) #requests data from met object
      artifact_data = artifact_response.json() #converts data to json 
      artifact = convert_met_data_to_artifact(artifact_data) #converts to Artifact
      artifacts.append(artifact)
      return artifacts


def get_artifact_images(list_of_artifacts): 
  """
  Takes in a list of Artifacts and returns a list of image links
  """
  images = []
  for artifact in list_of_artifacts:
    images.append(artifact.get_image())
  return images
