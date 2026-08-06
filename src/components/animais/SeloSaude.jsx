const STYLES = {
  'Saudável': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Atenção': 'bg-amber-50 text-amber-700 border-amber-200',
  'Grau 1': 'bg-rose-50 text-rose-700 border-rose-200',
  'Grau 2': 'bg-rose-100 text-rose-800 border-rose-300',
  'IRA Severa': 'bg-rose-100 text-rose-800 border-rose-300',
  'IRA Moderada': 'bg-amber-100 text-amber-800 border-amber-300',
  'Normal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function SeloSaude({ status }) {
  const style = STYLES[status] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
