const GROUP_STYLES = {
  'Lote A': 'bg-blue-50 text-blue-700 border-blue-200',
  'Lote B': 'bg-violet-50 text-violet-700 border-violet-200',
  'G1': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'G2': 'bg-rose-50 text-rose-700 border-rose-200',
  'G3': 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function TagGrupo({ group }) {
  const style = GROUP_STYLES[group] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${style}`}>
      {group}
    </span>
  );
}
