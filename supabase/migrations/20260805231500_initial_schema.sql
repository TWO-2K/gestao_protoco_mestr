-- Vet Rabbit: initial schema for Supabase/PostgreSQL.
-- Apply with `supabase db push` or paste this migration in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create type public.papel_estudo as enum ('proprietario', 'editor', 'visualizador');

create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.estudos (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references public.perfis(id) on delete restrict,
  nome text not null,
  descricao text,
  codigo_protocolo text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.membros_estudo (
  estudo_id uuid not null references public.estudos(id) on delete cascade,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  papel public.papel_estudo not null default 'visualizador',
  criado_em timestamptz not null default now(),
  primary key (estudo_id, usuario_id)
);

create table public.animais (
  id uuid primary key default gen_random_uuid(),
  estudo_id uuid not null references public.estudos(id) on delete cascade,
  codigo_animal text not null,
  nome_lote text,
  grupo_experimental text check (grupo_experimental in ('G1', 'G2', 'G3')),
  sexo text not null check (sexo in ('M', 'F')),
  especie_raca text,
  idade_meses smallint check (idade_meses >= 0),
  data_chegada date,
  metodo_identificacao text,
  percentual_aclimatacao numeric(5,2) not null default 0 check (percentual_aclimatacao between 0 and 100),
  escore_corporal smallint check (escore_corporal between 1 and 5),
  estado_saude text not null default 'Saudável',
  peso_atual_kg numeric(7,3) check (peso_atual_kg > 0),
  racao_dia_g numeric(9,2) check (racao_dia_g >= 0),
  data_inspecao date,
  bloqueado boolean not null default true,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (estudo_id, codigo_animal)
);

create table public.medicoes_peso (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  medido_em date not null,
  peso_kg numeric(7,3) not null check (peso_kg > 0),
  registrado_por uuid references public.perfis(id) on delete set null,
  observacoes text,
  criado_em timestamptz not null default now(),
  unique (animal_id, medido_em)
);

create table public.medicoes_racao (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  medido_em date not null,
  quantidade_g numeric(9,2) not null check (quantidade_g >= 0),
  registrado_por uuid references public.perfis(id) on delete set null,
  observacoes text,
  criado_em timestamptz not null default now(),
  unique (animal_id, medido_em)
);

create table public.medicoes_agua (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  medido_em date not null,
  quantidade_ml numeric(9,2) not null check (quantidade_ml >= 0),
  registrado_por uuid references public.perfis(id) on delete set null,
  observacoes text,
  criado_em timestamptz not null default now(),
  unique (animal_id, medido_em)
);

create table public.exames (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  coletado_em date not null,
  categoria text not null check (categoria in ('bioquimica', 'hemograma', 'urinalise', 'ultrassom', 'histopatologico')),
  momento text not null,
  nome_parametro text not null,
  valor_resultado text not null,
  valor_numerico numeric,
  unidade text,
  registrado_por uuid references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now()
);

create table public.intervencoes (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  realizado_em date not null,
  tipo_intervencao text not null,
  medicamento text,
  dose text,
  via_administracao text,
  status text not null default 'Planejado',
  id_lote text,
  observacoes text,
  registrado_por uuid references public.perfis(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index animais_estudo_id_idx on public.animais(estudo_id);
create index medicoes_peso_animal_data_idx on public.medicoes_peso(animal_id, medido_em desc);
create index medicoes_racao_animal_data_idx on public.medicoes_racao(animal_id, medido_em desc);
create index medicoes_agua_animal_data_idx on public.medicoes_agua(animal_id, medido_em desc);
create index exames_animal_data_idx on public.exames(animal_id, coletado_em desc);
create index intervencoes_animal_data_idx on public.intervencoes(animal_id, realizado_em desc);

create or replace function public.atualizar_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizar_timestamp before update on public.perfis for each row execute function public.atualizar_timestamp();
create trigger estudos_atualizar_timestamp before update on public.estudos for each row execute function public.atualizar_timestamp();
create trigger animais_atualizar_timestamp before update on public.animais for each row execute function public.atualizar_timestamp();
create trigger intervencoes_atualizar_timestamp before update on public.intervencoes for each row execute function public.atualizar_timestamp();

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome_completo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.criar_perfil_novo_usuario();

create or replace function public.adicionar_responsavel_estudo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.membros_estudo (estudo_id, usuario_id, papel)
  values (new.id, new.responsavel_id, 'proprietario');
  return new;
end;
$$;

create trigger estudos_adicionar_responsavel
  after insert on public.estudos
  for each row execute procedure public.adicionar_responsavel_estudo();

create or replace function public.eh_membro_estudo(target_estudo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.membros_estudo
    where estudo_id = target_estudo_id and usuario_id = auth.uid()
  );
$$;

create or replace function public.pode_editar_estudo(target_estudo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.membros_estudo
    where estudo_id = target_estudo_id
      and usuario_id = auth.uid()
      and papel in ('proprietario', 'editor')
  );
$$;

create or replace function public.pode_gerenciar_estudo(target_estudo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.membros_estudo
    where estudo_id = target_estudo_id
      and usuario_id = auth.uid()
      and papel = 'proprietario'
  );
$$;

alter table public.perfis enable row level security;
alter table public.estudos enable row level security;
alter table public.membros_estudo enable row level security;
alter table public.animais enable row level security;
alter table public.medicoes_peso enable row level security;
alter table public.medicoes_racao enable row level security;
alter table public.medicoes_agua enable row level security;
alter table public.exames enable row level security;
alter table public.intervencoes enable row level security;

create policy "Usuarios podem ler seu perfil" on public.perfis for select using (id = auth.uid());
create policy "Usuarios podem atualizar seu perfil" on public.perfis for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Membros podem ler estudos" on public.estudos for select using (public.eh_membro_estudo(id));
create policy "Usuarios podem criar estudos" on public.estudos for insert with check (responsavel_id = auth.uid());
create policy "Responsaveis podem atualizar estudos" on public.estudos for update using (responsavel_id = auth.uid()) with check (responsavel_id = auth.uid());
create policy "Responsaveis podem excluir estudos" on public.estudos for delete using (responsavel_id = auth.uid());

create policy "Membros podem ler membros do estudo" on public.membros_estudo for select using (public.eh_membro_estudo(estudo_id));
create policy "Responsaveis podem adicionar membros" on public.membros_estudo for insert with check (public.pode_gerenciar_estudo(estudo_id));
create policy "Responsaveis podem atualizar membros" on public.membros_estudo for update using (public.pode_gerenciar_estudo(estudo_id)) with check (public.pode_gerenciar_estudo(estudo_id));
create policy "Responsaveis podem remover membros" on public.membros_estudo for delete using (public.pode_gerenciar_estudo(estudo_id));

create policy "Membros podem ler animais" on public.animais for select using (public.eh_membro_estudo(estudo_id));
create policy "Editores podem criar animais" on public.animais for insert with check (public.pode_editar_estudo(estudo_id));
create policy "Editores podem atualizar animais" on public.animais for update using (public.pode_editar_estudo(estudo_id)) with check (public.pode_editar_estudo(estudo_id));
create policy "Editores podem excluir animais" on public.animais for delete using (public.pode_editar_estudo(estudo_id));

create policy "Membros podem ler medicoes de peso" on public.medicoes_peso for select using (exists (select 1 from public.animais a where a.id = animal_id and public.eh_membro_estudo(a.estudo_id)));
create policy "Editores podem escrever medicoes de peso" on public.medicoes_peso for all using (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id))) with check (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id)));

create policy "Membros podem ler medicoes de racao" on public.medicoes_racao for select using (exists (select 1 from public.animais a where a.id = animal_id and public.eh_membro_estudo(a.estudo_id)));
create policy "Editores podem escrever medicoes de racao" on public.medicoes_racao for all using (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id))) with check (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id)));

create policy "Membros podem ler medicoes de agua" on public.medicoes_agua for select using (exists (select 1 from public.animais a where a.id = animal_id and public.eh_membro_estudo(a.estudo_id)));
create policy "Editores podem escrever medicoes de agua" on public.medicoes_agua for all using (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id))) with check (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id)));

create policy "Membros podem ler exames" on public.exames for select using (exists (select 1 from public.animais a where a.id = animal_id and public.eh_membro_estudo(a.estudo_id)));
create policy "Editores podem escrever exames" on public.exames for all using (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id))) with check (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id)));

create policy "Membros podem ler intervencoes" on public.intervencoes for select using (exists (select 1 from public.animais a where a.id = animal_id and public.eh_membro_estudo(a.estudo_id)));
create policy "Editores podem escrever intervencoes" on public.intervencoes for all using (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id))) with check (exists (select 1 from public.animais a where a.id = animal_id and public.pode_editar_estudo(a.estudo_id)));
