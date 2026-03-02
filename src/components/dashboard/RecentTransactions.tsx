// components/dashboard/RecentTransactions.tsx
'use client';

const mockTransactions = [
  { id: 1, customer: 'Ikeja Market Trader', type: 'Sale', amount: 12400, time: '11:42am', status: 'success' },
  { id: 2, customer: 'Chinedu Transport', type: 'Expense', amount: -8500, time: '10:15am', status: 'success' },
  { id: 3, customer: 'Aisha Boutique', type: 'Debt Payment', amount: 32000, time: 'Yesterday', status: 'success' },
];

export default function RecentTransactions() {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="font-semibold">Recent Activity</div>
        <span className="text-xs text-primary cursor-pointer hover:underline">View ledger →</span>
      </div>

      <div className="space-y-6">
        {mockTransactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${tx.type === 'Sale' ? 'bg-emerald-500/10' : tx.type === 'Expense' ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
                <span className="text-lg">{tx.type[0]}</span>
              </div>
              <div>
                <div className="font-medium text-sm">{tx.customer}</div>
                <div className="text-xs text-gray-500">{tx.time}</div>
              </div>
            </div>
            <div className={`font-semibold text-right ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}