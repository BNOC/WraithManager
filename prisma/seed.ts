import { PrismaClient, ItemType } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.usageLine.deleteMany();
  await prisma.usageLog.deleteMany();
  await prisma.craftBatch.deleteMany();
  await prisma.crafter.deleteMany();
  await prisma.priceConfig.deleteMany();

  // Create crafters
  const crafter1 = await prisma.crafter.create({
    data: { name: "BNOC", characterName: "BNOC" },
  });
  const crafter2 = await prisma.crafter.create({
    data: { name: "Jon", characterName: "Jon" },
  });
  const crafter3 = await prisma.crafter.create({
    data: { name: "Glenn", characterName: "Glenn" },
  });

  // Seed price defaults
  await prisma.priceConfig.createMany({
    data: [
      { itemType: "FLASK_CAULDRON", price: 5000, notes: "Season start" },
      { itemType: "POTION_CAULDRON", price: 4000, notes: "Season start" },
      { itemType: "FEAST", price: 2000, notes: "Season start" },
      { itemType: "VANTUS_RUNE", price: 150, notes: "Season start" },
    ],
  });

  // Seed some craft batches
  const batch1 = await prisma.craftBatch.create({
    data: {
      crafterId: crafter1.id,
      itemType: "FLASK_CAULDRON" as ItemType,
      itemName: "Flask Cauldron",
      quantity: 4,
      costPerUnit: 5000,
      craftedAt: new Date("2026-03-18"),
    },
  });

  const batch2 = await prisma.craftBatch.create({
    data: {
      crafterId: crafter2.id,
      itemType: "FEAST" as ItemType,
      itemName: "Primary Stat",
      quantity: 6,
      costPerUnit: 2000,
      craftedAt: new Date("2026-03-18"),
    },
  });

  const batch3 = await prisma.craftBatch.create({
    data: {
      crafterId: crafter3.id,
      itemType: "VANTUS_RUNE" as ItemType,
      itemName: "Vantus Rune",
      quantity: 20,
      costPerUnit: 150,
      craftedAt: new Date("2026-03-19"),
    },
  });

  // Seed a usage log with FIFO attribution
  const usageLog = await prisma.usageLog.create({
    data: {
      raidDate: new Date("2026-03-19"),
      itemType: "FLASK_CAULDRON" as ItemType,
      itemName: "Flask Cauldron",
      quantityUsed: 2,
      notes: "Wed raid",
    },
  });

  await prisma.usageLine.create({
    data: {
      usageLogId: usageLog.id,
      batchId: batch1.id,
      quantity: 2,
      costPerUnit: 5000,
    },
  });

  const usageLog2 = await prisma.usageLog.create({
    data: {
      raidDate: new Date("2026-03-19"),
      itemType: "FEAST" as ItemType,
      itemName: "Primary Stat",
      quantityUsed: 3,
      notes: "Wed raid",
    },
  });

  await prisma.usageLine.create({
    data: {
      usageLogId: usageLog2.id,
      batchId: batch2.id,
      quantity: 3,
      costPerUnit: 2000,
    },
  });

  console.log("Seeding complete!");
  console.log(`Created crafters: BNOC (${crafter1.id}), Jon (${crafter2.id}), Glenn (${crafter3.id})`);
  console.log(`Created batches: ${batch1.id}, ${batch2.id}, ${batch3.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
