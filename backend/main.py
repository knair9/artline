# from fastapi import FastAPI
from artifact import Artifact
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()  # This creates the FastAPI app instance

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # You can later replace "*" with your Vercel URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )



# # Example artifact, manually entered for now
# @app.get("/api/artifacts")
def get_artifact():
    # Create your artifact object
    mona_lisa = Artifact(
        name="Mona Lisa",
        date=1503,
        description="A portrait of Lisa Gherardini by Leonardo da Vinci.",
        location="FlorenceAOFHDF, Italy",
        artist="Leonardo da Vinci",
        source="")
    # Return artifact info as JSON
    return {
        "name": mona_lisa.get_name(),
        "date": mona_lisa.get_date(),
        "description": mona_lisa.get_description(),
        "location": mona_lisa.get_location(),
        "artist": mona_lisa.get_artist(),
        "source": mona_lisa.get_source()
    }


# Example artifact, manually entered for now
example_artifact = Artifact(
    name="Mona Lisa",
    raw_date="c. 1500s (after 1503, before 1506)",
    description="A portrait of Lisa Gherardini by Leonardo da Vinci.",
    location="FlorenceAOFHDNG, Italy",
    artist="Leonardo da Vinci",
    source="https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg")

# Optional: add to a dictionary by year
artifacts_by_year = {}
year = example_artifact.get_tl_year()

if year not in artifacts_by_year:
    artifacts_by_year[year] = []

artifacts_by_year[year].append(example_artifact)

# Print the artifact to confirm
print(f"Artifact for {year}:")
for a in artifacts_by_year[year]:
    print(f"- {a.get_name()} by {a.get_artist()} ({a.get_location()})")




# example_artifact = Artifact(
#     name="Mona Lisa",
#     raw_date="c. 1500s (after 1503, before 1506)",
#     description="A portrait of Lisa Gherardini by Leonardo da Vinci.",
#     location="Florence, Italy",
#     artist="Leonardo da Vinci",
#     source="https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg"
# )

# # Optional: add to a dictionary by year
# artifacts_by_year = {}
# year = example_artifact.get_tl_year()

# if year not in artifacts_by_year:
#     artifacts_by_year[year] = []

# artifacts_by_year[year].append(example_artifact)

# # Print the artifact to confirm
# print(f"Artifact for {year}:")
# for a in artifacts_by_year[year]:
#     print(f"- {a.get_name()} by {a.get_artist()} ({a.get_location()})")