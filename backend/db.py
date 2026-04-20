from pymongo import MongoClient
import certifi
import os

_mongo_uri = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://tarun9963413:tarun830@cluster0.kflvuwe.mongodb.net/?appName=Cluster0"
)

client = MongoClient(_mongo_uri, tlsCAFile=certifi.where())
db = client["plant_disease_db"]
users_collection = db["users"]
predictions_collection = db["predictions"]
otp_collection = db["otps"]
