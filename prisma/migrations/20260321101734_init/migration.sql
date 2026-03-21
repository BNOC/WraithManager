-- CreateTable
CREATE TABLE "Crafter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ConsumableEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crafterId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL DEFAULT 'OTHER',
    "quantity" INTEGER NOT NULL,
    "costPerUnit" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "craftedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raidDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsumableEntry_crafterId_fkey" FOREIGN KEY ("crafterId") REFERENCES "Crafter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crafterId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_crafterId_fkey" FOREIGN KEY ("crafterId") REFERENCES "Crafter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
