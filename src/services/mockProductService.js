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
      'https://m.media-amazon.com/images/I/512LuQyL3BL._AC_UF1000,1000_QL80_.jpg',
      'https://m.media-amazon.com/images/I/51nhrPNl63L.jpg'
    ],
    store: {
      name: 'AudioTech',
      rating: 4.8,
      location: 'New York, NY',
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
      'https://m.media-amazon.com/images/I/61h8lcXTyeL.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlRlPo33t1A_vP_5eCJRrFOTSw9HNYESoCsPNu0SulU3eDrhzGGkN-vNnh7xjN0YbKXNM&usqp=CAU'
    ],
    store: {
      name: 'FitGear',
      rating: 4.5,
      location: 'Los Angeles, CA',
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
      'https://m.media-amazon.com/images/I/71Gn7eWoLUL._SX522_.jpg'
    ],
    store: {
      name: 'AudioTech',
      rating: 4.8,
      location: 'New York, NY',
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
      'https://img.freepik.com/free-photo/television-houseplant-table_23-2148995236.jpg',
      'https://img.freepik.com/free-photo/modern-living-room-with-tv-cabinet-wooden-table_41470-3754.jpg',
      'https://img.freepik.com/free-photo/modern-tv-setup-with-remote-control_23-2149057660.jpg'
    ],
    store: {
      name: 'ElectroWorld',
      rating: 4.6,
      location: 'Chicago, IL',
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
      'https://img.freepik.com/free-photo/laptop-with-blank-black-screen-wooden-table_53876-97915.jpg',
      'https://img.freepik.com/free-photo/laptop-with-blank-screen-table_53876-133363.jpg',
      'https://img.freepik.com/free-photo/laptop-with-blank-screen-desk_23-2148026051.jpg'
    ],
    store: {
      name: 'TechGaming',
      rating: 4.7,
      location: 'Seattle, WA',
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

  {
    id: 402,
    name: 'Wireless Headphones with Microphone',
    description: 'Premium wireless headphones with active noise cancellation and built-in microphone. Perfect for music, podcasts, virtual meetings, and calls. Enjoy up to 25 hours of playtime with quick charging capability.',
    price: 4999,
    discountPrice: 3799,
    rating: 4.4,
    reviewCount: 108,
    images: [
      'https://m.media-amazon.com/images/I/71ltns-SeoL.jpg',
      'https://i.ebayimg.com/images/g/CFkAAOSwK2xkU~ro/s-l1600.jpg'
    ],
    store: {
      name: 'MediaMart',
      rating: 4.6,
      location: 'Ahmedabad',
      responseTime: '2 hours'
    },
    category: 'electronics',
    stock: 33,
    features: [
      'Active Noise Cancellation',
      'Bluetooth 5.1 connectivity',
      '25-hour battery life',
      'Built-in microphone',
      'Quick charging'
    ],
    specifications: {
      'Brand': 'MediaMart',
      'Model': 'MM-WH250',
      'Color': 'Black',
      'Connectivity': 'Bluetooth 5.1',
      'Battery Life': '25 hours',
      'Weight': '220g'
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
      'https://img.freepik.com/free-photo/white-t-shirts-with-copy-space_53876-102012.jpg',
      
      
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
      'https://img.freepik.com/free-photo/beautiful-elegance-luxury-fashion-women-bag_74190-4900.jpg',
      
      'https://img.freepik.com/free-photo/beautiful-elegance-luxury-fashion-leather-bag_1203-7655.jpg'
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
    price: 3999,
    discountPrice: 2999,
    rating: 4.4,
    reviewCount: 65,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUSZE9KBpiyIxWUqGpG1l4D4FD5xufuMi4HjtRKDCiG6uvvQBwZrMo0qCFUxcfjmdXMIA&usqp=CAU',
      'https://www.ragndenim.com/cdn/shop/products/MCMS126S043_3_510x@2x.progressive.jpg?v=1648115505'
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
    price: 2499,
    discountPrice: 1999,
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://jimmyluxury.in/cdn/shop/files/IMG_0528copy_091f04b6-e68a-47b9-86bb-c8dd0b1f7951.webp?v=1735897361',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo3XGhtX58B4IacbR93egpwZcGZx0khEoK0KJHFLgA48R0S6bHWCMpkdUtbpr8UXr0Pkc&usqp=CAU',
      'https://i.ebayimg.com/images/g/fEAAAOSweZxjRajs/s-l1200.jpg'
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
    price: 2999,
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
    price: 2499,
    discountPrice: 1999,
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://shrigramorganics.com/wp-content/uploads/2022/06/61uUKflvFCS._SL1200_.jpg',
      'https://m.media-amazon.com/images/I/61WJL9BJgGL._AC_UF894,1000_QL80_.jpg'
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
    price: 50000,
    
    rating: 4.9,
    reviewCount: 87,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8WXiAExmOcqK3Cuaph7_vJukJ1Lx2-AOtpQ&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl3T_GwbeBMKY3Q0Z-GUfdcaDqOPUqu7K3p620aL5d5JsSS-hTLWby6gnKpsAkIHkQNsY&usqp=CAU'
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
    price: 4499,
    discountPrice: 3499,
    rating: 4.6,
    reviewCount: 112,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfUChxccJ8o4Vh7p_4OlXqrjoWhuXuVg9Vcw&s',
      'https://cdn-ilcphnl.nitrocdn.com/qdWSPsgFbBWMzsJuJiaOmbHsPZQZmeTh/assets/images/optimized/explore.quantumfiber.com/wp-content/uploads/2022/11/shutterstock_1038714985-scaled.jpg'
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
    price: 1499,
    discountPrice: null,
    rating: 4.7,
    reviewCount: 93,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-5cjZq38jfzoFeYWHbT2lEUGqBjooYeFrvw&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaxJ6bTHeBVyxd7uUsFKCSzh_u0MYkQnDamw&s'
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
//beauty and health
  
    {
      id: 101,
      name: 'Premium Skincare Set',
      description: 'Complete 5-step skincare routine with cleanser, toner, serum, moisturizer, and sunscreen. Made with natural ingredients for all skin types. Helps reduce fine lines and improve skin texture.',
      price: 3499,
      discountPrice: 2999,
      rating: 4.7,
      reviewCount: 86,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn8Iq_6_aJfTHgACigDZIfXQUbs673Dgi658vYFeiyoE2wYTa2mMtAhjFw70IchOt3pEQ&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdK-vUJ63cbklrHViyK4cOZSmrzFtY7Y4K07qoR5Jtgm1utE33YOzOSuQJsz5u2wyG-Sg&usqp=CAU'
      ],
      store: {
        name: 'GlowEssentials',
        rating: 4.6,
        location: 'Mumbai',
        responseTime: '1 hour'
      },
      category: 'beauty',
      stock: 22,
      features: [
        'Natural ingredients',
        'Paraben-free',
        'Suitable for all skin types',
        'Dermatologically tested',
        'Cruelty-free'
      ],
      specifications: {
        'Brand': 'GlowEssentials',
        'Set Contents': '5 items',
        'Skin Type': 'All',
        'Volume': '50ml each',
        'Shelf Life': '12 months'
      }
    },
    {
      id: 102,
      name: 'Digital Body Weight Scale',
      description: 'Smart bathroom scale with high precision sensors. Measures weight, BMI, body fat, muscle mass, and more. Syncs wirelessly with fitness apps to track your progress.',
      price: 2499,
      discountPrice: 1899,
      rating: 4.4,
      reviewCount: 153,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyNv1_DyaNRfYc4m4MfI19U0OboYP3azuiLQ&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_K7AgKhWKxewIsNL92xKS82CbZjSI6HtYXw&s'
      ],
      store: {
        name: 'HealthMate',
        rating: 4.5,
        location: 'Bangalore',
        responseTime: '3 hours'
      },
      category: 'beauty',
      stock: 38,
      features: [
        'High-precision sensors',
        'Multiple measurement metrics',
        'App connectivity',
        'Large LED display',
        'Auto on/off function'
      ],
      specifications: {
        'Brand': 'HealthMate',
        'Model': 'HM-BS100',
        'Material': 'Tempered glass',
        'Power': '3 AAA batteries',
        'Weight Capacity': 'Up to 180kg',
        'Accuracy': '±0.1kg'
      }
    },
  
  
  // Sports and Outdoors Products
  
    {
      id: 201,
      name: 'Yoga Mat with Carry Strap',
      description: 'Eco-friendly, non-slip yoga mat with alignment markings. Perfect thickness for joint protection and stability. Includes carrying strap for easy transport to your yoga class or workout space.',
      price: 1299,
      discountPrice: 999,
      rating: 4.6,
      reviewCount: 92,
      images: [
        'https://m.media-amazon.com/images/I/61HrNjo+bmL._AC_UY1100_.jpg',
        'https://m.media-amazon.com/images/I/61wpusSgPkL._AC_SL1500_.jpg'
      ],
      store: {
        name: 'FitLife',
        rating: 4.7,
        location: 'Delhi',
        responseTime: '2 hours'
      },
      category: 'sports and outdoors',
      stock: 65,
      features: [
        'Eco-friendly TPE material',
        'Non-slip texture',
        'Alignment markings',
        'Carrying strap included',
        'Easy to clean'
      ],
      specifications: {
        'Brand': 'FitLife',
        'Model': 'FL-YM2023',
        'Material': 'TPE',
        'Thickness': '6mm',
        'Dimensions': '183cm x 61cm',
        'Weight': '0.9kg'
      }
    },
    {
      id: 202,
      name: 'Camping Tent 4-Person',
      description: 'Waterproof 4-person camping tent with quick setup design. Features double-layer construction for all-weather protection. Includes ventilation windows and storage pockets for a comfortable outdoor experience.',
      price: 5999,
      discountPrice: 4499,
      rating: 4.3,
      reviewCount: 78,
      images: [
        'https://rukminim2.flixcart.com/image/850/1000/kkbh8cw0/tent/o/a/e/4-person-tent-for-camping-waterproof-outdoor-tent-tent-house-original-imafzpagtyfftgvg.jpeg?q=90&crop=false',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN8e34V6ZKelXJ4W0zXzJLrjeZg0V1bQqNtn00C-DvMLx_0NyfTFlm43nta_jwfyB1ttI&usqp=CAU'
      ],
      store: {
        name: 'OutdoorPro',
        rating: 4.5,
        location: 'Pune',
        responseTime: '4 hours'
      },
      category: 'sports and outdoors',
      stock: 18,
      features: [
        'Quick setup design',
        'Waterproof construction',
        'Double-layer protection',
        'Ventilation windows',
        'Storage pockets'
      ],
      specifications: {
        'Brand': 'OutdoorPro',
        'Model': 'OP-CT4',
        'Capacity': '4 persons',
        'Material': 'Polyester with PU coating',
        'Poles': 'Fiberglass',
        'Dimensions': '240cm x 210cm x 130cm',
        'Weight': '3.5kg'
      }
    },
  
  
  // Toys and Games Products
  
    {
      id: 301,
      name: 'Educational Building Blocks Set',
      description: '120-piece colorful building blocks for kids ages 3+. Develops creativity, motor skills, and spatial reasoning. Compatible with major building block brands for endless expansion possibilities.',
      price: 1299,
      discountPrice: 999,
      rating: 4.8,
      reviewCount: 214,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkhSrm4yumKsK6buc2-RnIisyuq-hxhqh2dA&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkhSrm4yumKsK6buc2-RnIisyuq-hxhqh2dA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwvcJ_85g6lJWZYv8vgwsrRbICp7dWmAp4K_g1Tjrju4_-RFTCJWlqZTxUbwFDGmCXFTc&usqp=CAU'
      ],
      store: {
        name: 'KidsCorner',
        rating: 4.7,
        location: 'Chennai',
        responseTime: '1 hour'
      },
      category: 'toys',
      stock: 42,
      features: [
        '120 pieces in vibrant colors',
        'Non-toxic materials',
        'Compatible with major brands',
        'Storage bucket included',
        'Develops cognitive and motor skills'
      ],
      specifications: {
        'Brand': 'KidsCorner',
        'Model': 'KC-BB120',
        'Age Range': '3+ years',
        'Material': 'BPA-free plastic',
        'Number of Pieces': '120',
        'Weight': '0.8kg'
      }
    },
    {
      id: 302,
      name: 'Strategy Board Game',
      description: 'Family strategy game for 2-6 players. Build your civilization, gather resources, and outmaneuver opponents in this engaging board game. Average game time: 45-60 minutes. Perfect for game nights!',
      price: 1799,
      discountPrice: 1499,
      rating: 4.6,
      reviewCount: 67,
      images: [
        'https://www.satyamstationers.com/cdn/shop/files/617E6TyIZeL.jpg?v=1730109331&width=1445',
        'https://cdn.pixelbin.io/v2/black-bread-289bfa/HrdP6X/original/hamleys-product/494377535/665/494377535-3_6875.webp'
      ],
      store: {
        name: 'GameMaster',
        rating: 4.9,
        location: 'Hyderabad',
        responseTime: '2 hours'
      },
      category: 'toys',
      stock: 25,
      features: [
        'Strategic gameplay',
        'For 2-6 players',
        'High-quality game components',
        'Includes game board, cards, pieces, and dice',
        'Multiple play strategies'
      ],
      specifications: {
        'Brand': 'GameMaster',
        'Model': 'GM-SG2023',
        'Age Range': '10+ years',
        'Players': '2-6',
        'Game Duration': '45-60 minutes',
        'Components': '1 board, 150 cards, 96 game pieces, 4 dice'
      }
    },
    
  // Books and Media Products
      {
      id: 401,
      name: 'Bestselling Mystery Novel Set',
      description: 'Award-winning mystery thriller that keeps you on the edge of your seat. Follow Detective Sarah Jones as she unravels a complex web of deception in this page-turner from acclaimed author J.R. Mitchell.',
      price: 1000,
      discountPrice: 899,
      rating: 4.5,
      reviewCount: 182,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkl2eFjM4iNinqh5kjW_hrOFPgIqKtbYhysQ&s'
      ],
      store: {
        name: 'BookWorld',
        rating: 4.8,
        location: 'Kolkata',
        responseTime: '3 hours'
      },
      category: 'books',
      stock: 57,
      features: [
        'Hardcover edition',
        'Award-winning mystery novel',
        '350 pages',
        'Published in 2023',
        'Includes bonus author interview'
      ],
      specifications: {
        'Author': 'J.R. Mitchell',
        'Publisher': 'Literary Press',
        'Language': 'English',
        'Paperback': '350 pages',
        'ISBN-10': '1234567890',
        'Dimensions': '20 x 13 x 2.5 cm'
      }


    },
    
    {
        id: 801,
        name: 'The Silent Patient',
        description: 'Award-winning mystery thriller that keeps you on the edge of your seat. Follow Detective Sarah Jones as she unravels a complex web of deception in this page-turner from acclaimed author Alex Michaelides.',
        price: 400,
        
        rating: 4.5,
        reviewCount: 182,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdgL_QM7-nn4aS_gdgfeRwoqw3nC4g8BqBdw&s'
        ],
        store: {
          name: 'BookWorld',
          rating: 4.8,
          location: 'Kolkata',
          responseTime: '3 hours'
        },
        category: 'books',
        stock: 57,
        features: [
          'Hardcover edition',
          'Award-winning mystery novel',
          '350 pages',
          'Published in 2023',
          'Includes bonus author interview'
        ],
        specifications: {
          'Author': 'Alex Michaelides',
          'Publisher': 'Literary Press',
          'Language': 'English',
          'Paperback': '350 pages',
          'ISBN-10': '1234567890',
          'Dimensions': '20 x 13 x 2.5 cm'
        }
    },
    
    
  // Automotive Products
  
    {
      id: 501,
      name: 'Car Dash Camera',
      description: 'Full HD dash cam with 170° wide-angle lens and night vision. Features loop recording, G-sensor for automatic accident detection, and parking monitor. Easy installation and operation for enhanced driving safety.',
      price: 3499,
      discountPrice: 2799,
      rating: 4.3,
      reviewCount: 94,
      images: [
        'https://www.jiomart.com/images/product/original/rvydnorqme/procus-hector-car-dashcam-car-camera-with-recording-car-front-camera-dashboard-camera-motion-detector-product-images-orvydnorqme-p604737428-0-202309221414.jpg?im=Resize=(1000,1000)',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmiN_CBTJ9Lgbj9N4G-vdyuQtvROH6eqb-XF8ZlaEMIGNkBPkCumiAbks_pZCzShJJcas&usqp=CAU'
      ],
      store: {
        name: 'AutoTech',
        rating: 4.5,
        location: 'Jaipur',
        responseTime: '3 hours'
      },
      category: 'automotive',
      stock: 29,
      features: [
        'Full HD 1080p recording',
        '170° wide-angle lens',
        'Night vision capability',
        'G-sensor for accident detection',
        'Parking monitor'
      ],
      specifications: {
        'Brand': 'AutoTech',
        'Model': 'AT-DC100',
        'Resolution': '1080p',
        'Storage': 'Supports up to 128GB SD card',
        'Power Supply': '12V/24V',
        'Dimensions': '8.5 x 5.3 x 3.6 cm'
      }
    },
    {
      id: 502,
      name: 'Car Vacuum Cleaner',
      description: 'Powerful 12V portable vacuum cleaner for your vehicle. Comes with multiple attachments to reach tight spaces. Strong suction removes dirt, dust, and debris from your car interior with ease.',
      price: 1999,
      discountPrice: 1499,
      rating: 4.2,
      reviewCount: 76,
      images: [
        'https://m.media-amazon.com/images/I/61NGjKLwwZL.jpg',
        'https://rukminim2.flixcart.com/image/850/1000/l31x2fk0/vacuum-cleaner/z/x/2/portable-handheld-12v-high-power-120w-auto-vacuum-cleaner-wet-original-image9evfpzakmng.jpeg?q=90&crop=false'
      ],
      store: {
        name: 'CarCare',
        rating: 4.4,
        location: 'Lucknow',
        responseTime: '2 hours'
      },
      category: 'automotive',
      stock: 48,
      features: [
        'Powerful 120W motor',
        'Wet and dry cleaning',
        'Multiple attachments included',
        '5-meter power cord',
        'Washable HEPA filter'
      ],
      specifications: {
        'Brand': 'CarCare',
        'Model': 'CC-VC120',
        'Power': '120W',
        'Voltage': '12V DC',
        'Cable Length': '5 meters',
        'Weight': '1.2kg'
      }
    },
  
  // Sports and outdoor Category
  {
    id: 101,
    name: 'Wilson Evolution Basketball',
    description: 'Official size indoor game basketball with moisture-wicking composite leather. Perfect for competitive play and practice.',
    price: 2499,
    discountPrice: 2099,
    rating: 4.8,
    reviewCount: 850,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_HNg1RFMEqQId-oMQkPqo3CKxbVsy5UzHuA&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_HNg1RFMEqQId-oMQkPqo3CKxbVsy5UzHuA&s'
    ],
    store: {
      name: 'Sports Hub India',
      rating: 4.7,
      location: 'Athletic Zone',
      responseTime: '1 hour'
    },
    category: 'sports',
    stock: 25,
    features: [
      'Official size and weight',
      'Moisture-wicking composite leather',
      'Deep channel design',
      'Indoor use optimized',
      'Superior grip and control'
    ],
    specifications: {
      'Brand': 'Wilson',
      'Model': 'Evolution',
      'Size': '29.5"',
      'Material': 'Composite Leather',
      'Color': 'Brown',
      'Weight': '22 oz'
    }
  },
  {
    id: 102,
    name: 'Adidas Predator Edge Football Boots',
    description: 'Professional football boots with superior grip and control technology. Designed for optimal performance on the field.',
    price: 7999,
    discountPrice: 6999,
    rating: 4.6,
    reviewCount: 425,
    images: [
      'https://m.media-amazon.com/images/I/71jFV4kjZML._SL1500_.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2ijFAtg_7_tp5uxxnenycE5gHyFcZuMrJghvubNiEGRBvkVr6dg8arUz9nrGWcIG4N-Q&usqp=CAU'
    ],
    store: {
      name: 'Adidas Sports Store',
      rating: 4.7,
      location: 'Stadium Complex',
      responseTime: '2 hours'
    },
    category: 'sports',
    stock: 15,
    features: [
      'Control Frame technology',
      'Zone Skin upper material',
      'Firm ground studs',
      'Lightweight design',
      'Enhanced ball control'
    ],
    specifications: {
      'Brand': 'Adidas',
      'Model': 'Predator Edge',
      'Type': 'Firm Ground',
      'Material': 'Synthetic',
      'Closure': 'Lace-up'
    }
  },

  
  {
    id: 103,
    name: 'Coleman 4-Person Camping Tent',
    description: 'Weatherproof tent with quick setup system and rainfly, perfect for family camping. Spacious interior with excellent ventilation.',
    price: 12499,
    discountPrice: 9999,
    rating: 4.5,
    reviewCount: 320,
    images: [
      'https://m.media-amazon.com/images/I/81xZjWL2HyL._AC_UF1000,1000_QL80_.jpg'
    ],
    store: {
      name: 'Adventure Gear Hub',
      rating: 4.6,
      location: 'Adventure Zone',
      responseTime: '3 hours'
    },
    category: 'outdoor',
    stock: 12,
    features: [
      'WeatherTec System',
      'Quick 10-minute setup',
      'Fits 4 people comfortably',
      'Built-in storage pockets',
      'Included rainfly'
    ],
    specifications: {
      'Brand': 'Coleman',
      'Capacity': '4 Person',
      'Material': 'Polyester',
      'Weight': '4.5 kg',
      'Dimensions': '9\' x 7\''
    }
  },
  {
    id: 104,
    name: 'American Tourister Trekking Backpack',
    description: '45L waterproof trekking backpack with multiple compartments and rain cover. Perfect for hiking and outdoor adventures.',
    price: 2499,
    discountPrice: 1999,
    rating: 4.3,
    reviewCount: 650,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2021/8/UK/BU/FX/74448238/2-500x500.jpg',
      'https://5.imimg.com/data5/SELLER/Default/2021/8/UK/BU/FX/74448238/2-500x500.jpg'
    ],
    store: {
      name: 'Backpack World',
      rating: 4.4,
      location: 'Adventure Complex',
      responseTime: '1 hour'
    },
    category: 'outdoor',
    stock: 30,
    features: [
      'Water-resistant material',
      'Multiple compartments',
      'Padded shoulder straps',
      'Rain cover included',
      'Compression straps'
    ],
    specifications: {
      'Brand': 'American Tourister',
      'Capacity': '45L',
      'Material': 'Polyester',
      'Weight': '1.2 kg',
      'Color': 'Black/Grey'
    }
  }
];

// Simulated MongoDB-like functions
class MockMongoDB {
  constructor() {
    this.products = [...mockProducts];
    console.log('Mock MongoDB initialized with', this.products.length, 'products');
  }

  // Get all products
  async getAllProducts() {
    console.log('Getting all products from mock DB');
    return [...this.products];
  }

  // Get products by category
  async getProductsByCategory(category) {
    console.log(`Getting products by category: ${category} from mock DB`);
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get product by ID
  async getProductById(id) {
    console.log(`Getting product with ID: ${id} from mock DB`);
    const numericId = parseInt(id);
    return this.products.find(product => product.id === numericId) || null;
  }

  // Add a new product
  async addProduct(product) {
    console.log('Adding new product to mock DB');
    const newId = Math.max(...this.products.map(p => p.id)) + 1;
    const newProduct = { ...product, id: newId };
    this.products.push(newProduct);
    return { acknowledged: true, insertedId: newId };
  }

  // Update a product
  async updateProduct(id, product) {
    console.log(`Updating product with ID: ${id} in mock DB`);
    const numericId = parseInt(id);
    const index = this.products.findIndex(p => p.id === numericId);
    
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...product };
      return { acknowledged: true, modifiedCount: 1 };
    }
    
    return { acknowledged: true, modifiedCount: 0 };
  }

  // Delete a product
  async deleteProduct(id) {
    console.log(`Deleting product with ID: ${id} from mock DB`);
    const numericId = parseInt(id);
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== numericId);
    
    return { 
      acknowledged: true, 
      deletedCount: initialLength - this.products.length 
    };
  }
}

// Create a singleton instance
const mockDB = new MockMongoDB();

module.exports = {
  getAllProducts: () => mockDB.getAllProducts(),
  getProductsByCategory: (category) => mockDB.getProductsByCategory(category),
  getProductById: (id) => mockDB.getProductById(id),
  addProduct: (product) => mockDB.addProduct(product),
  updateProduct: (id, product) => mockDB.updateProduct(id, product),
  deleteProduct: (id) => mockDB.deleteProduct(id)
}; 