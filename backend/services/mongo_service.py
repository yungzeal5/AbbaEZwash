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
        return cls._instance

    def _connect(self):
        """Internal method to establish connection if not already connected."""
        if self._client is None or self._db is None:
            try:
                import certifi
                from pymongo import MongoClient
                from django.conf import settings

                # Use certifi for SSL certificates
                self._client = MongoClient(
                    settings.MONGO_URI,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=5000  # 5 second timeout
                )
                # Force a connection check
                self._client.server_info()
                self._db = self._client[settings.MONGO_DB_NAME]
                print(f"✅ MongoDB connected successfully to: {settings.MONGO_DB_NAME}")
            except Exception as e:
                print(f"❌ MongoDB Connection Error: {e}")
                self._client = None
                self._db = None
                return False
        return True

    @property
    def db(self):
        if not self._connect():
            raise Exception("MongoDB is not connected. Please check your MONGO_URI and network connection.")
        return self._db

    def get_collection(self, collection_name):
        if not self._connect():
            raise Exception(f"MongoDB is not connected. Cannot access collection: {collection_name}")
        return self._db[collection_name]

# Singleton instance
mongo_service = MongoService()
