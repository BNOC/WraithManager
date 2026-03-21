export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { createPayment } from "@/lib/actions";

function formatGold(amount: number) {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}g`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PaymentsPage() {
  const crafters = await prisma.crafter.findMany({
    orderBy: { characterName: "asc" },
    include: {
      entries: true,
      payments: true,
    },
  });

  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: { crafter: true },
  });

  const crafterBalances = crafters.map((crafter) => {
    const availableCost = crafter.entries
      .filter((e) => e.status === "AVAILABLE")
      .reduce((sum, e) => sum + e.totalCost, 0);
    const totalPaid = crafter.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOwed = Math.max(0, availableCost - totalPaid);
    return { ...crafter, availableCost, totalPaid, totalOwed };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">Payments</h1>
        <p className="text-zinc-400 mt-1">Log payments to crafters and view payment history</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Log payment form */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Log Payment</h2>
          {crafters.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
              <p className="text-zinc-400">No crafters found. Add crafters first.</p>
            </div>
          ) : (
            <form
              action={createPayment}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4"
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
                  {crafters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.characterName} — owes {formatGold(
                        crafterBalances.find((b) => b.id === c.id)?.totalOwed ?? 0
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  Amount (gold) <span className="text-red-400">*</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 5000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="paidAt"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  Date{" "}
                  <span className="text-zinc-500 font-normal">(optional, defaults to today)</span>
                </label>
                <input
                  id="paidAt"
                  name="paidAt"
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
                  Notes{" "}
                  <span className="text-zinc-500 font-normal">(optional)</span>
                </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="e.g. Wed raid payout"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                Record Payment
              </button>
            </form>
          )}

          {/* Crafter balance summary */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Current Balances</h3>
            <div className="space-y-2">
              {crafterBalances.map((crafter) => (
                <div
                  key={crafter.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-zinc-100">
                      {crafter.characterName}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {formatGold(crafter.availableCost)} crafted ·{" "}
                      {formatGold(crafter.totalPaid)} paid
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      crafter.totalOwed > 0 ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    {formatGold(crafter.totalOwed)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            Payment History
            <span className="ml-2 text-sm font-normal text-zinc-400">
              ({payments.length})
            </span>
          </h2>
          {payments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-400">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">
                      Crafter
                    </th>
                    <th className="text-right px-4 py-3 text-zinc-400 font-medium">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-zinc-100 font-medium">
                        {payment.crafter.characterName}
                      </td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        {formatGold(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                        {payment.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
