import { supabase } from './supabaseClient';

let estudoIdCache = null;

export function limparCacheEstudo() {
  estudoIdCache = null;
}

async function garantirEstudoId() {
  if (estudoIdCache) return estudoIdCache;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membro } = await supabase
    .from('membros_estudo')
    .select('estudo_id')
    .eq('usuario_id', user.id)
    .limit(1)
    .maybeSingle();

  if (membro) {
    estudoIdCache = membro.estudo_id;
    return estudoIdCache;
  }

  const { data: perfil } = await supabase.from('perfis').select('nome_completo, email').eq('id', user.id).single();
  const { data: novoEstudo, error } = await supabase
    .from('estudos')
    .insert({ responsavel_id: user.id, nome: `Estudo de ${perfil?.nome_completo || perfil?.email || 'usuário'}` })
    .select('id')
    .single();
  if (error) throw error;

  estudoIdCache = novoEstudo.id;
  return estudoIdCache;
}

function linhaParaAnimal(row) {
  return {
    _uuid: row.id,
    id: row.codigo_animal,
    lote: row.nome_lote,
    grupoExperimental: row.grupo_experimental,
    sexo: row.sexo,
    especieRaca: row.especie_raca,
    idadeMeses: row.idade_meses,
    dataChegada: row.data_chegada,
    metodoIdentificacao: row.metodo_identificacao,
    percentualAclimatacao: row.percentual_aclimatacao != null ? Number(row.percentual_aclimatacao) : 0,
    escoreCorporal: row.escore_corporal,
    estadoSaude: row.estado_saude,
    pesoAtual: row.peso_atual_kg != null ? Number(row.peso_atual_kg) : null,
    racaoDia: row.racao_dia_g != null ? Number(row.racao_dia_g) : 0,
    dataInspecao: row.data_inspecao,
    bloqueado: row.bloqueado,
    observacoes: row.observacoes,
    historicoPeso: [],
    historicoRacao: [],
    historicoAgua: [],
    exames: [],
    intervencoes: [],
  };
}

export async function listarAnimais() {
  const estudoId = await garantirEstudoId();
  if (!estudoId) return [];

  const { data: linhas, error } = await supabase
    .from('animais')
    .select('*')
    .eq('estudo_id', estudoId);
  if (error) throw error;
  if (!linhas.length) return [];

  const animais = linhas.map(linhaParaAnimal);
  const porUuid = Object.fromEntries(animais.map((a) => [a._uuid, a]));
  const ids = linhas.map((l) => l.id);

  const [{ data: peso }, { data: racao }, { data: agua }, { data: exames }, { data: intervencoes }] = await Promise.all([
    supabase.from('medicoes_peso').select('*').in('animal_id', ids).order('medido_em'),
    supabase.from('medicoes_racao').select('*').in('animal_id', ids).order('medido_em'),
    supabase.from('medicoes_agua').select('*').in('animal_id', ids).order('medido_em'),
    supabase.from('exames').select('*').in('animal_id', ids).order('coletado_em'),
    supabase.from('intervencoes').select('*').in('animal_id', ids).order('realizado_em'),
  ]);

  (peso || []).forEach((p) => porUuid[p.animal_id]?.historicoPeso.push({ date: p.medido_em, peso: Number(p.peso_kg) }));
  (racao || []).forEach((r) => porUuid[r.animal_id]?.historicoRacao.push({ date: r.medido_em, quantidade: Number(r.quantidade_g) }));
  (agua || []).forEach((a) => porUuid[a.animal_id]?.historicoAgua.push({ date: a.medido_em, quantidade: Number(a.quantidade_ml) }));
  (exames || []).forEach((e) => porUuid[e.animal_id]?.exames.push({
    id: e.id, date: e.coletado_em, parametro: e.nome_parametro, valor: e.valor_resultado, unidade: e.unidade, categoria: e.categoria, momento: e.momento,
  }));
  (intervencoes || []).forEach((i) => porUuid[i.animal_id]?.intervencoes.push({
    id: i.id, date: i.realizado_em, tipo: i.tipo_intervencao, medicamento: i.medicamento, dose: i.dose, viaAdministracao: i.via_administracao, status: i.status, idLote: i.id_lote,
  }));

  return animais.sort((a, b) => a.id.localeCompare(b.id));
}

export async function criarAnimal(animal) {
  const estudoId = await garantirEstudoId();
  const hoje = new Date().toISOString().slice(0, 10);
  const dataInspecao = animal.dataInspecao || hoje;

  const { data: row, error } = await supabase
    .from('animais')
    .insert({
      estudo_id: estudoId,
      codigo_animal: animal.id,
      nome_lote: animal.lote,
      grupo_experimental: animal.grupoExperimental,
      sexo: animal.sexo,
      especie_raca: animal.especieRaca,
      idade_meses: animal.idadeMeses,
      data_chegada: animal.dataChegada || null,
      metodo_identificacao: animal.metodoIdentificacao,
      percentual_aclimatacao: animal.percentualAclimatacao || 0,
      escore_corporal: animal.escoreCorporal,
      estado_saude: animal.estadoSaude,
      peso_atual_kg: animal.pesoAtual,
      racao_dia_g: animal.racaoDia || 0,
      data_inspecao: dataInspecao,
      bloqueado: true,
    })
    .select('*')
    .single();
  if (error) throw error;

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('medicoes_peso').insert({
    animal_id: row.id,
    medido_em: dataInspecao,
    peso_kg: animal.pesoAtual,
    registrado_por: user?.id ?? null,
  });

  const criado = linhaParaAnimal(row);
  criado.historicoPeso = [{ date: dataInspecao, peso: Number(animal.pesoAtual) }];
  return criado;
}

export async function excluirAnimal(codigoAnimal) {
  const estudoId = await garantirEstudoId();
  const { error } = await supabase.from('animais').delete().eq('estudo_id', estudoId).eq('codigo_animal', codigoAnimal);
  if (error) throw error;
}

async function buscarUuidAnimal(codigoAnimal) {
  const estudoId = await garantirEstudoId();
  const { data, error } = await supabase
    .from('animais')
    .select('id')
    .eq('estudo_id', estudoId)
    .eq('codigo_animal', codigoAnimal)
    .single();
  if (error) throw error;
  return data.id;
}

export async function adicionarExame(codigoAnimal, exame) {
  const animalId = await buscarUuidAnimal(codigoAnimal);
  const { data: { user } } = await supabase.auth.getUser();
  const valorNumerico = Number(exame.valor);

  const { data, error } = await supabase
    .from('exames')
    .insert({
      animal_id: animalId,
      coletado_em: exame.date,
      categoria: exame.categoria,
      momento: exame.momento,
      nome_parametro: exame.parametro,
      valor_resultado: exame.valor,
      valor_numerico: Number.isNaN(valorNumerico) ? null : valorNumerico,
      unidade: exame.unidade,
      registrado_por: user?.id ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;

  return {
    id: data.id, date: data.coletado_em, parametro: data.nome_parametro,
    valor: data.valor_resultado, unidade: data.unidade, categoria: data.categoria, momento: data.momento,
  };
}

export async function removerExame(exameId) {
  const { error } = await supabase.from('exames').delete().eq('id', exameId);
  if (error) throw error;
}

export async function adicionarIntervencao(codigoAnimal, intervencao) {
  const animalId = await buscarUuidAnimal(codigoAnimal);
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('intervencoes')
    .insert({
      animal_id: animalId,
      realizado_em: intervencao.date,
      tipo_intervencao: intervencao.tipo,
      medicamento: intervencao.medicamento,
      dose: intervencao.dose,
      via_administracao: intervencao.viaAdministracao,
      status: intervencao.status || 'Planejado',
      id_lote: intervencao.idLote,
      registrado_por: user?.id ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;

  return {
    id: data.id, date: data.realizado_em, tipo: data.tipo_intervencao, medicamento: data.medicamento,
    dose: data.dose, viaAdministracao: data.via_administracao, status: data.status, idLote: data.id_lote,
  };
}
