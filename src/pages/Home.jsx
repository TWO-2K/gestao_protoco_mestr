import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimais } from '@/lib/AnimalContext';
import { useAuth } from '@/lib/AuthContext';
import { exportData } from '@/lib/animalStore';
import BarraEstatisticas from '@/components/animais/BarraEstatisticas';
import Filtros from '@/components/animais/Filtros';
import TabelaAnimais from '@/components/animais/TabelaAnimais';
import CartaoAnimal from '@/components/animais/CartaoAnimal';
import PainelCadastro from '@/components/animais/PainelCadastro';
import { Table2, LayoutGrid, Download, Activity, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHIPS = [
  { label: 'Todos', value: 'all' },
  { label: 'Lote A', value: 'Lote A' },
  { label: 'Lote B', value: 'Lote B' },
  { label: 'G1', value: 'G1' },
  { label: 'G2', value: 'G2' },
  { label: 'G3', value: 'G3' },
];

export default function Home() {
  const { animais } = useAnimais();
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('table');
  const [filters, setFilters] = useState({ group: 'all', status: 'all', search: '' });
  const [registerOpen, setRegisterOpen] = useState(false);

  const filtered = useMemo(() => {
    return animais.filter((a) => {
      if (filters.group !== 'all' && a.lote !== filters.group && a.grupoExperimental !== filters.group) return false;
      if (filters.status !== 'all' && a.estadoSaude !== filters.status) return false;
      if (filters.search && !a.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [animais, filters]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Painel de Pesquisa Animal</h1>
              <p className="text-xs text-muted-foreground leading-tight">Gestão de Protocolo CEUA — Mestrado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Administração
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => exportData(animais)}>
              <Download className="w-4 h-4 mr-1.5" /> Exportar
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <BarraEstatisticas animais={animais} />

        <div className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilters((p) => ({ ...p, group: chip.value }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.group === chip.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[280px]">
            <Filtros filters={filters} onChange={setFilters} onRegister={() => setRegisterOpen(true)} />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-card">
            <button
              onClick={() => setView('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              <Table2 className="w-3.5 h-3.5" /> Tabela
            </button>
            <button
              onClick={() => setView('cards')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cartões
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Nenhum animal encontrado com os filtros atuais.</p>
          </div>
        ) : view === 'table' ? (
          <TabelaAnimais animais={filtered} onSelect={(id) => navigate(`/animal/${id}`)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <CartaoAnimal key={a.id} animal={a} onSelect={(id) => navigate(`/animal/${id}`)} />
            ))}
          </div>
        )}
      </main>

      <PainelCadastro open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
