# db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    # Attempt to connect to MongoDB
    client = MongoClient(MONGO_URI)
    # Check the connection by calling the 'server_info' method
    client.server_info()  # This will raise an exception if the connection fails
    db = client.get_database()  # If connection is successful, access the database
    print("MongoDB connection successful!")
except Exception as e:
    # If there's an error, print the error message
    print(f"MongoDB connection failed: {e}")

def get_db():
    return db
