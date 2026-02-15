import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function SavingsChart({ data, currency }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-muted)]">
        No savings data
      </div>
    );
  }

  const hasNegative = data.some((d) => (d.savings ?? d.amount) < 0);
  const hasProjected = data.some((d) => d.savingsProjected != null);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="savingsNeg" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          axisLine={{ stroke: '#262626' }}
        />
        <YAxis
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
        />
        {hasNegative && (
          <ReferenceLine y={0} stroke="#525252" strokeDasharray="2 2" />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#141414',
            border: '1px solid #262626',
            borderRadius: '8px',
          }}
          formatter={(value, name) => {
            const label = name === 'savingsProjected' ? 'Savings (no data yet)' : 'Savings';
            return [
              `${Number(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${currency}`,
              label,
            ];
          }}
        />
        <Area
          type="monotone"
          dataKey="savings"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#savingsGrad)"
        />
        {hasProjected && (
          <Line
            type="monotone"
            dataKey="savingsProjected"
            connectNulls
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
