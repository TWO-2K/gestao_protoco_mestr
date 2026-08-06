import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnimais } from '@/lib/AnimalContext';

export default function PainelCadastro({ open, onClose }) {
  const { adicionarAnimal } = useAnimais();
  const [form, setForm] = useState({
    id: '', lote: 'Lote A', grupoExperimental: 'G1', pesoAtual: '', escoreCorporal: 3,
    estadoSaude: 'Saudável', racaoDia: '', dataInspecao: new Date().toISOString().slice(0, 10),
    idadeMeses: '', especieRaca: 'Nova Zelândia', sexo: 'M', dataChegada: '', metodoIdentificacao: 'Microchip',
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    if (!form.id || !form.pesoAtual) return;
    adicionarAnimal({
      ...form,
      pesoAtual: Number(form.pesoAtual),
      racaoDia: Number(form.racaoDia) || 0,
      escoreCorporal: Number(form.escoreCorporal),
    });
    onClose();
    setForm({ ...form, id: '', pesoAtual: '', racaoDia: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Novo Animal</DialogTitle>
          <DialogDescription>Preencha os dados de cadastro do animal</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>ID do Animal *</Label>
            <Input value={form.id} onChange={(e) => update('id', e.target.value)} placeholder="ex: C-07" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lote</Label>
              <Select value={form.lote} onValueChange={(v) => update('lote', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lote A">Lote A</SelectItem>
                  <SelectItem value="Lote B">Lote B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Grupo Experimental</Label>
              <Select value={form.grupoExperimental} onValueChange={(v) => update('grupoExperimental', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="G1">G1 — Controle</SelectItem>
                  <SelectItem value="G2">G2 — IRA</SelectItem>
                  <SelectItem value="G3">G3 — IRA + VEs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Peso (kg) *</Label>
              <Input type="number" step="0.1" value={form.pesoAtual} onChange={(e) => update('pesoAtual', e.target.value)} placeholder="2.5" />
            </div>
            <div className="space-y-1.5">
              <Label>Escore Corporal</Label>
              <Select value={String(form.escoreCorporal)} onValueChange={(v) => update('escoreCorporal', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} {n > 1 ? 'estrelas' : 'estrela'}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status de Saúde</Label>
              <Select value={form.estadoSaude} onValueChange={(v) => update('estadoSaude', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saudável">Saudável</SelectItem>
                  <SelectItem value="Atenção">Atenção</SelectItem>
                  <SelectItem value="Grau 1">Grau 1</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ração/Dia (g)</Label>
              <Input type="number" value={form.racaoDia} onChange={(e) => update('racaoDia', e.target.value)} placeholder="120" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data de Inspeção</Label>
              <Input type="date" value={form.dataInspecao} onChange={(e) => update('dataInspecao', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sexo</Label>
              <Select value={form.sexo} onValueChange={(v) => update('sexo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Macho</SelectItem>
                  <SelectItem value="F">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Idade</Label>
              <Input value={form.idadeMeses} onChange={(e) => update('idadeMeses', e.target.value)} placeholder="8 meses" />
            </div>
            <div className="space-y-1.5">
              <Label>Espécie/Raça</Label>
              <Input value={form.especieRaca} onChange={(e) => update('especieRaca', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data de Chegada</Label>
              <Input type="date" value={form.dataChegada} onChange={(e) => update('dataChegada', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Identificação</Label>
              <Select value={form.metodoIdentificacao} onValueChange={(v) => update('metodoIdentificacao', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Microchip">Microchip</SelectItem>
                  <SelectItem value="Tatuagem">Tatuagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!form.id || !form.pesoAtual}>
            Adicionar Animal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
