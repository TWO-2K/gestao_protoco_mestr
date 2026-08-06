import { PawPrint, Scale, HeartPulse } from 'lucide-react';

export default function BarraEstatisticas({ animais }) {
  const total = animais.length;
  const avgWeight = total > 0 ? (animais.reduce((s, a) => s + (Number(a.pesoAtual) || 0), 0) / total).toFixed(2) : '0.00';
  const healthy = animais.filter((a) => a.estadoSaude === 'Saudável' || a.estadoSaude === 'Normal').length;
  const rate = total > 0 ? Math.round((healthy / total) * 100) : 0;

  const stats = [
    { label: 'Total de Animais', value: total, icon: PawPrint, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Peso Médio', value: `${avgWeight} kg`, icon: Scale, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Taxa de Saudáveis', value: `${rate}%`, icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 sm:px-4 sm:py-4">
          <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold leading-tight">{s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
