-- Espelha o e-mail em perfis para permitir listagem de usuários pelo admin
-- sem precisar de acesso direto a auth.users pelo cliente.

alter table public.perfis add column email text;

update public.perfis p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome_completo, papel, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce((new.raw_user_meta_data ->> 'papel')::public.papel_usuario, 'usuario'),
    new.email
  );
  return new;
end;
$$;
