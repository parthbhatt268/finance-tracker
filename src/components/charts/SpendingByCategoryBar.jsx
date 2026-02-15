import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const DEFAULT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export default function SpendingByCategoryBar({ data, currency, categoryColors = [] }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-muted)]">
        No spending this month
      </div>
    );
  }

  const colorMap = {};
  categoryColors.forEach((c, i) => {
    if (typeof c === 'object' && c.name) colorMap[c.name] = c.color || DEFAULT_COLORS[i];
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          axisLine={{ stroke: '#262626' }}
          tickFormatter={(v) => `${v}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#141414',
            border: '1px solid #262626',
            borderRadius: '8px',
          }}
          formatter={(value) => [
            `${Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${currency}`,
            'Spent',
          ]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#ef4444" minPointSize={4}>
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={colorMap[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
