import requests
import time
from db_connection import supabase
from tenacity import retry, wait_exponential

@retry(wait=wait_exponential(multiplier=2, min=1, max=16))
def fetch_object(curr_api_url, curr_oi,batch_num, row):
  try:
    met_response = requests.get(curr_api_url)

    if (met_response.status_code == 403):
      print(f"\ntimed out at batch {batch_num}, object id {curr_oi}\n")
      time.sleep(20)
      met_response = requests.get(curr_api_url)
      if (met_response.status_code == 403):
        return "timed out"

    if (met_response.status_code != 200):
      print(
          f"Error: Received status code {met_response.status_code} for id {curr_oi}"
      )
      with open("bad_apples.txt", "a") as f:
        f.write(f"{curr_oi}, received status code {met_response.status_code}\n")
      return "continue"

    try:
      curr_json = met_response.json()
      curr_image_url = curr_json.get("primaryImage", "none")
      if curr_image_url != "none" and curr_image_url != "":  # if there is primary image, set the image url and has_image to true
        response = (supabase.table("art_ifacts").update({
            "image_url":
            curr_image_url
        }).eq("Object ID", curr_oi).execute())
        response = (supabase.table("art_ifacts").update({
            "has_image": True
        }).eq("Object ID", curr_oi).execute())
      else:  #there is no image, we set has_image to false
        response = (supabase.table("art_ifacts").update({
            "has_image": False
        }).eq("Object ID", curr_oi).execute())
      print(f"updated object id {curr_oi}")

    except requests.exceptions.JSONDecodeError:  #cannot read json
      print(f"Failed to decode JSON for object ID: {curr_oi}")
      with open("bad_apples.txt", "a") as f:
        f.write(
            f"{curr_oi}, failed to decode JSON for object ID: {curr_oi}\n")
      return "continue"

  except Exception as e:
    with open("bad_apples.txt", "a") as f:
        f.write(
            f"{curr_oi}, failed to decode JSON because of error {e}\n")
    print(f"Error processing row {row}: {e}")
    return "continue"

def preload_image_urls():
  total_rows = 485000
  batch_size = 1000
  num_batches = (total_rows + batch_size - 1) // batch_size  # batch_size

  for batch_num in range(num_batches):
    start = batch_num * batch_size
    end = start + batch_size - 1
    print(f"Fetching rows {start}–{end}")
    response = supabase.table("art_ifacts").select("*").range(start, end).is_(
        "has_image", "null").execute()
    batch = response.data

    if len(batch) == 0:
      print(f"No data returned for this batch: {batch_num}")
      continue

    for row in batch:
      curr_oi = row.get("Object ID")
      curr_api_url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{curr_oi}"
      result = fetch_object(curr_api_url, curr_oi, batch_num, row)
      if result == "continue":
        continue
      if result == "timed out":
        return "timed out"
      # try:
      #   met_response = requests.get(curr_api_url)

      #   if (met_response.status_code == 403):
      #     print(f"\ntimed out at batch {batch_num}, object id {curr_oi}\n")
      #     time.sleep(20)
      #     met_response = requests.get(curr_api_url)
      #     if (met_response.status_code == 403):
      #       return "timed out"

      #   if (met_response.status_code != 200):
      #     print(
      #         f"Error: Received status code {met_response.status_code} for id {curr_oi}"
      #     )
      #     with open("bad_apples.txt", "a") as f:
      #       f.write(f"{curr_oi}, received status code {met_response.status_code}\n")
      #     continue

      #   try:
      #     curr_json = met_response.json()
      #     curr_image_url = curr_json.get("primaryImage", "none")
      #     if curr_image_url != "none" and curr_image_url != "":  # if there is primary image, set the image url and has_image to true
      #       response = (supabase.table("art_ifacts").update({
      #           "image_url":
      #           curr_image_url
      #       }).eq("Object ID", curr_oi).execute())
      #       response = (supabase.table("art_ifacts").update({
      #           "has_image": True
      #       }).eq("Object ID", curr_oi).execute())
      #     else:  #there is no image, we set has_image to false
      #       response = (supabase.table("art_ifacts").update({
      #           "has_image": False
      #       }).eq("Object ID", curr_oi).execute())
      #     print(f"updated object id {curr_oi}")

      #   except requests.exceptions.JSONDecodeError:  #cannot read json
      #     print(f"Failed to decode JSON for object ID: {curr_oi}")
      #     with open("bad_apples.txt", "a") as f:
      #       f.write(
      #           f"{curr_oi}, failed to decode JSON for object ID: {curr_oi}\n")
      #     continue

      # except Exception as e:
      #   with open("bad_apples.txt", "a") as f:
      #       f.write(
      #           f"{curr_oi}, failed to decode JSON because of error {e}\n")
      #   print(f"Error processing row {row}: {e}")
      #   continue

      time.sleep(.8)

    print(f"Finished batch {batch_num}")

  return ("Done")


if __name__ == "__main__":
  while (True):
    if (preload_image_urls() == "timed out"):
      continue
    else:
      break
