'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

const calculatePIT = (profit: number) => {
  if (profit <= 800000) return 0;
  let tax = 0;
  let remaining = profit;

  // 800k - 3M @ 15%
  const band1 = Math.min(Math.max(remaining - 800000, 0), 2200000);
  tax += band1 * 0.15;
  remaining -= band1;

  // 3M - 12M @ 18%
  const band2 = Math.min(Math.max(remaining, 0), 9000000);
  tax += band2 * 0.18;
  remaining -= band2;

  // 12M - 25M @ 21%
  const band3 = Math.min(Math.max(remaining, 0), 13000000);
  tax += band3 * 0.21;
  remaining -= band3;

  // 25M - 50M @ 23%
  const band4 = Math.min(Math.max(remaining, 0), 25000000);
  tax += band4 * 0.23;
  remaining -= band4;

  // Above 50M @ 25%
  tax += remaining * 0.25;

  return Math.round(tax);
};

export default function TaxCalculator() {
  const [revenue, setRevenue] = useState(4500000);
  const [expenses, setExpenses] = useState(2100000);

  const profit = Math.max(revenue - expenses, 0);
  const tax = calculatePIT(profit);
  const effectiveRate = profit > 0 ? ((tax / profit) * 100).toFixed(1) : '0';

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-primary" />
        <div className="font-semibold text-lg">2026 Tax Estimator</div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">ESTIMATED ANNUAL REVENUE</label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-5 text-2xl font-semibold"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">ANNUAL EXPENSES</label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-5 text-2xl font-semibold"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Profit</span>
            <span className="font-semibold">₦{profit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Estimated PIT (Personal Income Tax)</span>
            <span className="font-semibold text-emerald-400">₦{tax.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500 bg-white/5 p-4 rounded-2xl">
            As a Starter Plan SME you are likely <span className="text-primary font-medium">0% CIT</span> (turnover under ₦50M). 
            This shows Personal Income Tax on profit only.
          </div>
        </div>
      </div>
    </div>
  );
}