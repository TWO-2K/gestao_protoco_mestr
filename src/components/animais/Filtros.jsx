import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Filtros({ filters, onChange, onRegister }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Select value={filters.group} onValueChange={(v) => update('group', v)}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Grupos</SelectItem>
          <SelectItem value="Lote A">Lote A</SelectItem>
          <SelectItem value="Lote B">Lote B</SelectItem>
          <SelectItem value="G1">G1 — Controle</SelectItem>
          <SelectItem value="G2">G2 — IRA</SelectItem>
          <SelectItem value="G3">G3 — IRA + VEs</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="Saudável">Saudável</SelectItem>
          <SelectItem value="Atenção">Atenção</SelectItem>
          <SelectItem value="Grau 1">Grau 1</SelectItem>
          <SelectItem value="Normal">Normal</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[140px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Button onClick={onRegister} className="h-9 bg-emerald-600 hover:bg-emerald-700">
        <Plus className="w-4 h-4 mr-1" />
        Registrar Animal
      </Button>
    </div>
  );
}
