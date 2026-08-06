-- A policy de SELECT em estudos dependia apenas de eh_membro_estudo(id), que checa
-- public.membros_estudo. Essa linha só é criada pelo trigger estudos_adicionar_responsavel
-- (AFTER INSERT), que ainda não é visível quando o INSERT ... RETURNING avalia a policy
-- de SELECT sobre a linha retornada. Resultado: todo INSERT com RETURNING (usado pelo
-- client via .select()) falhava com "new row violates row-level security policy for
-- table estudos", mesmo com o INSERT em si permitido.
-- Corrige permitindo que o responsável enxergue o próprio estudo diretamente.

drop policy "Membros podem ler estudos" on public.estudos;

create policy "Membros podem ler estudos" on public.estudos
  for select using (responsavel_id = auth.uid() or public.eh_membro_estudo(id));
