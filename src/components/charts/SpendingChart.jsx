import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#ef4444', '#f87171', '#fb923c', '#fbbf24'];

export default function SpendingChart({ data, currency }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-muted)]">
        No spending data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <Tooltip
          contentStyle={{
            backgroundColor: '#141414',
            border: '1px solid #262626',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#a3a3a3' }}
          formatter={(value) => [
            `${Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${currency}`,
            'Spending',
          ]}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#ef4444">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
