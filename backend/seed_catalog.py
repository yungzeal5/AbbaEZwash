
import os
import sys
import django
from datetime import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from services.mongo_service import mongo_service

def seed_catalog():
    print("🌱 Starting catalog seeding...")
    collection = mongo_service.get_collection('catalog')
    
    # Clear existing catalog
    collection.delete_many({})
    
    catalog_items = [
        # Bedding & Household Items
        {"name": "Duvet (Big)", "price": 30, "category": "Bedding & Household Items", "variant": "Big"},
        {"name": "Bed Sheets (Small)", "price": 15, "category": "Bedding & Household Items", "variant": "Small"},
        {"name": "Bed Sheets (Big)", "price": 25, "category": "Bedding & Household Items", "variant": "Big"},
        {"name": "Blankets (Small)", "price": 25, "category": "Bedding & Household Items", "variant": "Small"},
        {"name": "Blankets (Big)", "price": 35, "category": "Bedding & Household Items", "variant": "Big"},
        {"name": "Towels (Coloured)", "price": 8, "category": "Bedding & Household Items", "variant": "Coloured"},
        {"name": "Towels (Big)", "price": 12, "category": "Bedding & Household Items", "variant": "Big"},
        
        # Traditional & Cultural Wear
        {"name": "Kaftan", "price": 15, "category": "Traditional & Cultural Wear", "variant": None},
        {"name": "Kaba and Slit (Small)", "price": 15, "category": "Traditional & Cultural Wear", "variant": "Small"},
        {"name": "Kaba and Slit (Big)", "price": 25, "category": "Traditional & Cultural Wear", "variant": "Big"},
        {"name": "Jalabiya", "price": 10, "category": "Traditional & Cultural Wear", "variant": None},
        
        # Casual & Everyday Wear
        {"name": "Round-Neck T-Shirt (Coloured)", "price": 7, "category": "Casual & Everyday Wear", "variant": "Coloured"},
        {"name": "Round-Neck T-Shirt (White)", "price": 9, "category": "Casual & Everyday Wear", "variant": "White"},
        {"name": "Shirt (Regular)", "price": 7, "category": "Casual & Everyday Wear", "variant": "Regular"},
        {"name": "Shirt (White)", "price": 9, "category": "Casual & Everyday Wear", "variant": "White"},
        {"name": "Button-Up Shirt (Coloured)", "price": 8, "category": "Casual & Everyday Wear", "variant": "Coloured"},
        {"name": "Button-Up Shirt (White)", "price": 10, "category": "Casual & Everyday Wear", "variant": "White"},
        {"name": "Shorts", "price": 5, "category": "Casual & Everyday Wear", "variant": None},
        {"name": "Short Jeans (Regular)", "price": 7, "category": "Casual & Everyday Wear", "variant": "Regular"},
        {"name": "Short Jeans (Long)", "price": 9, "category": "Casual & Everyday Wear", "variant": "Long"},
        {"name": "Jean Trousers", "price": 8, "category": "Casual & Everyday Wear", "variant": None},
        {"name": "Hoodie (Coloured)", "price": 10, "category": "Casual & Everyday Wear", "variant": "Coloured"},
        {"name": "Hoodie (White)", "price": 13, "category": "Casual & Everyday Wear", "variant": "White"},
        
        # Ladies’ Wear
        {"name": "Ladies' Dress", "price": 8, "category": "Ladies' Wear", "variant": None},
        
        # Footwear
        {"name": "Sneakers (Regular)", "price": 15, "category": "Footwear", "variant": "Regular"},
        {"name": "Sneakers (White)", "price": 20, "category": "Footwear", "variant": "White"},
        {"name": "Sneakers (Very Dirty)", "price": 30, "category": "Footwear", "variant": "Very Dirty"},
        
        # Special Services
        {"name": "Stain Removal (Mirror Stains)", "price": 7, "category": "Special Services", "variant": "Mirror Stains"},
        {"name": "Stain Removal (Tough Stains)", "price": 10, "category": "Special Services", "variant": "Tough Stains"},
        
        # Packaging & Extras
        {"name": "Laundry Box", "price": 3, "category": "Packaging & Extras", "variant": None},
    ]
    
    # Add timestamps and IDs if needed (though Mongo adds _id)
    for item in catalog_items:
        item["created_at"] = datetime.utcnow()
        item["updated_at"] = datetime.utcnow()
        item["is_active"] = True

    result = collection.insert_many(catalog_items)
    print(f"✅ Successfully seeded {len(result.inserted_ids)} items into the catalog!")

if __name__ == "__main__":
    seed_catalog()
