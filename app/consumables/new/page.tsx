export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Crafter } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createConsumableEntry } from "@/lib/actions";

export default async function NewConsumablePage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
  });

  if (crafters.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            No Crafters Found
          </h2>
          <p className="text-zinc-400 mb-4">
            You need to add at least one crafter before logging consumables.
          </p>
          <Link
            href="/crafters"
            className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm inline-block"
          >
            Add Crafters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Log Consumables</h1>
        <p className="text-zinc-400 mt-1">Record crafted consumables for the guild</p>
      </div>

      <form
        action={createConsumableEntry}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5"
      >
        {/* Crafter */}
        <div>
          <label
            htmlFor="crafterId"
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            Crafter <span className="text-red-400">*</span>
          </label>
          <select
            id="crafterId"
            name="crafterId"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          >
            {crafters.map((c: Crafter) => (
              <option key={c.id} value={c.id}>
                {c.characterName} ({c.name})
              </option>
            ))}
          </select>
        </div>

        {/* Item name */}
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            Item Name <span className="text-red-400">*</span>
          </label>
          <input
            id="itemName"
            name="itemName"
            type="text"
            required
            placeholder="e.g. Flask of Tempered Swiftness"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Type and quantity row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="itemType"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Type <span className="text-red-400">*</span>
            </label>
            <select
              id="itemType"
              name="itemType"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            >
              <option value="FLASK">Flask</option>
              <option value="POTION">Potion</option>
              <option value="FOOD">Food</option>
              <option value="ENCHANT">Enchant</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              required
              min="1"
              defaultValue="1"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Cost per unit */}
        <div>
          <label
            htmlFor="costPerUnit"
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            Cost per Unit (gold) <span className="text-red-400">*</span>
          </label>
          <input
            id="costPerUnit"
            name="costPerUnit"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="e.g. 250"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Raid date */}
        <div>
          <label
            htmlFor="raidDate"
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            Raid Date{" "}
            <span className="text-zinc-500 font-normal">(optional — Wed/Thu/Mon)</span>
          </label>
          <input
            id="raidDate"
            name="raidDate"
            type="date"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            Notes <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Any additional notes..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Save Entry
          </button>
          <Link
            href="/consumables"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-6 py-2 rounded-lg transition-colors border border-zinc-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
