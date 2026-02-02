import certifi
from pymongo import MongoClient
from django.conf import settings

class MongoService:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoService, cls).__new__(cls)
            try:
                # Use certifi for SSL certificates to avoid "SSL handshake failed" errors
                cls._client = MongoClient(
                    settings.MONGO_URI,
                    tlsCAFile=certifi.where()
                )
                # Force a connection check
                cls._client.server_info()
                cls._db = cls._client[settings.MONGO_DB_NAME]
                print(f"✅ MongoDB connected successfully to: {settings.MONGO_DB_NAME}")
            except Exception as e:
                print(f"❌ MongoDB Connection Error: {e}")
                cls._db = None
        return cls._instance

    @property
    def db(self):
        return self._db

    def get_collection(self, collection_name):
        if self._db is None:
            raise Exception("MongoDB is not connected. Please check your MONGO_URI setting.")
        return self._db[collection_name]

# Singleton instance
mongo_service = MongoService()
