const { seedProducts } = require('../services/productService');
const { disconnectFromDatabase } = require('../config/db');

// Mock product data from the existing application
const mockProducts = [
  // Electronics Category
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life. Experience crystal-clear sound quality and ultimate comfort with these over-ear headphones. Perfect for travel, work, or everyday use.',
    price: 8999,
    discountPrice: 6999,
    rating: 4.5,
    reviewCount: 128,
    images: [
      'https://m.media-amazon.com/images/I/61kX6jZxhyL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61Rr8PaGZ0L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71BqnI+rwVL._SX522_.jpg'
    ],
    store: {
      name: 'AudioTech',
      rating: 4.8,
      location: 'Mumbai, India',
      responseTime: '2 hours'
    },
    category: 'electronics',
    stock: 45,
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Bluetooth 5.0 connectivity',
      'Built-in microphone for calls',
      'Foldable design for easy storage'
    ],
    specifications: {
      'Brand': 'AudioTech',
      'Model': 'AT-WH200',
      'Color': 'Black',
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g'
    }
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    description: 'Track your health metrics and workouts with this waterproof smart watch. Monitor heart rate, sleep quality, steps, and more. Connect to your smartphone for notifications and app integration.',
    price: 4999,
    discountPrice: null,
    rating: 4.2,
    reviewCount: 95,
    images: [
      'https://m.media-amazon.com/images/I/61ZXwnqqN4L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61SSVxTSs3L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71J6YuV1H2L._SX522_.jpg'
    ],
    store: {
      name: 'FitGear',
      rating: 4.5,
      location: 'Delhi, India',
      responseTime: '1 hour'
    },
    category: 'electronics',
    stock: 32,
    features: [
      'Heart rate monitoring',
      'Sleep tracking',
      'Water resistant (50m)',
      'GPS tracking',
      '7-day battery life'
    ],
    specifications: {
      'Brand': 'FitGear',
      'Model': 'FG-SW100',
      'Color': 'Black/Silver',
      'Display': '1.3" AMOLED',
      'Battery Life': '7 days',
      'Weight': '45g'
    }
  },
  {
    id: 6,
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with 360° sound and 20-hour battery life. Take your music anywhere with this rugged, portable speaker that delivers impressive sound quality in any environment.',
    price: 3499,
    discountPrice: 2999,
    rating: 4.3,
    reviewCount: 112,
    images: [
      'https://m.media-amazon.com/images/I/61K8FS335JL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71xQ4yimboL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71HXzjwuZEL._SX522_.jpg'
    ],
    store: {
      name: 'AudioTech',
      rating: 4.8,
      location: 'Bangalore, India',
      responseTime: '2 hours'
    },
    category: 'electronics',
    stock: 38,
    features: [
      'Waterproof (IPX7 rated)',
      '360° sound projection',
      '20-hour battery life',
      'Bluetooth 5.0 connectivity',
      'Built-in microphone for calls'
    ],
    specifications: {
      'Brand': 'AudioTech',
      'Model': 'AT-SP100',
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '20 hours',
      'Waterproof Rating': 'IPX7',
      'Weight': '560g'
    }
  },
  {
    id: 7,
    name: '4K Smart TV',
    description: '55-inch 4K Ultra HD Smart TV with built-in streaming apps',
    price: 49999,
    discountPrice: 44999,
    rating: 4.7,
    reviewCount: 203,
    images: [
      'https://m.media-amazon.com/images/I/71vZLIfj5yL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61CGHv6kmWL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71d5fMDvq9L._SX522_.jpg'
    ],
    store: {
      name: 'ElectroWorld',
      rating: 4.6,
      location: 'Chennai, India',
      responseTime: '3 hours'
    },
    category: 'electronics',
    stock: 15,
    features: [
      '4K Ultra HD resolution',
      'Smart TV with built-in apps',
      'Voice control compatibility',
      'Multiple HDMI and USB ports',
      'Dolby Vision and HDR10'
    ],
    specifications: {
      'Brand': 'ElectroWorld',
      'Model': 'EW-TV55',
      'Screen Size': '55 inches',
      'Resolution': '3840 x 2160 (4K)',
      'Refresh Rate': '60Hz',
      'Connectivity': 'Wi-Fi, Bluetooth, HDMI, USB'
    }
  },
  {
    id: 8,
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RGB keyboard and dedicated GPU',
    price: 89999,
    discountPrice: 84999,
    rating: 4.6,
    reviewCount: 87,
    images: [
      'https://m.media-amazon.com/images/I/71HAM46XFSL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71Zf9uUp+GL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61Ze2wc9nyL._SX522_.jpg'
    ],
    store: {
      name: 'TechGaming',
      rating: 4.7,
      location: 'Hyderabad, India',
      responseTime: '2 hours'
    },
    category: 'electronics',
    stock: 10,
    features: [
      'High-performance processor',
      'Dedicated gaming GPU',
      'RGB backlit keyboard',
      'High refresh rate display',
      'Advanced cooling system'
    ],
    specifications: {
      'Brand': 'TechGaming',
      'Model': 'TG-GL15',
      'Processor': 'Intel Core i7',
      'RAM': '16GB DDR4',
      'Storage': '512GB SSD',
      'Graphics': 'NVIDIA RTX 3060'
    }
  },
  
  // Fashion Category
  {
    id: 3,
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable, eco-friendly t-shirt made from 100% organic cotton. Soft, breathable fabric thats perfect for everyday wear. Ethically sourced and sustainably produced',
    price: 999,
    discountPrice: 799,
    rating: 4.7,
    reviewCount: 210,
    images: [
      'https://m.media-amazon.com/images/I/71G3QapQPGL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71poFSdDs5L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71J4Q3tGkIL._SX522_.jpg'
    ],
    store: {
      name: 'EcoClothing',
      rating: 4.9,
      location: 'Portland, OR',
      responseTime: '3 hours'
    },
    category: 'fashion',
    stock: 78,
    features: [
      '100% organic cotton',
      'Eco-friendly dyes',
      'Reinforced stitching',
      'Pre-shrunk fabric',
      'Available in multiple colors'
    ],
    specifications: {
      'Brand': 'EcoClothing',
      'Material': '100% Organic Cotton',
      'Care': 'Machine wash cold',
      'Fit': 'Regular fit',
      'Origin': 'Made in USA'
    }
  },
  {
    id: 5,
    name: 'Leather Crossbody Bag',
    description: 'Stylish genuine leather bag with adjustable strap and multiple compartments. Perfect for everyday use with enough space for essentials while maintaining a sleek profile.',
    price: 2999,
    discountPrice: null,
    rating: 4.6,
    reviewCount: 87,
    images: [
      'https://m.media-amazon.com/images/I/71jEwmZJXZL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71R9zyVZTmL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71mz4XxBkWL._SX522_.jpg'
    ],
    store: {
      name: 'FashionStyle',
      rating: 4.4,
      location: 'Miami, FL',
      responseTime: '2 hours'
    },
    category: 'fashion',
    stock: 15,
    features: [
      'Genuine leather construction',
      'Adjustable shoulder strap',
      'Multiple interior compartments',
      'Secure zipper closure',
      'Durable metal hardware'
    ],
    specifications: {
      'Brand': 'FashionStyle',
      'Material': 'Genuine leather',
      'Dimensions': '10" x 7" x 3"',
      'Strap Length': 'Adjustable up to 24"',
      'Pockets': '3 interior, 1 exterior',
      'Color': 'Brown'
    }
  },
  {
    id: 9,
    name: 'Designer Sunglasses',
    description: 'UV-protected polarized sunglasses with premium frame',
    price: 159.99,
    discountPrice: 129.99,
    rating: 4.4,
    reviewCount: 65,
    images: [
      'https://img.freepik.com/free-photo/elegant-sunglasses-with-dark-lenses_23-2148694037.jpg',
      'https://img.freepik.com/free-photo/sunglasses-with-golden-frame-isolated_23-2148694038.jpg',
      'https://img.freepik.com/free-photo/sunglasses-with-black-frame_23-2148694039.jpg'
    ],
    store: {
      name: 'LuxAccessories',
      rating: 4.5,
      location: 'Beverly Hills, CA',
      responseTime: '1 hour'
    },
    category: 'fashion',
    stock: 22,
    features: [
      'UV400 protection',
      'Polarized lenses',
      'Premium frame material',
      'Scratch-resistant coating',
      'Includes protective case'
    ],
    specifications: {
      'Brand': 'LuxAccessories',
      'Material': 'Metal frame, polycarbonate lenses',
      'UV Protection': 'UV400',
      'Polarized': 'Yes',
      'Frame Size': 'Medium',
      'Color': 'Gold/Black'
    }
  },
  {
    id: 10,
    name: 'Premium Denim Jeans',
    description: 'High-quality stretch denim jeans with perfect fit',
    price: 89.99,
    discountPrice: 69.99,
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://img.freepik.com/free-photo/jeans_1203-8356.jpg',
      'https://img.freepik.com/free-photo/jeans-fabric-texture-background_1388-151.jpg',
      'https://img.freepik.com/free-photo/blue-jeans-texture-background_1194-6240.jpg'
    ],
    store: {
      name: 'DenimWorld',
      rating: 4.7,
      location: 'Dallas, TX',
      responseTime: '4 hours'
    },
    category: 'fashion',
    stock: 35,
    features: [
      'Premium stretch denim',
      'Comfortable fit',
      'Reinforced stitching',
      'Classic 5-pocket design',
      'Available in multiple washes'
    ],
    specifications: {
      'Brand': 'DenimWorld',
      'Material': '98% Cotton, 2% Elastane',
      'Care': 'Machine wash cold',
      'Fit': 'Slim fit',
      'Rise': 'Mid-rise',
      'Closure': 'Button and zipper'
    }
  },
  {
    id: 11,
    name: 'Casual Sneakers',
    description: 'Comfortable everyday sneakers with memory foam insoles',
    price: 79.99,
    discountPrice: null,
    rating: 4.5,
    reviewCount: 118,
    images: [
      'https://img.freepik.com/free-photo/pair-trainers_144627-3799.jpg',
      'https://img.freepik.com/free-photo/sport-running-shoes_1203-3414.jpg',
      'https://img.freepik.com/free-photo/white-sneakers-isolated-white-background_93675-135053.jpg'
    ],
    store: {
      name: 'FootwearPlus',
      rating: 4.6,
      location: 'Boston, MA',
      responseTime: '3 hours'
    },
    category: 'fashion',
    stock: 42,
    features: [
      'Memory foam insoles',
      'Breathable mesh upper',
      'Flexible rubber outsole',
      'Padded collar and tongue',
      'Lightweight design'
    ],
    specifications: {
      'Brand': 'FootwearPlus',
      'Material': 'Synthetic mesh and leather',
      'Sole': 'Rubber',
      'Closure': 'Lace-up',
      'Cushioning': 'Memory foam',
      'Color': 'White/Gray'
    }
  },
  
  // Home & Garden Category
  {
    id: 4,
    name: 'Professional Chef Knife',
    description: 'High-carbon stainless steel chef knife with ergonomic handle. Precision-forged blade for exceptional sharpness and edge retention. Perfect for professional chefs and home cooking enthusiasts.',
    price: 89.99,
    discountPrice: 79.99,
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://img.freepik.com/free-photo/kitchen-utensils-wooden-cutting-board_176474-6309.jpg',
      'https://img.freepik.com/free-photo/knife-set-wooden-board_176474-2385.jpg',
      'https://img.freepik.com/free-photo/knife-cutting-board_1339-1453.jpg'
    ],
    store: {
      name: 'KitchenPro',
      rating: 4.7,
      location: 'Chicago, IL',
      responseTime: '4 hours'
    },
    category: 'home',
    stock: 23,
    features: [
      'High-carbon stainless steel blade',
      'Full tang construction',
      'Ergonomic handle',
      'Precision forged',
      'Balanced weight distribution'
    ],
    specifications: {
      'Brand': 'KitchenPro',
      'Blade Material': 'High-carbon stainless steel',
      'Blade Length': '8 inches',
      'Handle Material': 'Pakkawood',
      'Weight': '250g',
      'Care': 'Hand wash recommended'
    }
  },
  {
    id: 12,
    name: 'Luxury Bedding Set',
    description: 'Premium 100% Egyptian cotton bedding set with duvet cover and pillowcases',
    price: 199.99,
    discountPrice: 169.99,
    rating: 4.9,
    reviewCount: 87,
    images: [
      'https://img.freepik.com/free-photo/pillow-bed-decoration-interior-bedroom_74190-11488.jpg',
      'https://img.freepik.com/free-photo/bedroom-interior-with-bed-comfortable-pillows_169016-4366.jpg',
      'https://img.freepik.com/free-photo/white-bedding-sheets-pillow_1203-2365.jpg'
    ],
    store: {
      name: 'HomeComfort',
      rating: 4.8,
      location: 'San Francisco, CA',
      responseTime: '2 hours'
    },
    category: 'home',
    stock: 18,
    features: [
      '100% Egyptian cotton',
      'High thread count',
      'Luxurious feel',
      'Fade-resistant',
      'Easy care'
    ],
    specifications: {
      'Brand': 'HomeComfort',
      'Material': '100% Egyptian cotton',
      'Thread Count': '800',
      'Set Includes': 'Duvet cover, 2 pillowcases',
      'Care': 'Machine washable',
      'Color': 'White'
    }
  },
  {
    id: 13,
    name: 'Smart Home Security Camera',
    description: 'Wireless security camera with motion detection and night vision',
    price: 129.99,
    discountPrice: 99.99,
    rating: 4.6,
    reviewCount: 112,
    images: [
      'https://img.freepik.com/free-photo/security-camera-house_23-2147985376.jpg',
      'https://img.freepik.com/free-photo/security-camera-wall_1150-6396.jpg',
      'https://img.freepik.com/free-photo/security-camera-system-wall_23-2147985377.jpg'
    ],
    store: {
      name: 'SmartHomeTech',
      rating: 4.7,
      location: 'Austin, TX',
      responseTime: '1 hour'
    },
    category: 'home',
    stock: 25,
    features: [
      'Full HD 1080p video',
      'Night vision',
      'Motion detection alerts',
      'Two-way audio',
      'Cloud storage option'
    ],
    specifications: {
      'Brand': 'SmartHomeTech',
      'Resolution': '1080p Full HD',
      'Field of View': '130°',
      'Night Vision': 'Up to 30ft',
      'Power': 'Wireless (rechargeable battery)',
      'Storage': 'Cloud or local SD card'
    }
  },
  {
    id: 14,
    name: 'Indoor Plant Collection',
    description: 'Set of 3 low-maintenance indoor plants with decorative pots',
    price: 59.99,
    discountPrice: null,
    rating: 4.7,
    reviewCount: 93,
    images: [
      'https://img.freepik.com/free-photo/plant-pot_1203-7723.jpg',
      'https://img.freepik.com/free-photo/potted-plant-home_53876-133017.jpg',
      'https://img.freepik.com/free-photo/beautiful-houseplant-white-background_53876-133021.jpg'
    ],
    store: {
      name: 'GreenThumb',
      rating: 4.9,
      location: 'Denver, CO',
      responseTime: '4 hours'
    },
    category: 'home',
    stock: 30,
    features: [
      'Low maintenance plants',
      'Air purifying varieties',
      'Decorative ceramic pots',
      'Care instructions included',
      'Perfect for home or office'
    ],
    specifications: {
      'Brand': 'GreenThumb',
      'Plant Types': 'Snake Plant, Pothos, ZZ Plant',
      'Pot Material': 'Ceramic',
      'Pot Size': '4-6 inches',
      'Light Needs': 'Low to medium',
      'Water Needs': 'Low'
    }
  },
  // Additional Electronics Products
  {
    id: 15,
    name: 'Smartphone 5G',
    description: 'Latest 5G smartphone with 6.5" AMOLED display, 108MP camera',
    price: 29999,
    discountPrice: 27999,
    rating: 4.6,
    reviewCount: 245,
    images: [
      'https://m.media-amazon.com/images/I/8155RxT5f3L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61L1ItFgFHL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61aD5yAhYKL._SX522_.jpg'
    ],
    store: {
      name: 'MobileTech',
      rating: 4.7,
      location: 'Mumbai, India',
      responseTime: '1 hour'
    },
    category: 'electronics',
    stock: 50,
    features: [
      '5G connectivity',
      '6.5" AMOLED display',
      '108MP main camera',
      '5000mAh battery',
      '128GB storage'
    ],
    specifications: {
      'Brand': 'MobileTech',
      'Model': 'MT-5G-Pro',
      'Display': '6.5" AMOLED',
      'Battery': '5000mAh',
      'Storage': '128GB'
    }
  },
  {
    id: 16,
    name: 'True Wireless Earbuds',
    description: 'Premium TWS earbuds with active noise cancellation',
    price: 4999,
    discountPrice: 3999,
    rating: 4.4,
    reviewCount: 189,
    images: [
      'https://m.media-amazon.com/images/I/61aasAbKvvL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71HOGNxq9eL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71ey9w99YxL._SX522_.jpg'
    ],
    store: {
      name: 'AudioTech',
      rating: 4.8,
      location: 'Delhi, India',
      responseTime: '2 hours'
    },
    category: 'electronics',
    stock: 75,
    features: [
      'Active Noise Cancellation',
      '24-hour battery life',
      'Touch controls',
      'Voice assistant support'
    ],
    specifications: {
      'Brand': 'AudioTech',
      'Model': 'AT-TWS200',
      'Battery Life': '24 hours',
      'Connectivity': 'Bluetooth 5.2'
    }
  },
  {
    id: 17,
    name: 'Digital Camera DSLR',
    description: '24.1MP DSLR camera with 18-55mm lens kit',
    price: 42999,
    discountPrice: 39999,
    rating: 4.7,
    reviewCount: 156,
    images: [
      'https://m.media-amazon.com/images/I/71EWRyqzw0L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61vNtYq13IL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71X-XW2kGvL._SX522_.jpg'
    ],
    store: {
      name: 'CameraWorld',
      rating: 4.6,
      location: 'Bangalore, India',
      responseTime: '3 hours'
    },
    category: 'electronics',
    stock: 25,
    features: [
      '24.1MP APS-C sensor',
      '18-55mm kit lens',
      '4K video recording',
      'Vari-angle touchscreen'
    ],
    specifications: {
      'Brand': 'CameraWorld',
      'Model': 'CW-D200',
      'Sensor': '24.1MP APS-C',
      'Video': '4K/30fps'
    }
  },

  // Additional Fashion Products
  {
    id: 18,
    name: 'Formal Men\'s Shirt',
    description: 'Premium cotton formal shirt with wrinkle-free technology',
    price: 1499,
    discountPrice: 1199,
    rating: 4.5,
    reviewCount: 234,
    images: [
      'https://m.media-amazon.com/images/I/61YSb3zHYML._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61cFXyYmqxL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61JhZb-9wvL._SX522_.jpg'
    ],
    store: {
      name: 'FashionHub',
      rating: 4.5,
      location: 'Chennai, India',
      responseTime: '2 hours'
    },
    category: 'fashion',
    stock: 100,
    features: [
      'Premium cotton',
      'Wrinkle-free',
      'Regular fit',
      'Available in multiple colors'
    ],
    specifications: {
      'Brand': 'FashionHub',
      'Material': '100% Cotton',
      'Care': 'Machine wash',
      'Fit': 'Regular'
    }
  },
  {
    id: 19,
    name: 'Women\'s Handbag',
    description: 'Stylish faux leather handbag with multiple compartments',
    price: 1999,
    discountPrice: 1499,
    rating: 4.3,
    reviewCount: 178,
    images: [
      'https://m.media-amazon.com/images/I/81k0JyF0b1L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/81IXskY3NHL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/81vZaOdxXnL._SX522_.jpg'
    ],
    store: {
      name: 'TrendyBags',
      rating: 4.4,
      location: 'Kolkata, India',
      responseTime: '4 hours'
    },
    category: 'fashion',
    stock: 45,
    features: [
      'Premium faux leather',
      'Multiple compartments',
      'Adjustable strap',
      'Metal hardware'
    ],
    specifications: {
      'Brand': 'TrendyBags',
      'Material': 'Faux Leather',
      'Size': 'Medium',
      'Color': 'Brown'
    }
  },
  {
    id: 20,
    name: 'Sports Running Shoes',
    description: 'Professional running shoes with cushioning technology',
    price: 3499,
    discountPrice: 2999,
    rating: 4.6,
    reviewCount: 312,
    images: [
      'https://m.media-amazon.com/images/I/81xXDjGNe2L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/81Td6KyP1eL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/81r0LN1uXDL._SX522_.jpg'
    ],
    store: {
      name: 'SportsFit',
      rating: 4.7,
      location: 'Pune, India',
      responseTime: '2 hours'
    },
    category: 'fashion',
    stock: 60,
    features: [
      'Cushioning technology',
      'Breathable mesh',
      'Anti-slip sole',
      'Lightweight design'
    ],
    specifications: {
      'Brand': 'SportsFit',
      'Type': 'Running',
      'Material': 'Mesh & Synthetic',
      'Sole': 'Rubber'
    }
  },

  // Additional Home & Garden Products
  {
    id: 21,
    name: 'Air Purifier',
    description: 'Smart air purifier with HEPA filter and air quality monitor',
    price: 12999,
    discountPrice: 10999,
    rating: 4.7,
    reviewCount: 167,
    images: [
      'https://m.media-amazon.com/images/I/61W4P3WQBQL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61vQPgHvLsL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71Vg3KwJ8cL._SX522_.jpg'
    ],
    store: {
      name: 'HomeAppliances',
      rating: 4.6,
      location: 'Hyderabad, India',
      responseTime: '3 hours'
    },
    category: 'home',
    stock: 30,
    features: [
      'HEPA filter',
      'Air quality monitor',
      'Smart controls',
      'Silent operation'
    ],
    specifications: {
      'Brand': 'HomeAppliances',
      'Coverage': '400 sq ft',
      'Filter Life': '12 months',
      'Power': '45W'
    }
  },
  {
    id: 22,
    name: 'Kitchen Mixer Grinder',
    description: '750W mixer grinder with 3 jars and pulse function',
    price: 3999,
    discountPrice: 3499,
    rating: 4.5,
    reviewCount: 423,
    images: [
      'https://m.media-amazon.com/images/I/71BSM8pT9tL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71r3iRk6yqL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71Nd6pSFcZL._SX522_.jpg'
    ],
    store: {
      name: 'KitchenEssentials',
      rating: 4.5,
      location: 'Ahmedabad, India',
      responseTime: '2 hours'
    },
    category: 'home',
    stock: 85,
    features: [
      '750W powerful motor',
      '3 stainless steel jars',
      'Pulse function',
      '5-year warranty'
    ],
    specifications: {
      'Brand': 'KitchenEssentials',
      'Power': '750W',
      'Jars': '3',
      'Speed': '3 speed + pulse'
    }
  },
  {
    id: 23,
    name: 'Automatic Coffee Maker',
    description: '12-cup programmable coffee maker with timer',
    price: 6999,
    discountPrice: 5999,
    rating: 4.4,
    reviewCount: 145,
    images: [
      'https://m.media-amazon.com/images/I/61GHNhAKbbL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71dp5f24TiL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61G-c0R6oML._SX522_.jpg'
    ],
    store: {
      name: 'HomeComfort',
      rating: 4.8,
      location: 'Jaipur, India',
      responseTime: '4 hours'
    },
    category: 'home',
    stock: 40,
    features: [
      '12-cup capacity',
      'Programmable timer',
      'Keep warm function',
      'Auto shut-off'
    ],
    specifications: {
      'Brand': 'HomeComfort',
      'Capacity': '12 cups',
      'Power': '900W',
      'Material': 'Stainless Steel'
    }
  },

  // Additional Electronics
  {
    id: 24,
    name: 'Smart LED TV 43"',
    description: '43-inch Full HD Smart LED TV with Android TV OS',
    price: 29999,
    discountPrice: 26999,
    rating: 4.5,
    reviewCount: 278,
    images: [
      'https://m.media-amazon.com/images/I/71d5fMDvq9L._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71vZLIfj5yL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/71+vYGzF9yL._SX522_.jpg'
    ],
    store: {
      name: 'ElectroWorld',
      rating: 4.6,
      location: 'Lucknow, India',
      responseTime: '3 hours'
    },
    category: 'electronics',
    stock: 35,
    features: [
      'Full HD resolution',
      'Android TV OS',
      '20W speakers',
      'Multiple connectivity options'
    ],
    specifications: {
      'Brand': 'ElectroWorld',
      'Size': '43 inches',
      'Resolution': '1920x1080',
      'OS': 'Android TV'
    }
  },
  {
    id: 25,
    name: 'Wireless Gaming Mouse',
    description: 'RGB gaming mouse with 16000 DPI sensor',
    price: 2999,
    discountPrice: 2499,
    rating: 4.6,
    reviewCount: 189,
    images: [
      'https://m.media-amazon.com/images/I/61UxfXTUyvL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61mpMH5TzkL._SX522_.jpg',
      'https://m.media-amazon.com/images/I/61n0cokZKkL._SX522_.jpg'
    ],
    store: {
      name: 'GamingZone',
      rating: 4.7,
      location: 'Noida, India',
      responseTime: '1 hour'
    },
    category: 'electronics',
    stock: 65,
    features: [
      '16000 DPI sensor',
      'RGB lighting',
      'Wireless connectivity',
      '6 programmable buttons'
    ],
    specifications: {
      'Brand': 'GamingZone',
      'DPI': '16000',
      'Battery Life': '40 hours',
      'Weight': '95g'
    }
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    const result = await seedProducts(mockProducts);
    console.log('Seeding completed:', result);
    await disconnectFromDatabase();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 