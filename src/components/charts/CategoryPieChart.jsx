import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export default function CategoryPieChart({ data, currency, categoryColors = [] }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-muted)]">
        No category data
      </div>
    );
  }

  const colorMap = {};
  categoryColors.forEach((c, i) => {
    if (typeof c === 'object' && c.name) colorMap[c.name] = c.color || DEFAULT_COLORS[i];
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#525252' }}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={colorMap[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              stroke="#141414"
              strokeWidth={2}
            />
          ))}
        </Pie>
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
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => <span style={{ color: '#a3a3a3' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
