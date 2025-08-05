import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def test_connection():
    # Example: fetch 5 rows from the artifacts table
    data = supabase.table("art_ifacts").select("*").limit(5).execute()
    print(data.data)  # print the rows


if __name__ == "__main__":
    test_connection()
