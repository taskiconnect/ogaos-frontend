// components/dashboard/RevenueChart.tsx
'use client';

export default function RevenueChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [124000, 198000, 165000, 245000, 312000, 278000, 189000]; // mock ₦
  const max = Math.max(...values);

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm text-gray-400">Weekly Revenue</div>
          <div className="text-2xl font-semibold tracking-tight text-white mt-1">₦1,511,000</div>
        </div>
        <div className="text-emerald-400 text-sm font-medium flex items-center gap-1">
          +18.4% <span className="text-gray-500">this week</span>
        </div>
      </div>

      <div className="flex items-end h-64 gap-3 px-2">
        {days.map((day, i) => {
          const height = (values[i] / max) * 100;
          return (
            <div key={day} className="flex-1 flex flex-col justify-end items-center gap-2 group">
              <div 
                className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-xl transition-all duration-300 group-hover:brightness-110"
                style={{ height: `${height}%` }}
              />
              <div className="text-[10px] text-gray-500 font-medium">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}