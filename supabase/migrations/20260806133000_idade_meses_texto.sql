-- O frontend registra a idade como texto livre (ex: "8 meses"), não como número.
alter table public.animais drop constraint if exists animais_idade_meses_check;
alter table public.animais alter column idade_meses type text using idade_meses::text;
