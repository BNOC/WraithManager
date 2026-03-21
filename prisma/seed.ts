import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.consumableEntry.deleteMany();
  await prisma.crafter.deleteMany();

  // Create 3 crafters
  const crafter1 = await prisma.crafter.create({
    data: { name: "Alex", characterName: "Shadowmend" },
  });
  const crafter2 = await prisma.crafter.create({
    data: { name: "Jordan", characterName: "Ironforge" },
  });
  const crafter3 = await prisma.crafter.create({
    data: { name: "Sam", characterName: "Veilborn" },
  });

  // Wednesday raid date (recent)
  const wednesdayRaid = new Date("2026-03-18");
  // Thursday raid
  const thursdayRaid = new Date("2026-03-19");
  // Monday raid
  const mondayRaid = new Date("2026-03-23");

  // Consumable entries for crafter1 (Shadowmend)
  await prisma.consumableEntry.createMany({
    data: [
      {
        crafterId: crafter1.id,
        itemName: "Flask of Tempered Swiftness",
        itemType: "FLASK",
        quantity: 40,
        costPerUnit: 250,
        totalCost: 10000,
        raidDate: wednesdayRaid,
        status: "USED",
        notes: "Full raid stack for prog night",
      },
      {
        crafterId: crafter1.id,
        itemName: "Flask of Tempered Swiftness",
        itemType: "FLASK",
        quantity: 40,
        costPerUnit: 250,
        totalCost: 10000,
        raidDate: thursdayRaid,
        status: "AVAILABLE",
      },
      {
        crafterId: crafter1.id,
        itemName: "Potion of the Hushed Zephyr",
        itemType: "POTION",
        quantity: 80,
        costPerUnit: 120,
        totalCost: 9600,
        raidDate: thursdayRaid,
        status: "AVAILABLE",
        notes: "Pre-pot and second pot",
      },
    ],
  });

  // Consumable entries for crafter2 (Ironforge)
  await prisma.consumableEntry.createMany({
    data: [
      {
        crafterId: crafter2.id,
        itemName: "Feast of the Midnight Masquerade",
        itemType: "FOOD",
        quantity: 5,
        costPerUnit: 1500,
        totalCost: 7500,
        raidDate: wednesdayRaid,
        status: "USED",
        notes: "Wed + Thu covered",
      },
      {
        crafterId: crafter2.id,
        itemName: "Feast of the Midnight Masquerade",
        itemType: "FOOD",
        quantity: 3,
        costPerUnit: 1500,
        totalCost: 4500,
        raidDate: mondayRaid,
        status: "AVAILABLE",
      },
      {
        crafterId: crafter2.id,
        itemName: "Crystallized Augment Rune",
        itemType: "OTHER",
        quantity: 80,
        costPerUnit: 80,
        totalCost: 6400,
        raidDate: thursdayRaid,
        status: "AVAILABLE",
      },
    ],
  });

  // Consumable entries for crafter3 (Veilborn)
  await prisma.consumableEntry.createMany({
    data: [
      {
        crafterId: crafter3.id,
        itemName: "Algari Mana Potion",
        itemType: "POTION",
        quantity: 40,
        costPerUnit: 60,
        totalCost: 2400,
        raidDate: wednesdayRaid,
        status: "USED",
      },
      {
        crafterId: crafter3.id,
        itemName: "Tempered Spellthread",
        itemType: "ENCHANT",
        quantity: 3,
        costPerUnit: 800,
        totalCost: 2400,
        status: "AVAILABLE",
        notes: "For new recruits",
      },
      {
        crafterId: crafter3.id,
        itemName: "Algari Mana Potion",
        itemType: "POTION",
        quantity: 40,
        costPerUnit: 60,
        totalCost: 2400,
        raidDate: mondayRaid,
        status: "AVAILABLE",
      },
    ],
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
  console.log(`Created: Shadowmend (${crafter1.id})`);
  console.log(`Created: Ironforge (${crafter2.id})`);
  console.log(`Created: Veilborn (${crafter3.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
