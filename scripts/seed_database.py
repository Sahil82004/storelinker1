from pymongo import MongoClient
import json
from datetime import datetime, timedelta

# MongoDB connection string
MONGODB_URI = "mongodb+srv://admin:admin123@storelinker.eqk7l.mongodb.net/?retryWrites=true&w=majority&appName=Storelinker"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.Storelinker

# Sample vendor data
vendors_data = [
    {
        "name": "Dinojames Official",
        "email": "dinojames@example.com",
        "password": "123456789",
        "userType": "vendor",
        "phone": "+91-9876543210",
        "address": "123 Tech Street, Electronics Hub",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "storeName": "Dinojames Official",
        "isActive": True
    },
    {
        "name": "Apple Premium Store",
        "email": "apple@example.com",
        "password": "hashed_password_2",
        "userType": "vendor",
        "phone": "+91-9876543211",
        "address": "456 Innovation Ave, Tech Park",
        "city": "Bangalore",
        "state": "Karnataka",
        "zipCode": "560001",
        "storeName": "Apple Premium Store",
        "isActive": True
    },
    {
        "name": "Nike Store",
        "email": "nike@example.com",
        "password": "hashed_password_3",
        "userType": "vendor",
        "phone": "+91-9876543212",
        "address": "789 Fashion Street, Style District",
        "city": "Delhi",
        "state": "Delhi",
        "zipCode": "110001",
        "storeName": "Nike Store",
        "isActive": True
    },
    {
        "name": "Samsung Smart Plaza",
        "email": "samsung@example.com",
        "password": "hashed_password_4",
        "userType": "vendor",
        "phone": "+91-9876543213",
        "address": "321 Home Avenue, Appliance District",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "zipCode": "600001",
        "storeName": "Samsung Smart Plaza",
        "isActive": True
    },
    {
        "name": "Urban Ladder Home Store",
        "email": "urbanladder@example.com",
        "password": "hashed_password_5",
        "userType": "vendor",
        "phone": "+91-9876543214",
        "address": "567 Comfort Lane, Furniture Hub",
        "city": "Hyderabad",
        "state": "Telangana",
        "zipCode": "500001",
        "storeName": "Urban Ladder Home Store",
        "isActive": True
    }
]

# Sample product data
products_data = [
    {
        "name": "Dinojames 2mm Batch Coding Machine - Letter & Number Printer",
        "category": "electronics",
        "price": 2498,
        "originalPrice": 3500,
        "rating": 4.5,
        "reviewCount": 40,
        "discount": 29,
        "vendorId": None,
        "image": "https://m.media-amazon.com/images/I/71cX92XQKIL._SL1500_.jpg",
        "description": "Professional 2mm Batch Coding Machine for printing letters and numbers. Perfect for industrial use.",
        "isActive": True
    },
    {
        "name": "Apple MacBook Pro 14-inch",
        "category": "electronics",
        "price": 149900,
        "originalPrice": 169900,
        "rating": 4.8,
        "reviewCount": 256,
        "discount": 12,
        "vendorId": None,
        "image": "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg",
        "description": "Apple M2 Pro chip, 16GB RAM, 512GB SSD, 14-inch Liquid Retina XDR display",
        "isActive": True
    },
    {
        "name": "Nike Air Max 270",
        "category": "fashion",
        "price": 12995,
        "originalPrice": 15995,
        "rating": 4.5,
        "reviewCount": 320,
        "discount": 19,
        "vendorId": None,
        "image": "https://m.media-amazon.com/images/I/71uGspZGKiL._UL1500_.jpg",
        "description": "Nike Air Max 270 Running Shoes with Air cushioning for maximum comfort",
        "isActive": True
    },
    {
        "name": "Samsung French Door Refrigerator",
        "category": "electronics",
        "price": 89990,
        "originalPrice": 119900,
        "rating": 4.6,
        "reviewCount": 152,
        "discount": 25,
        "vendorId": None,
        "image": "https://m.media-amazon.com/images/I/71YEJjQH-rL._SL1500_.jpg",
        "description": "679L French Door Refrigerator with Digital Inverter Technology",
        "isActive": True
    },
    {
        "name": "Urban Ladder L-Shaped Sofa",
        "category": "furniture",
        "price": 45999,
        "originalPrice": 89999,
        "rating": 4.4,
        "reviewCount": 89,
        "discount": 49,
        "vendorId": None,
        "image": "https://m.media-amazon.com/images/I/71cFPYYxv-L._SL1500_.jpg",
        "description": "Modern L-Shaped Fabric Sectional Sofa with Ottoman (Grey)",
        "isActive": True
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
    },
{
    "name": "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    "category": "electronics",
    "price": 349.99,
    "originalPrice": 399.99,
    "rating": 4.7,
    "reviewCount": 3865,
    "discount": 12.5,
    "vendorId": 101,
    "image": "https://example.com/images/sony-wh1000xm5.jpg",
    "description": "Premium wireless headphones with industry-leading noise cancellation, exceptional sound quality, and up to 30 hours of battery life.",
    "isActive": True
  },
  {
    "name": "Samsung Galaxy S23 Ultra",
    "category": "electronics",
    "price": 1199.99,
    "originalPrice": 1299.99,
    "rating": 4.6,
    "reviewCount": 7532,
    "discount": 7.7,
    "vendorId": 102,
    "image": "https://example.com/images/samsung-s23-ultra.jpg",
    "description": "Flagship smartphone featuring a 6.8-inch Dynamic AMOLED display, S Pen support, 200MP camera, and Snapdragon 8 Gen 2 processor.",
    "isActive": True
  },
  {
    "name": "Apple iPad Air (5th Gen, 64GB, Wi-Fi, Space Grey)",
    "category": "electronics",
    "price": 599.99,
    "originalPrice": 649.99,
    "rating": 4.8,
    "reviewCount": 5421,
    "discount": 7.7,
    "vendorId": 103,
    "image": "https://example.com/images/ipad-air-5.jpg",
    "description": "Powerful tablet with M1 chip, 10.9-inch Liquid Retina display, and all-day battery life in an ultra-portable design.",
    "isActive": True
  },
  {
    "name": "Canon EOS R6 Mirrorless Camera",
    "category": "electronics",
    "price": 2299.99,
    "originalPrice": 2499.99,
    "rating": 4.7,
    "reviewCount": 1258,
    "discount": 8.0,
    "vendorId": 104,
    "image": "https://example.com/images/canon-eos-r6.jpg",
    "description": "Professional-grade full-frame mirrorless camera with 20.1MP sensor, 4K video capabilities, and advanced autofocus system.",
    "isActive": True
  },
  {
    "name": "Dyson V11 Absolute Pro Cord-Free Vacuum Cleaner",
    "category": "electronics",
    "price": 699.99,
    "originalPrice": 749.99,
    "rating": 4.6,
    "reviewCount": 3742,
    "discount": 6.7,
    "vendorId": 105,
    "image": "https://example.com/images/dyson-v11.jpg",
    "description": "Powerful cordless vacuum with intelligent suction control, LCD screen, and up to 60 minutes of fade-free cleaning power.",
    "isActive": True
  },
  {
    "name": "LG 55-inch 4K OLED Smart TV (OLED55C1PTZ)",
    "category": "electronics",
    "price": 1499.99,
    "originalPrice": 1799.99,
    "rating": 4.8,
    "reviewCount": 2856,
    "discount": 16.7,
    "vendorId": 106,
    "image": "https://example.com/images/lg-oled55c1.jpg",
    "description": "Premium OLED TV with self-lit pixels, webOS smart platform, and filmmaker mode for cinema-quality viewing experience.",
    "isActive": True
  },
  {
    "name": "Fitbit Charge 5 Advanced Fitness & Health Tracker",
    "category": "electronics",
    "price": 149.99,
    "originalPrice": 179.99,
    "rating": 4.4,
    "reviewCount": 6721,
    "discount": 16.7,
    "vendorId": 107,
    "image": "https://example.com/images/fitbit-charge5.jpg",
    "description": "Advanced fitness tracker with built-in GPS, heart rate monitoring, stress management tools, and sleep tracking.",
    "isActive": True
  },
  {
    "name": "GoPro HERO10 Black Action Camera",
    "category": "electronics",
    "price": 399.99,
    "originalPrice": 449.99,
    "rating": 4.7,
    "reviewCount": 3254,
    "discount": 11.1,
    "vendorId": 108,
    "image": "https://example.com/images/gopro-hero10.jpg",
    "description": "Rugged action camera with 5.3K video, 23MP photos, HyperSmooth 4.0 stabilization, and waterproof design.",
    "isActive": True
  },
  {
    "name": "Philips Hue White and Color Ambiance Starter Kit",
    "category": "electronics",
    "price": 199.99,
    "originalPrice": 229.99,
    "rating": 4.6,
    "reviewCount": 4528,
    "discount": 13.0,
    "vendorId": 109,
    "image": "https://example.com/images/philips-hue-starter.jpg",
    "description": "Smart lighting system with bridge and color-changing bulbs that can be controlled via app or voice assistants.",
    "isActive": True
  },
  {
    "name": "Seagate 5TB Backup Plus Portable External Hard Drive",
    "category": "electronics",
    "price": 119.99,
    "originalPrice": 149.99,
    "rating": 4.5,
    "reviewCount": 8745,
    "discount": 20.0,
    "vendorId": 110,
    "image": "https://example.com/images/seagate-5tb.jpg",
    "description": "High-capacity portable storage solution with USB 3.0 connectivity and automatic backup software for Windows and Mac.",
    "isActive": True
  },
  {
    "name": "Apple AirPods Pro (2nd Gen) with MagSafe Charging",
    "category": "electronics",
    "price": 249.99,
    "originalPrice": 279.99,
    "rating": 4.7,
    "reviewCount": 15432,
    "discount": 10.7,
    "vendorId": 111,
    "image": "https://example.com/images/airpods-pro2.jpg",
    "description": "Premium wireless earbuds with active noise cancellation, spatial audio, and adaptive EQ for immersive sound experience.",
    "isActive": True
  },
  {
    "name": "ASUS ROG Strix G16 Gaming Laptop",
    "category": "electronics",
    "price": 1799.99,
    "originalPrice": 1999.99,
    "rating": 4.6,
    "reviewCount": 1876,
    "discount": 10.0,
    "vendorId": 112,
    "image": "https://example.com/images/asus-rog-strix.jpg",
    "description": "Powerful gaming laptop featuring Intel Core i9 processor, NVIDIA RTX 4070 graphics, and high-refresh display for competitive gaming.",
    "isActive": True
  },
  {
    "name": "Bose SoundLink Revolve+ II Portable Bluetooth Speaker",
    "category": "electronics",
    "price": 299.99,
    "originalPrice": 329.99,
    "rating": 4.7,
    "reviewCount": 4215,
    "discount": 9.1,
    "vendorId": 113,
    "image": "https://example.com/images/bose-revolve-plus.jpg",
    "description": "Premium 360-degree Bluetooth speaker with deep, loud sound, water-resistant design, and up to 17 hours of battery life.",
    "isActive": True
  },
  {
    "name": "DJI Mini 3 Pro Drone with 4K Camera",
    "category": "electronics",
    "price": 759.99,
    "originalPrice": 799.99,
    "rating": 4.8,
    "reviewCount": 2543,
    "discount": 5.0,
    "vendorId": 114,
    "image": "https://example.com/images/dji-mini3-pro.jpg",
    "description": "Lightweight drone with 4K HDR video, 48MP photos, and advanced flight features in an ultra-portable, sub-249g design.",
    "isActive": True
  },
  {
    "name": "Razer DeathAdder V3 Pro Wireless Gaming Mouse",
    "category": "electronics",
    "price": 149.99,
    "originalPrice": 169.99,
    "rating": 4.6,
    "reviewCount": 3825,
    "discount": 11.8,
    "vendorId": 115,
    "image": "https://example.com/images/razer-deathadder.jpg",
    "description": "Professional-grade wireless gaming mouse with high-precision optical sensor, 90-hour battery life, and ergonomic design.",
    "isActive": True
  },
  {
    "name": "Nike Air Max 270 Running Shoes",
    "category": "fashion",
    "price": 149.99,
    "originalPrice": 169.99,
    "rating": 4.5,
    "reviewCount": 12456,
    "discount": 11.8,
    "vendorId": 201,
    "image": "https://example.com/images/nike-airmax270.jpg",
    "description": "Stylish running shoes with large Air unit in the heel for exceptional cushioning and breathable mesh upper for comfort.",
    "isActive": True
  },
  {
    "name": "Adidas Ultraboost 22 Sneakers",
    "category": "fashion",
    "price": 179.99,
    "originalPrice": 189.99,
    "rating": 4.7,
    "reviewCount": 9823,
    "discount": 5.3,
    "vendorId": 202,
    "image": "https://example.com/images/adidas-ultraboost22.jpg",
    "description": "Premium running shoes with responsive Boost midsole, Primeknit+ upper, and Continental rubber outsole for superior grip.",
    "isActive": True
  },
  {
    "name": "Puma Men's Track Jacket",
    "category": "fashion",
    "price": 59.99,
    "originalPrice": 79.99,
    "rating": 4.3,
    "reviewCount": 3654,
    "discount": 25.0,
    "vendorId": 203,
    "image": "https://example.com/images/puma-track-jacket.jpg",
    "description": "Sporty track jacket with iconic Puma branding, comfortable fabric, and zippered pockets for everyday casual wear.",
    "isActive": True
  },
  {
    "name": "Ray-Ban Aviator Sunglasses (Gold/Green)",
    "category": "fashion",
    "price": 159.99,
    "originalPrice": 179.99,
    "rating": 4.8,
    "reviewCount": 18765,
    "discount": 11.1,
    "vendorId": 204,
    "image": "https://example.com/images/rayban-aviator.jpg",
    "description": "Iconic aviator sunglasses with gold metal frame, green G-15 lenses, and timeless design that offers 100% UV protection.",
    "isActive": True
  },
  {
    "name": "Levi's 511 Slim Fit Jeans (Blue Denim)",
    "category": "fashion",
    "price": 69.99,
    "originalPrice": 89.99,
    "rating": 4.6,
    "reviewCount": 25478,
    "discount": 22.2,
    "vendorId": 205,
    "image": "https://example.com/images/levis-511.jpg",
    "description": "Classic slim fit jeans with modern design, sits below waist, slim through thigh with narrow leg for versatile everyday style.",
    "isActive": True
  },
  {
    "name": "Tommy Hilfiger Leather Wallet",
    "category": "fashion",
    "price": 44.99,
    "originalPrice": 59.99,
    "rating": 4.5,
    "reviewCount": 7689,
    "discount": 25.0,
    "vendorId": 206,
    "image": "https://example.com/images/tommy-wallet.jpg",
    "description": "Stylish genuine leather bifold wallet with multiple card slots, bill compartment, and iconic Tommy Hilfiger logo.",
    "isActive": True
  },
  {
    "name": "Casio G-Shock GA-2100 Watch",
    "category": "fashion",
    "price": 99.99,
    "originalPrice": 119.99,
    "rating": 4.7,
    "reviewCount": 9254,
    "discount": 16.7,
    "vendorId": 207,
    "image": "https://example.com/images/casio-gshock.jpg",
    "description": "Rugged octagonal watch with carbon core guard structure, 200m water resistance, and analog-digital display.",
    "isActive": True
  },
  {
    "name": "H&M Cotton Oversized Hoodie (Black)",
    "category": "fashion",
    "price": 29.99,
    "originalPrice": 39.99,
    "rating": 4.4,
    "reviewCount": 6521,
    "discount": 25.0,
    "vendorId": 208,
    "image": "https://example.com/images/hm-hoodie.jpg",
    "description": "Comfortable oversized hoodie made from soft cotton blend with kangaroo pocket and drawstring hood.",
    "isActive": True
  },
  {
    "name": "Urban Ladder L-Shaped Sofa (Grey)",
    "category": "home",
    "price": 1299.99,
    "originalPrice": 1599.99,
    "rating": 4.4,
    "reviewCount": 586,
    "discount": 18.8,
    "vendorId": 301,
    "image": "https://example.com/images/urban-ladder-sofa.jpg",
    "description": "Spacious L-shaped sofa with premium grey upholstery, solid wood frame, and high-density foam cushions for ultimate comfort.",
    "isActive": True
  },
  {
    "name": "Dyson Pure Cool Air Purifier & Fan",
    "category": "home",
    "price": 499.99,
    "originalPrice": 549.99,
    "rating": 4.6,
    "reviewCount": 2187,
    "discount": 9.1,
    "vendorId": 302,
    "image": "https://example.com/images/dyson-purecool.jpg",
    "description": "Two-in-one device that purifies the air year-round and cools you effectively in hot weather with Air Multiplier technology.",
    "isActive": True
  },
  {
    "name": "Philips Hue Smart LED Light Strip",
    "category": "home",
    "price": 79.99,
    "originalPrice": 99.99,
    "rating": 4.5,
    "reviewCount": 5432,
    "discount": 20.0,
    "vendorId": 303,
    "image": "https://example.com/images/philips-hue-strip.jpg",
    "description": "Flexible smart LED strip that can be shaped and extended, offering 16 million colors and seamless smart home integration.",
    "isActive": True
  },
  {
    "name": "IKEA MALM Queen Size Bed Frame",
    "category": "home",
    "price": 249.99,
    "originalPrice": 279.99,
    "rating": 4.3,
    "reviewCount": 8764,
    "discount": 10.7,
    "vendorId": 304,
    "image": "https://example.com/images/ikea-malm.jpg",
    "description": "Minimalist queen bed frame with clean lines, veneer finish, and adjustable bed sides for mattresses of different thicknesses.",
    "isActive": True
  },
  {
    "name": "Weber Spirit II E-310 Gas Grill",
    "category": "home",
    "price": 569.99,
    "originalPrice": 629.99,
    "rating": 4.7,
    "reviewCount": 3421,
    "discount": 9.5,
    "vendorId": 305,
    "image": "https://example.com/images/weber-spirit.jpg",
    "description": "High-performance gas grill with three burners, 529 square inches of cooking space, and GS4 grilling system for even cooking.",
    "isActive": True
  },
  {
    "name": "Foreo Luna 3 Facial Cleansing Brush",
    "category": "beauty",
    "price": 199.99,
    "originalPrice": 219.99,
    "rating": 4.7,
    "reviewCount": 3452,
    "discount": 9.1,
    "vendorId": 401,
    "image": "https://example.com/images/foreo-luna3.jpg",
    "description": "Smart facial cleansing device with soft silicone bristles and T-Sonic pulsations for deep yet gentle cleansing.",
    "isActive": True
  },
  {
    "name": "Philips Norelco OneBlade Electric Shaver",
    "category": "beauty",
    "price": 39.99,
    "originalPrice": 49.99,
    "rating": 4.5,
    "reviewCount": 14562,
    "discount": 20.0,
    "vendorId": 402,
    "image": "https://example.com/images/philips-oneblade.jpg",
    "description": "Hybrid electric shaver and trimmer with unique OneBlade technology that can trim, edge, and shave any length of hair.",
    "isActive": True
  },
  {
    "name": "Olaplex No. 3 Hair Perfector",
    "category": "beauty",
    "price": 28.99,
    "originalPrice": 34.99,
    "rating": 4.8,
    "reviewCount": 18745,
    "discount": 17.1,
    "vendorId": 403,
    "image": "https://example.com/images/olaplex-no3.jpg",
    "description": "Award-winning pre-shampoo treatment that reduces breakage and visibly strengthens hair, improving its look and feel.",
    "isActive": True
  },
  {
    "name": "Dyson Airwrap Complete Styler",
    "category": "beauty",
    "price": 599.99,
    "originalPrice": 629.99,
    "rating": 4.6,
    "reviewCount": 7865,
    "discount": 4.8,
    "vendorId": 456,
    "image": "https://example.com/images/dyson-airwrap.jpg",
    "description": "Revolutionary styling tool with Coanda air technology for curling, waving, smoothing, and drying without extreme heat damage.",
    "isActive": True
  },
  {
    "name": "CeraVe Hydrating Facial Cleanser (473ml)",
    "category": "beauty",
    "price": 14.99,
    "originalPrice": 18.99,
    "rating": 4.7,
    "reviewCount": 25874,
    "discount": 21.1,
    "vendorId": 405,
    "image": "https://example.com/images/cerave-cleanser.jpg",
    "description": "Gentle, non-foaming cleanser with ceramides and hyaluronic acid that cleanses, hydrates, and helps restore the protective skin barrier.",
    "isActive": True
  },
  {
    "name": "LEGO Technic Ferrari 488 GTE Racing Car",
    "category": "toys",
    "price": 169.99,
    "originalPrice": 199.99,
    "rating": 4.8,
    "reviewCount": 1875,
    "discount": 15.0,
    "vendorId": 501,
    "image": "https://example.com/images/lego-ferrari.jpg",
    "description": "Authentic replica of the famous racing car with realistic features including moving pistons, steering, and suspension.",
    "isActive": True
  },
  {
    "name": "Monopoly Classic Board Game",
    "category": "toys",
    "price": 19.99,
    "originalPrice": 24.99,
    "rating": 4.6,
    "reviewCount": 15478,
    "discount": 20.0,
    "vendorId": 502,
    "image": "https://example.com/images/monopoly.jpg",
    "description": "Classic family board game of buying, selling, and trading properties to become the wealthiest player.",
    "isActive": True
  },
  {
    "name": "PlayStation 5 (Disc Edition)",
    "category": "toys",
    "price": 499.99,
    "originalPrice": 499.99,
    "rating": 4.8,
    "reviewCount": 24586,
    "discount": 0,
    "vendorId": 503,
    "image": "https://example.com/images/playstation5.jpg",
    "description": "Next-generation gaming console featuring ultra-high-speed SSD, ray tracing, 4K gaming, and haptic feedback controller.",
    "isActive": True
  },
  {
    "name": "Nintendo Switch OLED Model",
    "category": "toys",
    "price": 349.99,
    "originalPrice": 369.99,
    "rating": 4.7,
    "reviewCount": 18965,
    "discount": 5.4,
    "vendorId": 504,
    "image": "https://example.com/images/nintendo-switch-oled.jpg",
    "description": "Versatile gaming system featuring a vibrant 7-inch OLED screen, enhanced audio, and wired LAN port in the dock.",
    "isActive": True
  },
  {
    "name": "Xiaomi Mi Electric Scooter Pro 2",
    "category": "toys",
    "price": 599.99,
    "originalPrice": 649.99,
    "rating": 4.5,
    "reviewCount": 4523,
    "discount": 7.7,
    "vendorId": 505,
    "image": "https://example.com/images/xiaomi-scooter.jpg",
    "description": "Powerful electric scooter with 45km range, 25km/h top speed, dual braking system, and built-in display for urban commuting.",
    "isActive": True
  },
  {
    "name": "Atomic Habits by James Clear",
    "category": "Books & Media",
    "price": 16.99,
    "originalPrice": 21.99,
    "rating": 4.8,
    "reviewCount": 45821,
    "discount": 22.7,
    "vendorId": 601,
    "image": "https://example.com/images/atomic-habits.jpg",
    "description": "Bestselling book about building good habits and breaking bad ones with a proven framework for improving every day.",
    "isActive": True
  },
  {
    "name": "The Psychology of Money by Morgan Housel",
    "category": "books",
    "price": 14.99,
    "originalPrice": 19.99,
    "rating": 4.7,
    "reviewCount": 28745,
    "discount": 25.0,
    "vendorId": 602,
    "image": "https://example.com/images/psychology-money.jpg",
    "description": "Timeless lessons on wealth, greed, and happiness exploring the unusual ways people think about money and how to make better sense of it.",
    "isActive": True
  },
  {
    "name": "Sapiens: A Brief History of Humankind",
    "category": "books",
    "price": 15.99,
    "originalPrice": 19.99,
    "rating": 4.7,
    "reviewCount": 35482,
    "discount": 20.0,
    "vendorId": 603,
    "image": "https://example.com/images/sapiens.jpg",
    "description": "Groundbreaking narrative of humanity's creation and evolution exploring how biology and history have defined us and enhanced our understanding of what it means to be human.",
    "isActive": True
  },
  {
    "name": "The Alchemist by Paulo Coelho",
    "category": "books",
    "price": 12.99,
    "originalPrice": 16.99,
    "rating": 4.7,
    "reviewCount": 42156,
    "discount": 23.5,
    "vendorId": 604,
    "image": "https://example.com/images/alchemist.jpg",
    "description": "Mystical story about an Andalusian shepherd boy who yearns to travel in search of a worldly treasure, discovering his personal legend along the way.",
    "isActive": True
  },
  {
    "name": "Rich Dad Poor Dad by Robert Kiyosaki",
    "category": "books",
    "price": 12.99,
    "originalPrice": 17.99,
    "rating": 4.6,
    "reviewCount": 38745,
    "discount": 27.8,
    "vendorId": 605,
    "image": "https://example.com/images/rich-dad.jpg",
    "description": "Personal finance classic challenging conventional wisdom about money and explaining what the wealthy teach their children about money that others do not.",
    "isActive": True
  },
  {
    "name": "CEAT SecuraDrive Car Tyres (195/65 R15 91H)",
    "category": "automotive",
    "price": 89.99,
    "originalPrice": 109.99,
    "rating": 4.4,
    "reviewCount": 1245,
    "discount": 18.2,
    "vendorId": 701,
    "image": "https://example.com/images/ceat-tires.jpg",
    "description": "Premium car tires designed for superior grip on wet roads, reduced noise, and enhanced fuel efficiency for mid-sized vehicles.",
    "isActive": True
  },
  {
    "name": "Michelin Pilot Sport 4S Performance Tyre",
    "category": "automotive",
    "price": 249.99,
    "originalPrice": 279.99,
    "rating": 4.8,
    "reviewCount": 3654,
    "discount": 10.7,
    "vendorId": 702,
    "image": "https://example.com/images/michelin-ps4s.jpg",
    "description": "High-performance tire combining exceptional grip, precise steering, and long tread life for sports cars and performance sedans.",
    "isActive": True
  },
  {
    "name": "Bosch C7 Car Battery Charger",
    "category": "automotive",
    "price": 99.99,
    "originalPrice": 119.99,
    "rating": 4.6,
    "reviewCount": 2178,
    "discount": 16.7,
    "vendorId": 703,
    "image": "https://example.com/images/bosch-c7.jpg",
    "description": "Versatile battery charger and maintainer with multiple modes for car, motorcycle, and marine batteries, featuring overcharge protection.",
    "isActive": True
  },
  {
    "name": "Armor All Complete Car Care Kit",
    "category": "automotive",
    "price": 34.99,
    "originalPrice": 44.99,
    "rating": 4.5,
    "reviewCount": 4587,
    "discount": 22.2,
    "vendorId": 704,
    "image": "https://example.com/images/armorall-kit.jpg",
    "description": "Comprehensive cleaning kit with protectant, glass cleaner, wheel cleaner, and microfiber towels for complete vehicle detailing.",
    "isActive": True
  },
  {
    "name": "Castrol EDGE 5W-40 Fully Synthetic Engine Oil (4L)",
    "category": "automotive",
    "price": 59.99,
    "originalPrice": 69.99,
    "rating": 4.7,
    "reviewCount": 5421,
    "discount": 14.3,
    "vendorId": 705,
    "image": "https://example.com/images/castrol-edge.jpg",
    "description": "Advanced full synthetic motor oil with Fluid Titanium Technology that transforms under pressure for maximum engine performance.",
    "isActive": True
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
        # Clear existing data from all collections
        db.users.delete_many({})
        db.products.delete_many({})
        db.stores.delete_many({})
        
        # Insert vendors and get their IDs
        vendor_results = db.users.insert_many(vendors_data)
        vendor_ids = vendor_results.inserted_ids
        
        # Update product vendorIds
        for i, product in enumerate(products_data):
            product['vendorId'] = vendor_ids[i % len(vendor_ids)]
        
        # Insert products
        product_results = db.products.insert_many(products_data)
        
        # Create stores from vendor data
        stores_data = [
            {
                "vendorId": vendor['_id'],
                "name": vendor['storeName'],
                "address": vendor['address'],
                "city": vendor['city'],
                "state": vendor['state'],
                "zipCode": vendor['zipCode'],
                "phone": vendor['phone'],
                "isActive": vendor['isActive']
            }
            for vendor in vendors_data
        ]
        
        # Insert stores
        store_results = db.stores.insert_many(stores_data)
        
        print("Database seeded successfully!")
        print(f"Inserted {len(vendors_data)} vendors")
        print(f"Inserted {len(products_data)} products")
        print(f"Inserted {len(stores_data)} stores")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_database() 