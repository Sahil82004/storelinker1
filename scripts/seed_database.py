from pymongo import MongoClient
import json
from datetime import datetime, timedelta

# MongoDB connection string
MONGODB_URI = "mongodb+srv://sahil:sahil123@storelinker.btnxy.mongodb.net/?retryWrites=true&w=majority&appName=STORELINKER"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.storelinker

# Sample data
products_data = [
    {
        "id": 1,
        "name": "Dinojames 2mm Batch Coding Machine - Letter & Number Printer",
        "category": "electronics",
        "price": 2498,
        "originalPrice": 3500,
        "rating": 4.5,
        "reviewCount": 40,
        "discount": 29,
        "store": {
            "name": "Dinojames Official",
            "address": "123 Tech Street, Electronics Hub",
            "rating": 4.3,
            "contact": "+91-9876543210"
        },
        "image": "https://m.media-amazon.com/images/I/71cX92XQKIL._SL1500_.jpg",
        "description": "Professional 2mm Batch Coding Machine for printing letters and numbers. Perfect for industrial use."
    },
    {
        "id": 2,
        "name": "Apple MacBook Pro 14-inch",
        "category": "computers",
        "price": 149900,
        "originalPrice": 169900,
        "rating": 4.8,
        "reviewCount": 256,
        "discount": 12,
        "store": {
            "name": "Apple Premium Store",
            "address": "456 Innovation Ave, Tech Park",
            "rating": 4.9,
            "contact": "+91-9876543211"
        },
        "image": "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg",
        "description": "Apple M2 Pro chip, 16GB RAM, 512GB SSD, 14-inch Liquid Retina XDR display"
    },
    {
        "id": 3,
        "name": "Nike Air Max 270",
        "category": "fashion",
        "price": 12995,
        "originalPrice": 15995,
        "rating": 4.5,
        "reviewCount": 320,
        "discount": 19,
        "store": {
            "name": "Nike Store",
            "address": "789 Fashion Street, Style District",
            "rating": 4.8,
            "contact": "+91-9876543212"
        },
        "image": "https://m.media-amazon.com/images/I/71uGspZGKiL._UL1500_.jpg",
        "description": "Nike Air Max 270 Running Shoes with Air cushioning for maximum comfort"
    },
    {
        "id": 4,
        "name": "Samsung French Door Refrigerator",
        "category": "appliances",
        "price": 89990,
        "originalPrice": 119900,
        "rating": 4.6,
        "reviewCount": 152,
        "discount": 25,
        "store": {
            "name": "Samsung Smart Plaza",
            "address": "321 Home Avenue, Appliance District",
            "rating": 4.7,
            "contact": "+91-9876543213"
        },
        "image": "https://m.media-amazon.com/images/I/71YEJjQH-rL._SL1500_.jpg",
        "description": "679L French Door Refrigerator with Digital Inverter Technology"
    },
    {
        "id": 5,
        "name": "Urban Ladder L-Shaped Sofa",
        "category": "furniture",
        "price": 45999,
        "originalPrice": 89999,
        "rating": 4.4,
        "reviewCount": 89,
        "discount": 49,
        "store": {
            "name": "Urban Ladder Home Store",
            "address": "567 Comfort Lane, Furniture Hub",
            "rating": 4.6,
            "contact": "+91-9876543214"
        },
        "image": "https://m.media-amazon.com/images/I/71cFPYYxv-L._SL1500_.jpg",
        "description": "Modern L-Shaped Fabric Sectional Sofa with Ottoman (Grey)"
    },
    {
        "id": 6,
        "name": "Noise ColorFit Pro 5",
        "category": "electronics",
        "price": 4999,
        "originalPrice": 7999,
        "rating": 4.3,
        "reviewCount": 1205,
        "discount": 38,
        "store": {
            "name": "Noise Official Store",
            "address": "890 Smart Street, Gadget Zone",
            "rating": 4.5,
            "contact": "+91-9876543215"
        },
        "image": "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
        "description": "Smart Watch with 1.96\" AMOLED Display, Bluetooth Calling"
    },
    {
        "id": 7,
        "name": "Wilson Evolution Basketball",
        "category": "sports",
        "price": 2499,
        "originalPrice": 2999,
        "rating": 4.8,
        "reviewCount": 850,
        "discount": 17,
        "store": {
            "name": "Sports Hub India",
            "address": "123 Sports Complex, Athletic Zone",
            "rating": 4.7,
            "contact": "+91-9876543216"
        },
        "image": "https://m.media-amazon.com/images/I/91vdgs5FY4L._AC_SL1500_.jpg",
        "description": "Official size indoor game basketball with moisture-wicking composite leather"
    },
    {
        "id": 8,
        "name": "LEGO Technic Ferrari 488 GTE",
        "category": "toys",
        "price": 16999,
        "originalPrice": 19999,
        "rating": 4.9,
        "reviewCount": 320,
        "discount": 15,
        "store": {
            "name": "LEGO Official Store",
            "address": "456 Toy Avenue, Play District",
            "rating": 4.8,
            "contact": "+91-9876543217"
        },
        "image": "https://m.media-amazon.com/images/I/81DK5H39LyL._AC_SL1500_.jpg",
        "description": "Advanced building set for adults, authentic racing car replica with 1677 pieces"
    },
    {
        "id": 9,
        "name": "Atomic Habits by James Clear",
        "category": "books",
        "price": 399,
        "originalPrice": 599,
        "rating": 4.7,
        "reviewCount": 1250,
        "discount": 33,
        "store": {
            "name": "Bookworm Paradise",
            "address": "789 Reader's Lane, Knowledge Park",
            "rating": 4.6,
            "contact": "+91-9876543218"
        },
        "image": "https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UY218_.jpg",
        "description": "International bestseller on building good habits and breaking bad ones"
    },
    {
        "id": 10,
        "name": "CEAT SecuraDrive Car Tyres",
        "category": "automotive",
        "price": 4599,
        "originalPrice": 5999,
        "rating": 4.4,
        "reviewCount": 280,
        "discount": 23,
        "store": {
            "name": "AutoZone Plus",
            "address": "321 Motor Street, Auto District",
            "rating": 4.5,
            "contact": "+91-9876543219"
        },
        "image": "https://m.media-amazon.com/images/I/81KYwJKP2+L._SL1500_.jpg",
        "description": "195/65 R15 91H Tubeless Car Tyre with superior grip and durability"
    }
]

# Calculate dates for offers
today = datetime.now()
one_month_later = today + timedelta(days=30)
two_weeks_later = today + timedelta(days=14)

offers_data = [
    {
        "id": 1,
        "category": "electronics",
        "title": "Mega Electronics Sale",
        "description": "Up to 75% off on Electronics",
        "validUntil": one_month_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
        "discount": 75,
        "products": [
            {
                "name": "Noise ColorFit Pro 5",
                "price": 4999,
                "originalPrice": 7999,
                "image": "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg"
            }
        ]
    },
    {
        "id": 2,
        "category": "computers",
        "title": "Apple Products Festival",
        "description": "Special discounts on MacBooks and iPads",
        "validUntil": two_weeks_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg",
        "discount": 12,
        "products": [
            {
                "name": "MacBook Pro 14-inch",
                "price": 149900,
                "originalPrice": 169900,
                "image": "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg"
            }
        ]
    },
    {
        "id": 3,
        "category": "fashion",
        "title": "Nike Summer Collection",
        "description": "Latest styles at best prices",
        "validUntil": one_month_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/71uGspZGKiL._UL1500_.jpg",
        "discount": 19,
        "products": [
            {
                "name": "Nike Air Max 270",
                "price": 12995,
                "originalPrice": 15995,
                "image": "https://m.media-amazon.com/images/I/71uGspZGKiL._UL1500_.jpg"
            }
        ]
    },
    {
        "id": 4,
        "category": "appliances",
        "title": "Samsung Home Appliance Sale",
        "description": "Premium appliances at unbeatable prices",
        "validUntil": two_weeks_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/71YEJjQH-rL._SL1500_.jpg",
        "discount": 25,
        "products": [
            {
                "name": "Samsung French Door Refrigerator",
                "price": 89990,
                "originalPrice": 119900,
                "image": "https://m.media-amazon.com/images/I/71YEJjQH-rL._SL1500_.jpg"
            }
        ]
    },
    {
        "id": 5,
        "category": "furniture",
        "title": "Urban Ladder Clearance Sale",
        "description": "Massive discounts on premium furniture",
        "validUntil": one_month_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/71cFPYYxv-L._SL1500_.jpg",
        "discount": 49,
        "products": [
            {
                "name": "Urban Ladder L-Shaped Sofa",
                "price": 45999,
                "originalPrice": 89999,
                "image": "https://m.media-amazon.com/images/I/71cFPYYxv-L._SL1500_.jpg"
            }
        ]
    },
    {
        "id": 6,
        "category": "sports",
        "title": "Sports Equipment Bonanza",
        "description": "Up to 40% off on premium sports gear",
        "validUntil": one_month_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/91vdgs5FY4L._AC_SL1500_.jpg",
        "discount": 40,
        "products": [
            {
                "name": "Wilson Evolution Basketball",
                "price": 2499,
                "originalPrice": 2999,
                "image": "https://m.media-amazon.com/images/I/91vdgs5FY4L._AC_SL1500_.jpg"
            }
        ]
    },
    {
        "id": 7,
        "category": "toys",
        "title": "LEGO Special Collection",
        "description": "Build your dreams with special LEGO discounts",
        "validUntil": two_weeks_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/81DK5H39LyL._AC_SL1500_.jpg",
        "discount": 15,
        "products": [
            {
                "name": "LEGO Technic Ferrari 488 GTE",
                "price": 16999,
                "originalPrice": 19999,
                "image": "https://m.media-amazon.com/images/I/81DK5H39LyL._AC_SL1500_.jpg"
            }
        ]
    },
    {
        "id": 8,
        "category": "books",
        "title": "Bestseller Book Festival",
        "description": "Top reads at amazing prices",
        "validUntil": one_month_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UY218_.jpg",
        "discount": 33,
        "products": [
            {
                "name": "Atomic Habits by James Clear",
                "price": 399,
                "originalPrice": 599,
                "image": "https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UY218_.jpg"
            }
        ]
    },
    {
        "id": 9,
        "category": "automotive",
        "title": "Auto Parts Mega Sale",
        "description": "Great deals on car accessories and parts",
        "validUntil": two_weeks_later.strftime("%Y-%m-%d"),
        "image": "https://m.media-amazon.com/images/I/81KYwJKP2+L._SL1500_.jpg",
        "discount": 23,
        "products": [
            {
                "name": "CEAT SecuraDrive Car Tyres",
                "price": 4599,
                "originalPrice": 5999,
                "image": "https://m.media-amazon.com/images/I/81KYwJKP2+L._SL1500_.jpg"
            }
        ]
    }
]

# Insert data into MongoDB collections
def seed_database():
    try:
        # Clear existing data
        db.products.delete_many({})
        db.offers.delete_many({})
        
        # Insert new data
        db.products.insert_many(products_data)
        db.offers.insert_many(offers_data)
        
        print("Database seeded successfully!")
        print(f"Inserted {len(products_data)} products and {len(offers_data)} offers")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_database() 