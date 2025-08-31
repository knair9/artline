from fastapi import FastAPI, Query
from artifact import Artifact
from fastapi.middleware.cors import CORSMiddleware
from met_scraper import get_ten_artifacts_range

app = FastAPI()  # creates the FastAPI app instance

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],     # allow any site to read your public GETs
#     allow_methods=["GET", "OPTIONS"],
#     allow_headers=["*"],
#     allow_credentials=False, # required for "*" to be valid
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "https://art-line.vercel.app",
#         "https://artline-git-main-knair9s-projects.vercel.app",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://art-line.vercel.app",  # your prod site
        "http://localhost:3000",        # local dev
    ],
    # allow all Vercel preview URLs for this project (e.g. art-line-git-branch-*.vercel.app)
    allow_origin_regex=r"^https://art-line[-\w]*\.vercel\.app$",
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,           # set True only if you *use cookies*
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
