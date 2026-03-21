import { PrismaClient, ItemType, ItemStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.consumableUse.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.consumableEntry.deleteMany();
  await prisma.crafter.deleteMany();

  // Create 3 crafters
  const crafter1 = await prisma.crafter.create({
    data: { name: "BNOC", characterName: "BNOC" },
  });
  const crafter2 = await prisma.crafter.create({
    data: { name: "Jon", characterName: "Jon" },
  });
  const crafter3 = await prisma.crafter.create({
    data: { name: "Glenn", characterName: "Glenn" },
  });

  // Wednesday raid date (recent)
  const wednesdayRaid = new Date("2026-03-18");
  // Thursday raid
  const thursdayRaid = new Date("2026-03-19");
  // Monday raid
  const mondayRaid = new Date("2026-03-23");

  // Helper to create an entry + its individual uses
  async function createEntry(data: {
    crafterId: string;
    itemName: string;
    itemType: ItemType;
    quantity: number;
    costPerUnit: number;
    totalCost: number;
    raidDate?: Date;
    status: ItemStatus;
    notes?: string;
  }) {
    const entry = await prisma.consumableEntry.create({ data });
    await prisma.consumableUse.createMany({
      data: Array.from({ length: data.quantity }, (_, i) => ({
        entryId: entry.id,
        unitIndex: i + 1,
        status: data.status,
      })),
    });
    return entry;
  }

  // Consumable entries for crafter1 (BNOC)
  await createEntry({
    crafterId: crafter1.id,
    itemName: "Flask of Tempered Swiftness",
    itemType: "FLASK",
    quantity: 40,
    costPerUnit: 250,
    totalCost: 10000,
    raidDate: wednesdayRaid,
    status: "USED",
    notes: "Full raid stack for prog night",
  });
  await createEntry({
    crafterId: crafter1.id,
    itemName: "Flask of Tempered Swiftness",
    itemType: "FLASK",
    quantity: 40,
    costPerUnit: 250,
    totalCost: 10000,
    raidDate: thursdayRaid,
    status: "AVAILABLE",
  });
  await createEntry({
    crafterId: crafter1.id,
    itemName: "Flask Cauldron",
    itemType: "FLASK_CAULDRON",
    quantity: 2,
    costPerUnit: 5000,
    totalCost: 10000,
    raidDate: thursdayRaid,
    status: "AVAILABLE",
    notes: "Two cauldrons for Thursday",
  });

  // Consumable entries for crafter2 (Jon)
  await createEntry({
    crafterId: crafter2.id,
    itemName: "Feast of the Midnight Masquerade",
    itemType: "FOOD",
    quantity: 5,
    costPerUnit: 1500,
    totalCost: 7500,
    raidDate: wednesdayRaid,
    status: "USED",
    notes: "Wed + Thu covered",
  });
  await createEntry({
    crafterId: crafter2.id,
    itemName: "Feast of the Midnight Masquerade",
    itemType: "FOOD",
    quantity: 3,
    costPerUnit: 1500,
    totalCost: 4500,
    raidDate: mondayRaid,
    status: "AVAILABLE",
  });
  await createEntry({
    crafterId: crafter2.id,
    itemName: "Crystallized Augment Rune",
    itemType: "OTHER",
    quantity: 80,
    costPerUnit: 80,
    totalCost: 6400,
    raidDate: thursdayRaid,
    status: "AVAILABLE",
  });

  // Consumable entries for crafter3 (Glenn)
  await createEntry({
    crafterId: crafter3.id,
    itemName: "Algari Mana Potion",
    itemType: "POTION",
    quantity: 40,
    costPerUnit: 60,
    totalCost: 2400,
    raidDate: wednesdayRaid,
    status: "USED",
  });
  await createEntry({
    crafterId: crafter3.id,
    itemName: "Tempered Spellthread",
    itemType: "ENCHANT",
    quantity: 3,
    costPerUnit: 800,
    totalCost: 2400,
    status: "AVAILABLE",
    notes: "For new recruits",
  });
  await createEntry({
    crafterId: crafter3.id,
    itemName: "Potion Cauldron",
    itemType: "POTION_CAULDRON",
    quantity: 2,
    costPerUnit: 4000,
    totalCost: 8000,
    raidDate: mondayRaid,
    status: "AVAILABLE",
  });

  // Some payments
  await prisma.payment.createMany({
    data: [
      {
        crafterId: crafter1.id,
        amount: 5000,
        notes: "Partial payment for Wed raid",
        paidAt: new Date("2026-03-19"),
      },
      {
        crafterId: crafter2.id,
        amount: 7500,
        notes: "Wed feast payment",
        paidAt: new Date("2026-03-19"),
      },
      {
        crafterId: crafter3.id,
        amount: 2400,
        notes: "Wed potions reimbursed",
        paidAt: new Date("2026-03-19"),
      },
    ],
  });

  console.log("Seeding complete!");
  console.log(`Created: BNOC (${crafter1.id})`);
  console.log(`Created: Jon (${crafter2.id})`);
  console.log(`Created: Glenn (${crafter3.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
