import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimais } from '@/lib/AnimalContext';
import EscoreCorporal from '@/components/animais/EscoreCorporal';
import SeloSaude from '@/components/animais/SeloSaude';
import TagGrupo from '@/components/animais/TagGrupo';
import GraficosMonitoramento from '@/components/animais/GraficosMonitoramento';
import PainelExames from '@/components/animais/PainelExames';
import ModalBloqueioCodigo from '@/components/animais/ModalBloqueioCodigo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Lock, Calendar, Dna, Beaker, Activity, FlaskConical, Check, X, Syringe, Microscope } from 'lucide-react';

const TABS = [
  { id: 'identification', label: 'Identificação', icon: Dna },
  { id: 'design', label: 'Delineamento', icon: Beaker },
  { id: 'monitoring', label: 'Acompanhamento', icon: Activity },
  { id: 'exams', label: 'Exames', icon: FlaskConical },
  { id: 'protocols', label: 'Protocolos', icon: Calendar },
];

const GROUP_INFO = {
  G1: { name: 'Controle Saudável (Sham)', ira: false, treatment: false, desc: 'Sem indução de IRA. Sem tratamento com VEs.', color: 'emerald', kidney: 'NORMAL' },
  G2: { name: 'Controle Positivo (IRA)', ira: true, treatment: false, desc: 'Indução com Gentamicina. Sem tratamento com VEs.', color: 'rose', kidney: 'DANIFICADO' },
  G3: { name: 'Grupo Tratado (IRA + VEs)', ira: true, treatment: true, desc: 'Indução com Gentamicina. Tratamento com VEs de MSCs.', color: 'amber', kidney: 'REPARAÇÃO' },
};

const COLOR_MAP = {
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-100' },
  rose: { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', icon: 'bg-rose-100' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100' },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value || '—'}</span>
    </div>
  );
}

function DesignCard({ group, active }) {
  const info = GROUP_INFO[group];
  const c = COLOR_MAP[info.color];
  return (
    <div className={`border-2 rounded-xl p-4 ${active ? `${c.border} ${c.bg}` : 'border-border opacity-60'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>
          <span className={`text-xs font-bold ${c.text}`}>{group}</span>
        </div>
        <div>
          <h4 className="font-semibold text-sm">{info.name}</h4>
          {active && <span className={`text-xs ${c.text}`}>Grupo atual</span>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{info.desc}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          {info.ira ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={info.ira ? '' : 'text-muted-foreground'}>Indução de IRA (Gentamicina)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {info.treatment ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={info.treatment ? '' : 'text-muted-foreground'}>Tratamento com VEs de MSCs</span>
        </div>
      </div>
      <div className={`mt-3 pt-3 border-t ${c.border}`}>
        <p className="text-xs font-medium">Ilustração: Rim <span className={c.text}>{info.kidney}</span></p>
      </div>
    </div>
  );
}

function Timeline({ animal }) {
  const phases = [
    { title: 'Baseline', period: 'Dia -2 / Dia 0', desc: 'Coleta de dados iniciais e exames de referência (sangue, peso, ultrassom).', done: true },
    { title: 'Indução da IRA', period: 'Dias 1-3', desc: 'Administração de Gentamicina para indução da lesão renal (G2 e G3).', done: animal.grupoExperimental === 'G2' || animal.grupoExperimental === 'G3' },
    { title: 'Terapia com VEs', period: 'Dia 4', desc: 'Aplicação de Vesículas Extracelulares (VEs MSCs) para o grupo G3.', done: animal.grupoExperimental === 'G3' },
    { title: 'Pontos Finais', period: 'Dias 7, 14, 21', desc: 'Coleta de exames (sangue, urina, imagem) e avaliação do desfecho.', done: false },
  ];
  return (
    <div>
      {phases.map((p, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
              {p.done ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
            </div>
            {i < phases.length - 1 && <div className={`w-0.5 flex-1 my-1 ${p.done ? 'bg-emerald-200' : 'bg-border'}`} style={{ minHeight: '2.5rem' }} />}
          </div>
          <div className="pb-6 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{p.title}</h4>
              <span className="text-xs text-muted-foreground">{p.period}</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { animais, removerAnimal } = useAnimais();
  const [tab, setTab] = useState('identification');
  const [codeModal, setCodeModal] = useState({ open: false, action: null });

  const animal = animais.find((a) => a.id === id);

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Animal não encontrado.</p>
          <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const requireCode = (action) => setCodeModal({ open: true, action });
  const handleDelete = () => requireCode(() => { removerAnimal(animal.id); navigate('/'); });
  const intervencoes = animal.intervencoes || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-lg">{animal.id}</h1>
                  <TagGrupo group={animal.lote} />
                  {animal.grupoExperimental && <TagGrupo group={animal.grupoExperimental} />}
                  <SeloSaude status={animal.estadoSaude} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {animal.especieRaca} · {animal.sexo === 'M' ? 'Macho' : 'Fêmea'} · {animal.idadeMeses}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {animal.bloqueado && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Bloqueado
                </span>
              )}
              <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'identification' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Dna className="w-4 h-4 text-primary" /> Identificação do Animal
                </h3>
                <div>
                  <InfoRow label="Identificador" value={animal.id} />
                  <InfoRow label="Identificação Única" value={animal.metodoIdentificacao} />
                  <InfoRow label="Idade" value={animal.idadeMeses} />
                  <InfoRow label="Espécie/Raça" value={animal.especieRaca} />
                  <InfoRow label="Sexo" value={animal.sexo === 'M' ? 'Macho' : 'Fêmea'} />
                  <InfoRow label="Data de Chegada" value={animal.dataChegada} />
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Período de Aclimatação</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${animal.percentualAclimatacao || 0}%` }} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{animal.percentualAclimatacao || 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Dados Clínicos Atuais</h3>
              <div>
                <InfoRow label="Peso Atual" value={`${Number(animal.pesoAtual).toFixed(1)} kg`} />
                <InfoRow label="Escore Corporal" value={<EscoreCorporal score={animal.escoreCorporal} />} />
                <InfoRow label="Status de Saúde" value={<SeloSaude status={animal.estadoSaude} />} />
                <InfoRow label="Ração/Dia" value={`${animal.racaoDia}g`} />
                <InfoRow label="Data de Inspeção" value={animal.dataInspecao} />
              </div>
            </div>
          </div>
        )}

        {tab === 'design' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Delineamento Experimental</h3>
              <p className="text-sm text-muted-foreground mb-4">Definição dos grupos experimentais do protocolo CEUA</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['G1', 'G2', 'G3'].map((g) => (
                <DesignCard key={g} group={g} active={animal.grupoExperimental === g} />
              ))}
            </div>
          </div>
        )}

        {tab === 'monitoring' && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Acompanhamento Ponderal e Clínico</h3>
            <GraficosMonitoramento animal={animal} />
          </div>
        )}

        {tab === 'exams' && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Coleta e Exames Complementares</h3>
            <PainelExames animal={animal} onRequireCode={requireCode} />
          </div>
        )}

        {tab === 'protocols' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Linha do Tempo do Experimento
              </h3>
              <Timeline animal={animal} />
            </div>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-primary" /> Intervenções Registradas
                </h3>
                {intervencoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma intervenção registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {intervencoes.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium">{inv.tipo}</p>
                          <p className="text-xs text-muted-foreground">{inv.medicamento} · {inv.dose} · {inv.viaAdministracao}</p>
                          {inv.idLote && <p className="text-xs text-muted-foreground">Lote: {inv.idLote}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{inv.date}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-primary" /> Protocolo de Terapia VEs
                </h3>
                <div>
                  <InfoRow label="VEs Batch ID" value="VE-L34" />
                  <InfoRow label="Concentration" value="2.5×10¹⁰ p/kg" />
                  <InfoRow label="Admin Route" value="IV / Subcapsular" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ModalBloqueioCodigo
        open={codeModal.open}
        onClose={() => setCodeModal({ open: false, action: null })}
        onSuccess={() => codeModal.action?.()}
      />
    </div>
  );
}
