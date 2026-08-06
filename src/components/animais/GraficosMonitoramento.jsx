import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficosMonitoramento({ animal }) {
  const weightData = (animal.historicoPeso || []).map((d) => ({ date: d.date.slice(5), peso: d.peso }));
  const feedData = (animal.historicoRacao || []).map((d) => ({ date: d.date.slice(5), quantidade: d.quantidade }));
  const waterData = (animal.historicoAgua || []).map((d) => ({ date: d.date.slice(5), quantidade: d.quantidade }));

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-3">Peso Corporal (kg)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={['dataMin - 0.1', 'dataMax + 0.1']} />
            <Tooltip />
            <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold mb-3">Consumo de Ração (g)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={feedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="quantidade" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Consumo de Água (mL)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
