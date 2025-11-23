from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import time
from artifact import Artifact
from met_scraper import get_ten_artifacts_range, get_ten_artifacts_MOMA, get_ten_artifacts_cleveland, get_ten_artifacts_walter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://art-line.vercel.app",
        "https://artline-git-main-knair9s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/api/artifacts")
def preflight():
    return {"message": "CORS preflight successful"}


cache_store = {}
CACHE_EXPIRY_SECONDS = 3600 

def get_from_cache(key: str):
    item = cache_store.get(key)
    if not item:
        return None
    if time.time() - item["timestamp"] > CACHE_EXPIRY_SECONDS:
        del cache_store[key]
        return None
    return item["data"]

def set_cache(key: str, data):
    cache_store[key] = {"data": data, "timestamp": time.time()}


@app.get("/api/artifacts")
def get_artifacts(
    start: int = Query(..., description="user start year"),
    end: int = Query(..., description="user end year"),
    museum: str | None = Query(None, description="museum to query (met, moma, cleveland, walter)"),
    classification: str | None = Query(None, description="optional medium filter"),
    country: str | None = Query(None, description="optional country filter"),
    culture: str | None = Query(None, description="optional culture filter")
):
    # Route to appropriate museum function
    print(">>> RUNNING UPDATED ARTIFACT ENDPOINT WITH MUSEUM ROUTING <<<")
    museum_lower = museum.lower().strip()
    print(f"Museum parameter received: '{museum}' (lowercased: '{museum_lower}')")
    
    print("DEBUG: /api/artifacts reached with params:", start, end, museum)

    if museum_lower == "moma":
        print("Routing to MOMA function")
        artifacts = get_ten_artifacts_MOMA(start, end)
    elif museum_lower == "cleveland":
        print("Routing to Cleveland function")
        artifacts = get_ten_artifacts_cleveland(start, end)
    elif museum_lower == "walter":
        print("Routing to Walter function")
        artifacts = get_ten_artifacts_walter(start, end)
    else:  # Default to Met Museum
        print("Routing to Met Museum function")
        artifacts = get_ten_artifacts_range(
            start, end,
            classification=classification,
            country=country,
            culture=culture
        )
    
    print(f"Updated: fetched {len(artifacts)} artifacts from {museum} museum between {start} and {end}")
    return artifacts


@app.get("/api/cache_proxy")
def cache_proxy(key: str = Query(..., description="unique cache key")):
    cached = get_from_cache(key)
    if cached:
        print(f"[CACHE HIT] Key: {key}")
        return {"status": "hit", "key": key, "data": cached}

    print(f"[CACHE MISS] Key: {key}, fetching new data...")
    new_data = {"content": f"Data generated for key '{key}'", "fetched_at": time.ctime()}

    set_cache(key, new_data)
    return {"status": "miss", "key": key, "data": new_data}



@app.get("/cached_image")
async def cached_image(url: str):
    if not url.startswith("https://images.metmuseum.org/"):
        raise HTTPException(status_code=400, detail="Invalid image source URL")


    cached_img = get_from_cache(url)
    if cached_img:
        print(f"[LOCAL CACHE HIT] {url}")
        return StreamingResponse(
            iter([cached_img]),
            headers={
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=604800, s-maxage=604800"
            }
        )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch image")

    image_bytes = response.content
    set_cache(url, image_bytes)

    return StreamingResponse(
        iter([image_bytes]),
        headers={
            "Content-Type": response.headers.get("content-type", "image/jpeg"),
            "Cache-Control": "public, max-age=604800, s-maxage=604800"
        }
    )
