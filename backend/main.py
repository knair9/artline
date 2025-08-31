from fastapi import FastAPI, Query
from artifact import Artifact
from fastapi.middleware.cors import CORSMiddleware
from met_scraper import get_ten_artifacts_range

app = FastAPI()  # creates the FastAPI app instance

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://art-line.vercel.app"
        "https://art-in-time.vercel.app",
        "https://art-in-time-git-main-knair9s-projects.vercel.app",
        "https://art-in-time-knair9s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/api/artifacts")
def preflight():
    return {"message": "CORS preflight successful"}


@app.get("/api/artifacts")
def get_artifacts(
        start: int = Query(..., description="user start year"),
        end: int = Query(..., description="user end year"),
        classification: str | None = Query(None, description="optional medium filter"),
        country: str | None = Query(None,
                                    description="optional country filter"),
        culture: str | None = Query(None,
                                    description="optional culture filter")):
    artifacts = get_ten_artifacts_range(start,
                                        end,
                                        classification=classification,
                                        country=country,
                                        culture=culture)
    print(f"Fetched {len(artifacts)} artifacts from {start} to {end}")

    return artifacts
