import EscoreCorporal from './EscoreCorporal';
import SeloSaude from './SeloSaude';
import TagGrupo from './TagGrupo';
import { ChevronRight } from 'lucide-react';

export default function TabelaAnimais({ animais, onSelect }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">ID do Animal</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Grupo</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Peso</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Escore Corporal</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Ração/Dia</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Inspeção</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {animais.map((a) => (
              <tr
                key={a.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onSelect(a.id)}
              >
                <td className="px-4 py-3 font-semibold">{a.id}</td>
                <td className="px-4 py-3"><TagGrupo group={a.lote} /></td>
                <td className="px-4 py-3 tabular-nums">{Number(a.pesoAtual).toFixed(1)} kg</td>
                <td className="px-4 py-3"><EscoreCorporal score={a.escoreCorporal} /></td>
                <td className="px-4 py-3"><SeloSaude status={a.estadoSaude} /></td>
                <td className="px-4 py-3 tabular-nums">{a.racaoDia}g</td>
                <td className="px-4 py-3 text-muted-foreground">{a.dataInspecao}</td>
                <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
