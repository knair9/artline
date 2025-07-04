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
def get_artifacts(
    start: int = Query(..., description="user start year"),
    end: int = Query(..., description="user end year")
):
    artifacts = get_artifacts_range(start, end)
    artifact_list = []
    if artifacts:
        for artifact in artifacts:
            if artifact.get_image():
                artifact_data = {
                    "objectID": artifact.get_objectID(),
                    "objectDate": artifact.get_objectDate(),
                    "beginDate": artifact.get_beginDate(),
                    "endDate": artifact.get_endDate(),
                    "isHighlight": artifact.get_isHighlight(),
                    "isPublicDomain": artifact.get_isPublicDomain(),
                    "image": artifact.get_image(),
                    "image_small": artifact.get_image_small(),
                    "other_images": artifact.get_other_images(),
                    "department": artifact.get_department(),
                    "objectName": artifact.get_objectName(),
                    "title": artifact.get_title(),
                    "culture": artifact.get_culture(),
                    "period": artifact.get_period(),
                    "medium": artifact.get_medium(),
                    "artist": artifact.get_artist(),
                    "met_url":artifact.get_met_url()
                }
                artifact_list.append(artifact_data)
    return artifact_list