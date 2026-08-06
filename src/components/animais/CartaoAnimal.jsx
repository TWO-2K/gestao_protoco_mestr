import EscoreCorporal from './EscoreCorporal';
import SeloSaude from './SeloSaude';
import TagGrupo from './TagGrupo';
import { ChevronRight } from 'lucide-react';

export default function CartaoAnimal({ animal, onSelect }) {
  const a = animal;
  return (
    <div
      onClick={() => onSelect(a.id)}
      className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{a.id}</h3>
          <div className="flex items-center gap-2 mt-1">
            <TagGrupo group={a.lote} />
            {a.grupoExperimental && <TagGrupo group={a.grupoExperimental} />}
          </div>
        </div>
        <SeloSaude status={a.estadoSaude} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="font-semibold tabular-nums">{Number(a.pesoAtual).toFixed(1)} kg</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ração/Dia</p>
          <p className="font-semibold tabular-nums">{a.racaoDia}g</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Escore Corporal</p>
          <EscoreCorporal score={a.escoreCorporal} size={12} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Inspeção</p>
          <p className="font-semibold text-xs">{a.dataInspecao}</p>
        </div>
      </div>

      <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
