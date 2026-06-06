/**
 * Seed the restaurant domain from the frontend mock data so that DB-mode
 * mirrors the prototype exactly. Idempotent: skips a restaurant whose slug
 * already exists. Run after `npm run db:migrate`.
 *
 *   npm run seed:restaurant
 *
 * Requires DATABASE_URL.
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  loyaltyProfiles,
  loyaltyRewards,
  menuCategories,
  menuItems,
  modifierGroups,
  modifierOptions,
  orderItems,
  orders,
  payments,
  restaurantMembers,
  restaurantSettings,
  restaurants,
  restaurantTables,
  staff,
  user,
} from "@/lib/db/schema";
import {
  MOCK_LOYALTY_PROFILES,
  MOCK_MENU,
  MOCK_ORDERS,
  MOCK_RESTAURANT,
  MOCK_REWARDS,
  MOCK_TABLES,
  MOCK_TRANSACTIONS,
  MOCK_USER,
} from "@/lib/mockData";

const DEMO_OWNER_ID = "demo-owner-001";

const txnStatusMap = {
  success: "confirmed",
  failed: "rejected",
  pending: "pending",
} as const;

async function seedRestaurant() {
  const existing = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.slug, MOCK_RESTAURANT.slug))
    .limit(1);

  if (existing.length > 0) {
    console.log(
      `Restaurant "${MOCK_RESTAURANT.slug}" already seeded — skipping.`,
    );
    return;
  }

  // Demo owner (better-auth user table) — idempotent.
  await db
    .insert(user)
    .values({
      id: DEMO_OWNER_ID,
      name: MOCK_USER.name,
      email: MOCK_USER.email,
      emailVerified: true,
    })
    .onConflictDoNothing();

  // Restaurant
  const [restaurant] = await db
    .insert(restaurants)
    .values({
      slug: MOCK_RESTAURANT.slug,
      name: MOCK_RESTAURANT.name,
      description: MOCK_RESTAURANT.description,
      isAcceptingOrders: MOCK_RESTAURANT.isAcceptingOrders,
      currency: MOCK_RESTAURANT.currency,
      vatEnabled: MOCK_RESTAURANT.vatEnabled,
      vatRate: MOCK_RESTAURANT.vatRate,
      loyaltyEnabled: MOCK_RESTAURANT.loyaltyEnabled,
      city: MOCK_RESTAURANT.city,
      phone: MOCK_RESTAURANT.phone,
      bankName: "GTBank",
      bankAccountName: "Moji Restaurant",
      bankAccountNumber: "0123456789",
    })
    .returning({ id: restaurants.id });
  const restaurantId = restaurant.id;

  // Membership + settings
  await db.insert(restaurantMembers).values({
    restaurantId,
    userId: DEMO_OWNER_ID,
    role: "owner",
  });
  await db.insert(restaurantSettings).values({
    restaurantId,
    features: {
      menu: true,
      orders: true,
      tables: true,
      payments: true,
      loyalty: MOCK_RESTAURANT.loyaltyEnabled,
      analytics: true,
      staff: true,
      notifications: true,
      integrations: false,
    },
    serviceChargeEnabled: false,
    serviceChargeRate: 5,
  });

  // Tables — capture number → id for order linkage.
  const tableIdByNumber = new Map<number, string>();
  for (const t of MOCK_TABLES) {
    const [row] = await db
      .insert(restaurantTables)
      .values({
        restaurantId,
        tableNumber: t.tableNumber,
        label: t.label,
        capacity: t.capacity,
        status: t.status,
      })
      .returning({ id: restaurantTables.id });
    tableIdByNumber.set(t.tableNumber, row.id);
  }

  // Menu: categories → items → groups → options.
  for (const category of MOCK_MENU) {
    const [cat] = await db
      .insert(menuCategories)
      .values({
        restaurantId,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      })
      .returning({ id: menuCategories.id });

    for (const item of category.items) {
      const [menuItem] = await db
        .insert(menuItems)
        .values({
          categoryId: cat.id,
          restaurantId,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          tags: item.tags,
          allergens: item.allergens,
          preparationTimeMins: item.preparationTimeMins,
          sortOrder: item.sortOrder,
        })
        .returning({ id: menuItems.id });

      for (const group of item.modifierGroups) {
        const [mg] = await db
          .insert(modifierGroups)
          .values({
            menuItemId: menuItem.id,
            name: group.name,
            required: group.required,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
          })
          .returning({ id: modifierGroups.id });

        if (group.options.length > 0) {
          await db.insert(modifierOptions).values(
            group.options.map((o) => ({
              groupId: mg.id,
              name: o.name,
              priceDelta: o.priceDelta,
            })),
          );
        }
      }
    }
  }

  // Orders + items.
  let anyOrderId: string | null = null;
  for (const order of MOCK_ORDERS) {
    const [row] = await db
      .insert(orders)
      .values({
        restaurantId,
        tableId: tableIdByNumber.get(order.tableNumber) ?? null,
        tableNumber: order.tableNumber,
        status: order.status,
        subtotal: order.subtotal,
        vatAmount: order.vatAmount,
        grandTotal: order.grandTotal,
        source: order.source,
        dinerPhone: order.dinerPhone,
        estimatedReadyMins: order.estimatedReadyMins,
      })
      .returning({ id: orders.id });
    anyOrderId = row.id;

    if (order.items.length > 0) {
      await db.insert(orderItems).values(
        order.items.map((oi) => ({
          orderId: row.id,
          itemName: oi.itemName,
          itemPrice: oi.itemPrice,
          quantity: oi.quantity,
          selectedModifiers: oi.selectedModifiers,
          specialNote: oi.specialNote,
          lineTotal: oi.lineTotal,
        })),
      );
    }
  }

  // Payments (self-reported) — link to a seeded order to satisfy the FK.
  if (anyOrderId) {
    await db.insert(payments).values(
      MOCK_TRANSACTIONS.map((txn) => ({
        restaurantId,
        orderId: anyOrderId as string,
        amount: txn.amount,
        method: txn.method,
        status: txnStatusMap[txn.status],
        reference: txn.reference,
        tableNumber: txn.tableNumber,
        dinerName: txn.dinerName,
        confirmedBy: txn.status === "success" ? DEMO_OWNER_ID : null,
        confirmedAt: txn.status === "success" ? txn.createdAt : null,
      })),
    );
  }

  // Loyalty profiles + rewards.
  if (MOCK_LOYALTY_PROFILES.length > 0) {
    await db.insert(loyaltyProfiles).values(
      MOCK_LOYALTY_PROFILES.map((p) => ({
        restaurantId,
        phone: p.phone,
        totalPoints: p.totalPoints,
        totalVisits: p.totalVisits,
        totalSpent: p.totalSpent,
        tier: p.tier,
      })),
    );
  }
  if (MOCK_REWARDS.length > 0) {
    await db.insert(loyaltyRewards).values(
      MOCK_REWARDS.map((r) => ({
        restaurantId,
        name: r.name,
        pointsRequired: r.pointsRequired,
        rewardType: r.rewardType,
        rewardValue: r.rewardValue,
        isAvailable: r.isAvailable,
      })),
    );
  }

  // A couple of staff records (records only — no credential).
  await db.insert(staff).values([
    { restaurantId, name: "Chioma Okafor", role: "manager", isActive: true },
    { restaurantId, name: "Emeka Nwadike", role: "kitchen", isActive: true },
  ]);

  console.log(`Seeded restaurant "${MOCK_RESTAURANT.slug}" (${restaurantId}).`);
}

seedRestaurant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Restaurant seed failed:", error);
    process.exit(1);
  });
