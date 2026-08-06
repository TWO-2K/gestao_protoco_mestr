import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  listarAnimais,
  criarAnimal,
  excluirAnimal,
  adicionarExame as inserirExame,
  removerExame as excluirExame,
  adicionarIntervencao as inserirIntervencao,
  limparCacheEstudo,
} from './animalDatabase';
import { useAuth } from './AuthContext';

const AnimalContext = createContext(null);

export function AnimalProvider({ children }) {
  const { session } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!session) {
      limparCacheEstudo();
      setAnimais([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      setAnimais(await listarAnimais());
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, [session]);

  useEffect(() => { recarregar(); }, [recarregar]);

  const adicionarAnimal = useCallback(async (animal) => {
    const criado = await criarAnimal(animal);
    setAnimais((prev) => [...prev, criado].sort((a, b) => a.id.localeCompare(b.id)));
  }, []);

  const removerAnimalItem = useCallback(async (id) => {
    await excluirAnimal(id);
    setAnimais((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const adicionarExame = useCallback(async (animalId, exame) => {
    const novo = await inserirExame(animalId, exame);
    setAnimais((prev) => prev.map((a) => (a.id === animalId ? { ...a, exames: [...(a.exames || []), novo] } : a)));
  }, []);

  const removerExame = useCallback(async (animalId, exameId) => {
    await excluirExame(exameId);
    setAnimais((prev) => prev.map((a) => (a.id === animalId ? { ...a, exames: (a.exames || []).filter((e) => e.id !== exameId) } : a)));
  }, []);

  const adicionarIntervencao = useCallback(async (animalId, intervencao) => {
    const nova = await inserirIntervencao(animalId, intervencao);
    setAnimais((prev) => prev.map((a) => (a.id === animalId ? { ...a, intervencoes: [...(a.intervencoes || []), nova] } : a)));
  }, []);

  return (
    <AnimalContext.Provider
      value={{ animais, carregando, adicionarAnimal, removerAnimal: removerAnimalItem, adicionarExame, removerExame, adicionarIntervencao }}
    >
      {children}
    </AnimalContext.Provider>
  );
}

export function useAnimais() {
  const ctx = useContext(AnimalContext);
  if (!ctx) throw new Error('useAnimais must be used within AnimalProvider');
  return ctx;
}
