import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { useAnimais } from '@/lib/AnimalContext';

const CATEGORIES = [
  { value: 'bioquimica', label: 'Bioquímica Sérica/Renal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'hemograma', label: 'Hemograma', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'urinalise', label: 'Urinálise', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'ultrassom', label: 'Ultrassonografia', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'histopatologico', label: 'Histopatologia', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const MOMENTS = ['D-0 Basal', 'D-3 Pós-IRA', 'D-7 Pós-VEs', 'D-14', 'D-21'];

export default function PainelExames({ animal, onRequireCode }) {
  const { adicionarExame, removerExame } = useAnimais();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    parametro: '', valor: '', unidade: '', categoria: 'bioquimica', momento: 'D-0 Basal',
  });

  const exames = animal.exames || [];
  const filtered = filter === 'all' ? exames : exames.filter((e) => e.categoria === filter);

  const handleSubmit = () => {
    if (!form.parametro || !form.valor) return;
    adicionarExame(animal.id, form);
    setForm({ ...form, parametro: '', valor: '', unidade: '' });
    setShowForm(false);
  };

  const handleDelete = (exameId) => {
    onRequireCode(() => removerExame(animal.id, exameId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} registro(s)</span>
        </div>
        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova Coleta
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Momento</Label>
              <Select value={form.momento} onValueChange={(v) => setForm({ ...form, momento: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{MOMENTS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Parâmetro</Label>
              <Input value={form.parametro} onChange={(e) => setForm({ ...form, parametro: e.target.value })} className="h-8 text-sm" placeholder="Creatinina" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor</Label>
              <Input value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="h-8 text-sm" placeholder="0.8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unidade</Label>
              <Input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} className="h-8 text-sm" placeholder="mg/dL" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-8" onClick={handleSubmit}>Salvar</Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum exame registrado</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Data</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Momento</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Parâmetro</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Valor</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Unidade</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const cat = CATEGORIES.find((c) => c.value === e.categoria);
                return (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{e.date}</td>
                    <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded border ${cat?.color || ''}`}>{e.momento}</span></td>
                    <td className="px-3 py-2 font-medium">{e.parametro}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{e.valor}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.unidade}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleDelete(e.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
