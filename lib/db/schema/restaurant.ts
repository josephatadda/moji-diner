/**
 * Restaurant-domain schema — Moji backend.
 *
 * Conventions:
 *  - Money is stored as INTEGER kobo (₦1 = 100 kobo). Never floats for money.
 *  - Rates (VAT, service charge) are percentages stored as doublePrecision.
 *  - Primary keys are server-generated UUIDs (never client-supplied).
 *  - Tags/allergens are text[]; order-item modifier snapshots are jsonb.
 *  - A table's "session" is derived from its unpaid orders (no sessions table).
 *
 * Mirrors the frontend data contract in lib/mockData.ts.
 */
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../schema";

// ── Enums ────────────────────────────────────────────────────────────────────
export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "manager",
  "staff",
]);
export const tableStatusEnum = pgEnum("table_status", [
  "available",
  "occupied",
  "awaiting_payment",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "in_kitchen",
  "ready",
  "served",
  "paid",
]);
export const orderSourceEnum = pgEnum("order_source", ["qr", "staff"]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "bank_transfer",
  "ussd",
  "cash",
]);
// Self-reported payment lifecycle: diner reports -> pending -> owner confirms/rejects.
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "rejected",
]);
export const loyaltyTierEnum = pgEnum("loyalty_tier", [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
]);
export const rewardTypeEnum = pgEnum("reward_type", [
  "free_item",
  "discount_percent",
]);
export const staffRoleEnum = pgEnum("staff_role", [
  "manager",
  "staff",
  "kitchen",
]);

// ── Restaurants ───────────────────────────────────────────────────────────────
export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    isAcceptingOrders: boolean("is_accepting_orders").notNull().default(true),
    currency: text("currency").notNull().default("NGN"),
    vatEnabled: boolean("vat_enabled").notNull().default(false),
    vatRate: doublePrecision("vat_rate").notNull().default(0),
    loyaltyEnabled: boolean("loyalty_enabled").notNull().default(false),
    city: text("city").notNull().default(""),
    phone: text("phone").notNull().default(""),
    // Bank details for self-reported payments (shown to diners).
    bankName: text("bank_name"),
    bankAccountName: text("bank_account_name"),
    bankAccountNumber: text("bank_account_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("restaurants_slug_unique").on(t.slug)],
);

// ── Owner / staff membership (authz) ──────────────────────────────────────────
export const restaurantMembers = pgTable(
  "restaurant_members",
  {
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("owner"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("restaurant_members_pk").on(t.restaurantId, t.userId),
    index("restaurant_members_user_idx").on(t.userId),
  ],
);

// ── Per-restaurant settings (feature toggles + service charge) ────────────────
export const restaurantSettings = pgTable("restaurant_settings", {
  restaurantId: uuid("restaurant_id")
    .primaryKey()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  features: jsonb("features").notNull().default({}),
  serviceChargeEnabled: boolean("service_charge_enabled")
    .notNull()
    .default(false),
  serviceChargeRate: doublePrecision("service_charge_rate")
    .notNull()
    .default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Tables ────────────────────────────────────────────────────────────────────
export const restaurantTables = pgTable(
  "restaurant_tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    tableNumber: integer("table_number").notNull(),
    label: text("label").notNull(),
    capacity: integer("capacity").notNull().default(4),
    status: tableStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("restaurant_tables_number_unique").on(t.restaurantId, t.tableNumber),
  ],
);

// ── Menu ──────────────────────────────────────────────────────────────────────
export const menuCategories = pgTable(
  "menu_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("menu_categories_restaurant_idx").on(t.restaurantId)],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(), // kobo
    photoUrl: text("photo_url"),
    isAvailable: boolean("is_available").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    tags: text("tags").array().notNull().default([]),
    allergens: text("allergens").array().notNull().default([]),
    preparationTimeMins: integer("preparation_time_mins").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("menu_items_category_idx").on(t.categoryId),
    index("menu_items_restaurant_idx").on(t.restaurantId),
  ],
);

export const modifierGroups = pgTable(
  "modifier_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    required: boolean("required").notNull().default(false),
    minSelections: integer("min_selections").notNull().default(0),
    maxSelections: integer("max_selections").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("modifier_groups_item_idx").on(t.menuItemId)],
);

export const modifierOptions = pgTable(
  "modifier_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => modifierGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceDelta: integer("price_delta").notNull().default(0), // kobo
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("modifier_options_group_idx").on(t.groupId)],
);

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    tableId: uuid("table_id").references(() => restaurantTables.id, {
      onDelete: "set null",
    }),
    tableNumber: integer("table_number").notNull().default(0),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: integer("subtotal").notNull().default(0), // kobo
    vatAmount: integer("vat_amount").notNull().default(0), // kobo
    grandTotal: integer("grand_total").notNull().default(0), // kobo
    source: orderSourceEnum("source").notNull().default("qr"),
    dinerPhone: text("diner_phone"),
    estimatedReadyMins: integer("estimated_ready_mins").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_restaurant_status_idx").on(t.restaurantId, t.status),
    index("orders_table_idx").on(t.tableId),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id").references(() => menuItems.id, {
      onDelete: "set null",
    }),
    itemName: text("item_name").notNull(), // snapshot at order time
    itemPrice: integer("item_price").notNull(), // kobo, snapshot
    quantity: integer("quantity").notNull().default(1),
    selectedModifiers: jsonb("selected_modifiers").notNull().default({}),
    specialNote: text("special_note"),
    lineTotal: integer("line_total").notNull(), // kobo
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

// ── Payments (self-reported) ──────────────────────────────────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // kobo, server-calculated
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    reference: text("reference").notNull(),
    tableNumber: integer("table_number").notNull().default(0),
    dinerName: text("diner_name"),
    notifiedAt: timestamp("notified_at").notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at"),
    confirmedBy: text("confirmed_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index("payments_restaurant_idx").on(t.restaurantId),
    index("payments_order_idx").on(t.orderId),
  ],
);

// ── Loyalty ───────────────────────────────────────────────────────────────────
export const loyaltyProfiles = pgTable(
  "loyalty_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    phone: text("phone").notNull(),
    name: text("name"),
    totalPoints: integer("total_points").notNull().default(0),
    totalVisits: integer("total_visits").notNull().default(0),
    totalSpent: integer("total_spent").notNull().default(0), // kobo
    tier: loyaltyTierEnum("tier").notNull().default("Bronze"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("loyalty_profiles_phone_unique").on(t.restaurantId, t.phone)],
);

export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => loyaltyProfiles.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    pointsDelta: integer("points_delta").notNull(),
    reason: text("reason").notNull().default("order"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("loyalty_transactions_profile_idx").on(t.profileId)],
);

export const loyaltyRewards = pgTable(
  "loyalty_rewards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    pointsRequired: integer("points_required").notNull(),
    rewardType: rewardTypeEnum("reward_type").notNull(),
    rewardValue: integer("reward_value").notNull(), // kobo (free_item) or percent
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("loyalty_rewards_restaurant_idx").on(t.restaurantId)],
);

// ── Staff (records only — no credential) ──────────────────────────────────────
export const staff = pgTable(
  "staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: staffRoleEnum("role").notNull().default("staff"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("staff_restaurant_idx").on(t.restaurantId)],
);

// ── Inferred types ────────────────────────────────────────────────────────────
export type RestaurantRow = typeof restaurants.$inferSelect;
export type MenuCategoryRow = typeof menuCategories.$inferSelect;
export type MenuItemRow = typeof menuItems.$inferSelect;
export type ModifierGroupRow = typeof modifierGroups.$inferSelect;
export type ModifierOptionRow = typeof modifierOptions.$inferSelect;
export type RestaurantTableRow = typeof restaurantTables.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type LoyaltyProfileRow = typeof loyaltyProfiles.$inferSelect;
export type LoyaltyRewardRow = typeof loyaltyRewards.$inferSelect;
export type StaffRow = typeof staff.$inferSelect;
export type RestaurantMemberRow = typeof restaurantMembers.$inferSelect;
export type RestaurantSettingsRow = typeof restaurantSettings.$inferSelect;
