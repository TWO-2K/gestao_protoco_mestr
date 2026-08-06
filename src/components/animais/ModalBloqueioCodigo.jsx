import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck } from 'lucide-react';
import { hasCode, setCode, verifyCode } from '@/lib/animalStore';

export default function ModalBloqueioCodigo({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('verify');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const refs = useRef([]);

  useEffect(() => {
    if (open) {
      setMode(hasCode() ? 'verify' : 'set');
      setDigits(['', '', '', '']);
      setConfirmDigits(['', '', '', '']);
      setError('');
      setStep(1);
      setTimeout(() => refs.current[0]?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (mode === 'set' && step === 2) {
      setConfirmDigits(['', '', '', '']);
      setError('');
      setTimeout(() => refs.current[0]?.focus(), 120);
    }
  }, [step, mode]);

  const handleChange = (index, value, arr, setArr) => {
    const v = value.replace(/\D/g, '').slice(0, 1);
    const next = [...arr];
    next[index] = v;
    setArr(next);
    if (v && index < 3) refs.current[index + 1]?.focus();
  };

  const handleKey = (index, e, arr) => {
    if (e.key === 'Backspace' && !arr[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < 4) { setError('Digite os 4 dígitos'); return; }

    if (mode === 'verify') {
      if (verifyCode(code)) { onSuccess(); onClose(); }
      else {
        setError('Código incorreto');
        setDigits(['', '', '', '']);
        setTimeout(() => refs.current[0]?.focus(), 120);
      }
    } else {
      if (step === 1) { setStep(2); setError(''); }
      else {
        const confirm = confirmDigits.join('');
        if (confirm.length < 4) { setError('Confirme os 4 dígitos'); return; }
        if (code !== confirm) { setError('Os códigos não coincidem'); return; }
        setCode(code);
        onSuccess();
        onClose();
      }
    }
  };

  const currentDigits = mode === 'set' && step === 2 ? confirmDigits : digits;
  const setCurrentDigits = mode === 'set' && step === 2 ? setConfirmDigits : setDigits;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {mode === 'set' ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-base">
                {mode === 'set' ? (step === 1 ? 'Definir código de edição' : 'Confirmar código') : 'Código de edição'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {mode === 'set'
                  ? step === 1 ? 'Crie um código de 4 dígitos para proteger edições' : 'Repita o código para confirmar'
                  : 'Digite o código de 4 dígitos para liberar a edição'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-center gap-3 py-4">
          {currentDigits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value, currentDigits, setCurrentDigits)}
              onKeyDown={(e) => handleKey(i, e, currentDigits)}
              className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {mode === 'set' && step === 1 ? 'Continuar' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
