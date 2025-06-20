from artifact import Artifact

# Example artifact, manually entered for now
example_artifact = Artifact(
    name="Mona Lisa",
    date=1503,
    description="A portrait of Lisa Gherardini by Leonardo da Vinci.",
    location="Florence, Italy",
    artist="Leonardo da Vinci",
    source="https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg"
)

# Optional: add to a dictionary by year
artifacts_by_year = {}
year = example_artifact.get_date()

if year not in artifacts_by_year:
    artifacts_by_year[year] = []

artifacts_by_year[year].append(example_artifact)

# Print the artifact to confirm
print(f"Artifact for {year}:")
for a in artifacts_by_year[year]:
    print(f"- {a.get_name()} by {a.get_artist()} ({a.get_location()})")