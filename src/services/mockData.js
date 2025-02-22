export const products = [
  {
    _id: "1",
    name: "Dinojames 2mm Batch Coding Machine - Letter & Number Printer",
    category: "electronics",
    price: 2498,
    originalPrice: 3500,
    rating: 4.5,
    reviewCount: 40,
    discount: 29,
    store: {
      name: "Dinojames Official",
      address: "123 Tech Street, Electronics Hub",
      rating: 4.3,
      contact: "+91-9876543210"
    },
    image: "https://m.media-amazon.com/images/I/71cX92XQKIL._SL1500_.jpg",
    description: "Professional 2mm Batch Coding Machine for printing letters and numbers. Perfect for industrial use."
  },
  {
    _id: "2",
    name: "Apple MacBook Pro 14-inch",
    category: "computers",
    price: 149900,
    originalPrice: 169900,
    rating: 4.8,
    reviewCount: 256,
    discount: 12,
    store: {
      name: "Apple Premium Store",
      address: "456 Innovation Ave, Tech Park",
      rating: 4.9,
      contact: "+91-9876543211"
    },
    image: "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg",
    description: "Apple M2 Pro chip, 16GB RAM, 512GB SSD, 14-inch Liquid Retina XDR display"
  },
  {
    _id: "3",
    name: "Nike Air Max 270",
    category: "fashion",
    price: 12995,
    originalPrice: 15995,
    rating: 4.5,
    reviewCount: 320,
    discount: 19,
    store: {
      name: "Nike Store",
      address: "789 Fashion Street, Style District",
      rating: 4.8,
      contact: "+91-9876543212"
    },
    image: "https://m.media-amazon.com/images/I/71uGspZGKiL._UL1500_.jpg",
    description: "Nike Air Max 270 Running Shoes with Air cushioning for maximum comfort"
  },
  {
    _id: "4",
    name: "Samsung French Door Refrigerator",
    category: "appliances",
    price: 89990,
    originalPrice: 119900,
    rating: 4.6,
    reviewCount: 152,
    discount: 25,
    store: {
      name: "Samsung Smart Plaza",
      address: "321 Home Avenue, Appliance District",
      rating: 4.7,
      contact: "+91-9876543213"
    },
    image: "https://m.media-amazon.com/images/I/71YEJjQH-rL._SL1500_.jpg",
    description: "679L French Door Refrigerator with Digital Inverter Technology"
  },
  {
    _id: "5",
    name: "Urban Ladder L-Shaped Sofa",
    category: "furniture",
    price: 45999,
    originalPrice: 89999,
    rating: 4.4,
    reviewCount: 89,
    discount: 49,
    store: {
      name: "Urban Ladder Home Store",
      address: "567 Comfort Lane, Furniture Hub",
      rating: 4.6,
      contact: "+91-9876543214"
    },
    image: "https://m.media-amazon.com/images/I/71cFPYYxv-L._SL1500_.jpg",
    description: "Modern L-Shaped Fabric Sectional Sofa with Ottoman (Grey)"
  },
  {
    _id: "6",
    name: "Noise ColorFit Pro 5",
    category: "electronics",
    price: 4999,
    originalPrice: 7999,
    rating: 4.3,
    reviewCount: 1205,
    discount: 38,
    store: {
      name: "Noise Official Store",
      address: "890 Smart Street, Gadget Zone",
      rating: 4.5,
      contact: "+91-9876543215"
    },
    image: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
    description: "Smart Watch with 1.96\" AMOLED Display, Bluetooth Calling"
  }
];

export const offers = [
  {
    _id: "1",
    category: "electronics",
    title: "Mega Electronics Sale",
    description: "Up to 75% off on Electronics",
    validUntil: "2024-04-30",
    image: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
    discount: 75,
    products: [
      {
        name: "Noise ColorFit Pro 5",
        price: 4999,
        originalPrice: 7999,
        image: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg"
      }
    ]
  },
  {
    _id: "2",
    category: "computers",
    title: "Apple Products Festival",
    description: "Special discounts on MacBooks and iPads",
    validUntil: "2024-04-15",
    image: "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg",
    discount: 12,
    products: [
      {
        name: "MacBook Pro 14-inch",
        price: 149900,
        originalPrice: 169900,
        image: "https://m.media-amazon.com/images/I/61L5QgPvgqL._SL1500_.jpg"
      }
    ]
  }
]; 