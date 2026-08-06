-- Adiciona papel de acesso (admin/usuario) aos perfis e permite que administradores
-- gerenciem os demais usuários do sistema.

create type public.papel_usuario as enum ('admin', 'usuario');

alter table public.perfis
  add column papel public.papel_usuario not null default 'usuario';

create or replace function public.eh_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and papel = 'admin'
  );
$$;

-- O trigger de criação de perfil passa a respeitar o papel enviado nos metadados
-- do usuário (usado pela função administrativa de criação de usuários).
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome_completo, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce((new.raw_user_meta_data ->> 'papel')::public.papel_usuario, 'usuario')
  );
  return new;
end;
$$;

create policy "Admins podem ler todos os perfis" on public.perfis
  for select using (public.eh_admin());

create policy "Admins podem atualizar todos os perfis" on public.perfis
  for update using (public.eh_admin()) with check (public.eh_admin());

update public.perfis set papel = 'admin' where id = '6faf8f6c-14ea-4849-9318-9d92ac8e516b';
