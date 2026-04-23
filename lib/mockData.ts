// Mock data for Moji (ScanServe) frontend prototype
// Replace with real Supabase queries when backend is wired up

export type Tag = "Spicy" | "Vegetarian" | "Vegan" | "Gluten-Free" | "Bestseller" | "New" | "Chef's Special";
export type Allergen = "Nuts" | "Dairy" | "Gluten" | "Eggs" | "Fish";

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: Tag[];
  allergens: Allergen[];
  preparationTimeMins: number;
  modifierGroups: ModifierGroup[];
  sortOrder: number;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isAcceptingOrders: boolean;
  currency: string;
  vatEnabled: boolean;
  vatRate: number;
  city: string;
  phone: string;
  loyaltyEnabled: boolean;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: number;
  label: string;
  capacity: number;
  status: "available" | "occupied" | "awaiting_payment";
}

export type OrderStatus = "pending" | "in_kitchen" | "ready" | "served" | "paid";

export interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  selectedModifiers: Record<string, ModifierOption[]>;
  specialNote?: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  source: "qr" | "staff";
  dinerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyMins: number;
}

export interface LoyaltyProfile {
  phone: string;
  restaurantId: string;
  totalPoints: number;
  totalVisits: number;
  totalSpent: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

// ─── Restaurant ───────────────────────────────────────────────────────────────
export const MOCK_RESTAURANT: Restaurant = {
  id: "rest-001",
  name: "Mama Put Kitchen",
  slug: "mama-put-kitchen",
  description: "Authentic Nigerian street food — fresh, flavourful, unforgettable.",
  logoUrl: undefined,
  coverImageUrl: undefined,
  isAcceptingOrders: true,
  currency: "NGN",
  vatEnabled: true,
  vatRate: 7.5,
  city: "Uyo",
  phone: "+234 803 000 0001",
  loyaltyEnabled: true,
};

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "rest-001",
    name: "Mama Put Kitchen",
    slug: "mama-put-kitchen",
    description: "Authentic Nigerian street food — fresh, flavourful, unforgettable.",
    isAcceptingOrders: true,
    currency: "NGN",
    vatEnabled: true,
    vatRate: 7.5,
    city: "Uyo",
    phone: "+234 803 000 0001",
    loyaltyEnabled: true,
  },
  {
    id: "rest-002",
    name: "Spice Garden Lagos",
    slug: "spice-garden-lagos",
    description: "Modern West African cuisine in the heart of Lagos Island.",
    isAcceptingOrders: false,
    currency: "NGN",
    vatEnabled: true,
    vatRate: 7.5,
    city: "Lagos",
    phone: "+234 802 000 0002",
    loyaltyEnabled: false,
  },
];

export const MOCK_USER = {
  name: "Adaeze Okonkwo",
  email: "ada@mamaputkitchen.ng",
  initials: "AO",
};

// ─── Tables ───────────────────────────────────────────────────────────────────
export const MOCK_TABLES: RestaurantTable[] = [
  { id: "tbl-01", restaurantId: "rest-001", tableNumber: 1, label: "Table 1", capacity: 4, status: "occupied" },
  { id: "tbl-02", restaurantId: "rest-001", tableNumber: 2, label: "Table 2", capacity: 2, status: "available" },
  { id: "tbl-03", restaurantId: "rest-001", tableNumber: 3, label: "Table 3", capacity: 6, status: "awaiting_payment" },
  { id: "tbl-04", restaurantId: "rest-001", tableNumber: 4, label: "Table 4", capacity: 4, status: "available" },
  { id: "tbl-05", restaurantId: "rest-001", tableNumber: 5, label: "Table 5", capacity: 8, status: "occupied" },
  { id: "tbl-06", restaurantId: "rest-001", tableNumber: 6, label: "VIP Booth", capacity: 10, status: "available" },
];

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const MOCK_MENU: MenuCategory[] = [
  {
    id: "cat-001",
    restaurantId: "rest-001",
    name: "Starters",
    description: "Light bites to get you started",
    sortOrder: 1,
    items: [
      {
        id: "item-001",
        categoryId: "cat-001",
        name: "Peppered Snail",
        description: "Juicy garden snails stir-fried with scotch bonnet, bell peppers and onions.",
        price: 3500,
        isAvailable: true,
        isFeatured: true,
        tags: ["Spicy", "Bestseller"],
        allergens: [],
        preparationTimeMins: 15,
        modifierGroups: [
          {
            id: "mg-001",
            name: "Spice Level",
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: "mo-001", name: "Mild", priceDelta: 0 },
              { id: "mo-002", name: "Medium", priceDelta: 0 },
              { id: "mo-003", name: "Extra Hot", priceDelta: 200 },
            ],
          },
        ],
        sortOrder: 1,
      },
      {
        id: "item-002",
        categoryId: "cat-001",
        name: "Suya Skewers (x3)",
        description: "Grilled beef skewers coated in house-blend suya spice. Served with fresh sliced onion and tomatoes.",
        price: 2800,
        isAvailable: true,
        isFeatured: false,
        tags: ["Spicy", "Bestseller"],
        allergens: ["Nuts"],
        preparationTimeMins: 20,
        modifierGroups: [],
        sortOrder: 2,
      },
      {
        id: "item-003",
        categoryId: "cat-001",
        name: "Moin Moin (2 wraps)",
        description: "Steamed bean pudding made with blended black-eyed peas, peppers and palm oil.",
        price: 1500,
        isAvailable: false,
        isFeatured: false,
        tags: ["Vegetarian"],
        allergens: ["Eggs"],
        preparationTimeMins: 10,
        modifierGroups: [],
        sortOrder: 3,
      },
    ],
  },
  {
    id: "cat-002",
    restaurantId: "rest-001",
    name: "Main Course",
    description: "Full Nigerian plates",
    sortOrder: 2,
    items: [
      {
        id: "item-004",
        categoryId: "cat-002",
        name: "Jollof Rice + Chicken",
        description: "Party-style smoky jollof rice served with a full grilled chicken leg-quarter and coleslaw.",
        price: 5500,
        isAvailable: true,
        isFeatured: true,
        tags: ["Bestseller", "Chef's Special"],
        allergens: [],
        preparationTimeMins: 25,
        modifierGroups: [
          {
            id: "mg-002",
            name: "Protein Swap",
            required: false,
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: "mo-004", name: "Chicken (default)", priceDelta: 0 },
              { id: "mo-005", name: "Beef", priceDelta: 500 },
              { id: "mo-006", name: "Fish", priceDelta: 800 },
            ],
          },
          {
            id: "mg-003",
            name: "Extras",
            required: false,
            minSelections: 0,
            maxSelections: 3,
            options: [
              { id: "mo-007", name: "Extra Coleslaw", priceDelta: 300 },
              { id: "mo-008", name: "Fried Plantain", priceDelta: 500 },
              { id: "mo-009", name: "Moi Moi", priceDelta: 600 },
            ],
          },
        ],
        sortOrder: 1,
      },
      {
        id: "item-005",
        categoryId: "cat-002",
        name: "Egusi Soup + Eba",
        description: "Rich melon seed soup with chunks of beef, stockfish and uziza leaves. Served with eba.",
        price: 4800,
        isAvailable: true,
        isFeatured: false,
        tags: [],
        allergens: ["Fish"],
        preparationTimeMins: 20,
        modifierGroups: [
          {
            id: "mg-004",
            name: "Swallow Choice",
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: "mo-010", name: "Eba", priceDelta: 0 },
              { id: "mo-011", name: "Pounded Yam", priceDelta: 200 },
              { id: "mo-012", name: "Fufu", priceDelta: 0 },
              { id: "mo-013", name: "Semo", priceDelta: 0 },
            ],
          },
        ],
        sortOrder: 2,
      },
      {
        id: "item-006",
        categoryId: "cat-002",
        name: "Grilled Catfish",
        description: "Whole catfish marinated in a blend of spices, grilled to perfection. Served with yam or plantain.",
        price: 8500,
        isAvailable: true,
        isFeatured: false,
        tags: ["New", "Chef's Special"],
        allergens: ["Fish"],
        preparationTimeMins: 35,
        modifierGroups: [],
        sortOrder: 3,
      },
      {
        id: "item-007",
        categoryId: "cat-002",
        name: "Vegetable Fried Rice",
        description: "Long-grain rice stir-fried with seasonal vegetables, eggs and soy sauce.",
        price: 3500,
        isAvailable: true,
        isFeatured: false,
        tags: ["Vegetarian"],
        allergens: ["Eggs"],
        preparationTimeMins: 20,
        modifierGroups: [],
        sortOrder: 4,
      },
    ],
  },
  {
    id: "cat-003",
    restaurantId: "rest-001",
    name: "Drinks",
    description: "Chilled refreshments",
    sortOrder: 3,
    items: [
      {
        id: "item-008",
        categoryId: "cat-003",
        name: "Chapman",
        description: "Nigerian classic cocktail made with Fanta, Sprite, Ribena, cucumber and a dash of grenadine.",
        price: 1800,
        isAvailable: true,
        isFeatured: false,
        tags: ["Vegetarian", "Vegan"],
        allergens: [],
        preparationTimeMins: 5,
        modifierGroups: [],
        sortOrder: 1,
      },
      {
        id: "item-009",
        categoryId: "cat-003",
        name: "Zobo Juice (500ml)",
        description: "House-made hibiscus drink with ginger, pineapple and cloves. Served chilled.",
        price: 1200,
        isAvailable: true,
        isFeatured: false,
        tags: ["Vegan", "New"],
        allergens: [],
        preparationTimeMins: 2,
        modifierGroups: [],
        sortOrder: 2,
      },
      {
        id: "item-010",
        categoryId: "cat-003",
        name: "Soft Drink (can)",
        description: "Choose from Coke, Fanta, Sprite or Malta Guinness.",
        price: 500,
        isAvailable: true,
        isFeatured: false,
        tags: [],
        allergens: [],
        preparationTimeMins: 1,
        modifierGroups: [
          {
            id: "mg-005",
            name: "Flavour",
            required: true,
            minSelections: 1,
            maxSelections: 1,
            options: [
              { id: "mo-014", name: "Coca-Cola", priceDelta: 0 },
              { id: "mo-015", name: "Fanta Orange", priceDelta: 0 },
              { id: "mo-016", name: "Sprite", priceDelta: 0 },
              { id: "mo-017", name: "Malta Guinness", priceDelta: 0 },
            ],
          },
        ],
        sortOrder: 3,
      },
    ],
  },
  {
    id: "cat-004",
    restaurantId: "rest-001",
    name: "Desserts",
    description: "Sweet endings",
    sortOrder: 4,
    items: [
      {
        id: "item-011",
        categoryId: "cat-004",
        name: "Puff Puff (x6)",
        description: "Golden deep-fried dough balls, lightly dusted with sugar. A Nigerian favourite.",
        price: 1000,
        isAvailable: true,
        isFeatured: false,
        tags: ["Vegetarian", "Vegan", "Bestseller"],
        allergens: ["Gluten"],
        preparationTimeMins: 10,
        modifierGroups: [],
        sortOrder: 1,
      },
    ],
  },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-001",
    restaurantId: "rest-001",
    tableId: "tbl-01",
    tableNumber: 1,
    status: "in_kitchen",
    items: [
      {
        id: "oi-001",
        menuItemId: "item-004",
        itemName: "Jollof Rice + Chicken",
        itemPrice: 5500,
        quantity: 2,
        selectedModifiers: {},
        lineTotal: 11000,
      },
      {
        id: "oi-002",
        menuItemId: "item-008",
        itemName: "Chapman",
        itemPrice: 1800,
        quantity: 2,
        selectedModifiers: {},
        lineTotal: 3600,
      },
    ],
    subtotal: 14600,
    vatAmount: 1095,
    grandTotal: 15695,
    source: "qr",
    dinerPhone: "08031234567",
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    estimatedReadyMins: 25,
  },
  {
    id: "ord-002",
    restaurantId: "rest-001",
    tableId: "tbl-05",
    tableNumber: 5,
    status: "pending",
    items: [
      {
        id: "oi-003",
        menuItemId: "item-001",
        itemName: "Peppered Snail",
        itemPrice: 3500,
        quantity: 1,
        selectedModifiers: {
          "mg-001": [{ id: "mo-003", name: "Extra Hot", priceDelta: 200 }],
        },
        lineTotal: 3700,
      },
      {
        id: "oi-004",
        menuItemId: "item-002",
        itemName: "Suya Skewers (x3)",
        itemPrice: 2800,
        quantity: 1,
        selectedModifiers: {},
        lineTotal: 2800,
      },
    ],
    subtotal: 6500,
    vatAmount: 487.5,
    grandTotal: 6987.5,
    source: "qr",
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2),
    estimatedReadyMins: 20,
  },
  {
    id: "ord-003",
    restaurantId: "rest-001",
    tableId: "tbl-03",
    tableNumber: 3,
    status: "ready",
    items: [
      {
        id: "oi-005",
        menuItemId: "item-006",
        itemName: "Grilled Catfish",
        itemPrice: 8500,
        quantity: 1,
        selectedModifiers: {},
        lineTotal: 8500,
      },
      {
        id: "oi-006",
        menuItemId: "item-009",
        itemName: "Zobo Juice (500ml)",
        itemPrice: 1200,
        quantity: 2,
        selectedModifiers: {},
        lineTotal: 2400,
      },
    ],
    subtotal: 10900,
    vatAmount: 817.5,
    grandTotal: 11717.5,
    source: "staff",
    createdAt: new Date(Date.now() - 1000 * 60 * 22),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3),
    estimatedReadyMins: 35,
  },
  {
    id: "ord-004",
    restaurantId: "rest-001",
    tableId: "tbl-01",
    tableNumber: 2,
    status: "served",
    items: [
      {
        id: "oi-007",
        menuItemId: "item-011",
        itemName: "Puff Puff (x6)",
        itemPrice: 1000,
        quantity: 3,
        selectedModifiers: {},
        lineTotal: 3000,
      },
    ],
    subtotal: 3000,
    vatAmount: 225,
    grandTotal: 3225,
    source: "qr",
    createdAt: new Date(Date.now() - 1000 * 60 * 35),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
    estimatedReadyMins: 10,
  },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export type PaymentMethod = "card" | "bank_transfer" | "ussd" | "cash";

export interface Transaction {
  id: string;
  orderId: string;
  tableNumber: number;
  dinerName: string;
  amount: number;
  method: PaymentMethod;
  status: "success" | "failed" | "pending";
  reference: string;
  createdAt: Date;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    orderId: "ord-004",
    tableNumber: 2,
    dinerName: "Chidi Okeke",
    amount: 3225,
    method: "bank_transfer",
    status: "success",
    reference: "MJI-A8F2C1",
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "txn-002",
    orderId: "ord-001",
    tableNumber: 1,
    dinerName: "Adaeze Nwosu",
    amount: 15695,
    method: "card",
    status: "success",
    reference: "MJI-D3E901",
    createdAt: new Date(Date.now() - 1000 * 60 * 28),
  },
  {
    id: "txn-003",
    orderId: "ord-005",
    tableNumber: 4,
    dinerName: "Emeka Obi",
    amount: 9700,
    method: "ussd",
    status: "success",
    reference: "MJI-B71204",
    createdAt: new Date(Date.now() - 1000 * 60 * 55),
  },
  {
    id: "txn-004",
    orderId: "ord-006",
    tableNumber: 6,
    dinerName: "Kemi Adeyemi",
    amount: 22400,
    method: "bank_transfer",
    status: "success",
    reference: "MJI-C0F830",
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "txn-005",
    orderId: "ord-007",
    tableNumber: 3,
    dinerName: "Tunde Balogun",
    amount: 7600,
    method: "card",
    status: "failed",
    reference: "MJI-FF2291",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];


// ─── Loyalty ──────────────────────────────────────────────────────────────────
export interface LoyaltyReward {
  id: string;
  restaurantId: string;
  name: string;
  pointsRequired: number;
  rewardType: "free_item" | "discount_percent";
  rewardValue: number;
  isAvailable: boolean;
}

export const MOCK_LOYALTY_PROFILES: LoyaltyProfile[] = [
  {
    phone: "08031234567",
    restaurantId: "rest-001",
    totalPoints: 1250,
    totalVisits: 8,
    totalSpent: 125000,
    tier: "Silver",
  },
  {
    phone: "08029990001",
    restaurantId: "rest-001",
    totalPoints: 2450,
    totalVisits: 15,
    totalSpent: 280000,
    tier: "Gold",
  },
  {
    phone: "07018880002",
    restaurantId: "rest-001",
    totalPoints: 350,
    totalVisits: 2,
    totalSpent: 15000,
    tier: "Bronze",
  },
];

export const MOCK_REWARDS: LoyaltyReward[] = [
  {
    id: "rew-001",
    restaurantId: "rest-001",
    name: "Free Soft Drink",
    pointsRequired: 200,
    rewardType: "free_item",
    rewardValue: 500,
    isAvailable: true,
  },
  {
    id: "rew-002",
    restaurantId: "rest-001",
    name: "10% Discount",
    pointsRequired: 500,
    rewardType: "discount_percent",
    rewardValue: 10,
    isAvailable: true,
  },
  {
    id: "rew-003",
    restaurantId: "rest-001",
    name: "Free Jollof Platter",
    pointsRequired: 1500,
    rewardType: "free_item",
    rewardValue: 5500,
    isAvailable: true,
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsData {
  revenueTrend: { date: string; revenue: number; orders: number }[];
  topDishes: { name: string; sales: number; revenue: number }[];
  paymentMethods: { name: string; value: number }[];
}

export const MOCK_ANALYTICS: AnalyticsData = {
  revenueTrend: [
    { date: "Mon", revenue: 45000, orders: 12 },
    { date: "Tue", revenue: 52000, orders: 15 },
    { date: "Wed", revenue: 38000, orders: 10 },
    { date: "Thu", revenue: 65000, orders: 18 },
    { date: "Fri", revenue: 85000, orders: 24 },
    { date: "Sat", revenue: 98000, orders: 30 },
    { date: "Sun", revenue: 72000, orders: 22 },
  ],
  topDishes: [
    { name: "Jollof Rice + Chicken", sales: 145, revenue: 797500 },
    { name: "Peppered Snail", sales: 98, revenue: 343000 },
    { name: "Suya Skewers (x3)", sales: 85, revenue: 238000 },
    { name: "Egusi Soup + Eba", sales: 62, revenue: 297600 },
    { name: "Grilled Catfish", sales: 45, revenue: 382500 },
  ],
  paymentMethods: [
    { name: "Bank Transfer", value: 58 },
    { name: "Card", value: 34 },
    { name: "USSD", value: 8 },
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getOrderAgeMinutes(order: Order): number {
  return Math.floor((Date.now() - order.createdAt.getTime()) / 1000 / 60);
}
