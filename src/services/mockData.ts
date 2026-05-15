import { Product, Alert, PriceSnapshot } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    image_url: 'https://via.placeholder.com/400/000000/FFFFFF?text=Sony+XM5',
    images: [
      'https://via.placeholder.com/400/000000/FFFFFF?text=Sony+XM5',
      'https://via.placeholder.com/400/333333/FFFFFF?text=Side+View',
      'https://via.placeholder.com/400/111111/FFFFFF?text=Back+View'
    ],
    category: 'Electronics',
    current_price: 18499,
    original_price: 22999,
    rating: 4.8,
    review_count: 3184,
    sold_count: 1024,
    seller: 'Sony Official Store',
    description: 'Industry-leading noise cancellation with two processors and eight microphones.\nMagnificent Sound, engineered to perfection with the new Integrated Processor V1.\nCrystal clear hands-free calling with 4 beamforming microphones.\nUp to 30-hour battery life with quick charging.\nLightweight, elegant design with soft fit leather for all-day comfort.',
    discount_percent: 20,
    variants: {
      color: ['Black', 'White', 'Blue'],
      storage: ['Standard', 'Premium Bundle']
    },
    variantPrices: {
      'Premium Bundle': 21499
    }
  },
  {
    id: 'p2',
    name: 'Nike Air Max 270 React Red Fusion',
    image_url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Nike',
    category: 'Fashion',
    current_price: 8995,
    original_price: 8995,
    rating: 4.8,
    review_count: 1200,
    seller: 'NIKE OFFICIAL STORE',
    description: 'A classic shoe.',
    discount_percent: 0,
  },
  {
    id: 'p3',
    name: 'Instax Mini 11',
    image_url: 'https://via.placeholder.com/150/F0E68C/000000?text=Instax',
    category: 'Electronics',
    current_price: 3450,
    original_price: 4100,
    rating: 4.7,
    review_count: 500,
    seller: 'Fujifilm',
    description: 'Instant camera.',
    discount_percent: 15,
  },
  {
    id: 'p4',
    name: 'Hydro Flask 32oz',
    image_url: 'https://via.placeholder.com/150/ADD8E6/000000?text=Hydro',
    category: 'Home',
    current_price: 1950,
    original_price: 2500,
    rating: 4.9,
    review_count: 320,
    seller: 'Hydro Flask',
    description: 'Insulated bottle.',
    discount_percent: 22,
  },
];

for (let i = 1; i <= 25; i++) {
  const price = 500 + Math.floor(Math.random() * 4500);
  mockProducts.push({
    id: `hp_gen_${i}`,
    name: `Generic Wireless Headphones Pro Model ${i}`,
    image_url: `https://via.placeholder.com/300/333333/FFFFFF?text=Audio+${i}`,
    category: 'Electronics',
    current_price: price,
    original_price: price + Math.floor(Math.random() * 1000),
    rating: 3.5 + Math.random() * 1.5,
    review_count: Math.floor(Math.random() * 500),
    seller: 'Audio Tech Store',
    description: 'A solid pair of generic headphones.',
    discount_percent: Math.floor(Math.random() * 30),
  });
}

export const mockAlerts: Alert[] = [
  {
    id: 1,
    product_id: 'p3',
    old_price: 4100,
    new_price: 3450,
    drop_percent: 15,
    z_score: -2.1,
    triggered_at: new Date().toISOString(),
    is_read: false,
    product: mockProducts[2],
  },
  {
    id: 2,
    product_id: 'p4',
    old_price: 2500,
    new_price: 1950,
    drop_percent: 22,
    z_score: -1.8,
    triggered_at: new Date().toISOString(),
    is_read: false,
    product: mockProducts[3],
  },
];

export const mockFlashSales = [
  {
    id: 'f1',
    product_id: 'pf1',
    name: 'White Wrist Watch',
    image_url: 'https://via.placeholder.com/150/FFFFFF/000000?text=Watch',
    current_price: 5200,
    original_price: 8666,
    discount_percent: 40,
    claimed_percent: 60,
  },
  {
    id: 'f2',
    product_id: 'pf2',
    name: 'Wireless Headphones',
    image_url: 'https://via.placeholder.com/150/000000/FFFFFF?text=Audio',
    current_price: 2850,
    original_price: 3800,
    discount_percent: 25,
    claimed_percent: 85,
  },
  {
    id: 'f3',
    product_id: 'pf3',
    name: 'Fitness Band',
    image_url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Band',
    current_price: 1499,
    original_price: 2998,
    discount_percent: 50,
    claimed_percent: 20,
  },
];

export const fetchProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts.slice(0, 6)); 
    }, 1500);
  });
};

export interface SearchResult {
  data: Product[];
  totalCount: number;
}

export const searchProducts = (query: string, page: number, limit: number): Promise<SearchResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockProducts.filter((p) => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      resolve({
        data: paginatedData,
        totalCount: filtered.length,
      });
    }, 800); 
  });
};

export const getProductById = (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === id);
      resolve(product);
    }, 1000);
  });
};

export const getProductPriceHistory = (productId: string): Promise<PriceSnapshot[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      const snapshots: PriceSnapshot[] = [];
      const basePrice = 22000;
      
      // Simulate 30 days of data
      for (let i = 30; i >= 0; i--) {
        const time = now - (i * ONE_DAY);
        let price = basePrice;
        if (i < 20 && i > 10) price = 22500;
        if (i <= 10 && i > 3) price = 20000;
        if (i <= 3) price = 18499; // Latest price drop
        
        snapshots.push({
          id: i,
          product_id: productId,
          price: price,
          timestamp: new Date(time).toISOString(),
          buffer_index: 30 - i
        });
      }
      resolve(snapshots);
    }, 800);
  });
};
