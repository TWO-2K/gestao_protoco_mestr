# Supabase

O arquivo `migrations/20260805231500_initial_schema.sql` cria a estrutura inicial do Vet Rabbit.

## Aplicar

Com a CLI do Supabase vinculada ao projeto:

```bash
supabase db push
```

Ou copie todo o conteúdo da migration para o **SQL Editor** do painel Supabase e execute-o uma única vez.

## Modelo

- `profiles`: espelho seguro de `auth.users`.
- `studies` e `study_members`: isolamento por pesquisa e papéis `owner`, `editor` e `viewer`.
- `rabbits`: cadastro e estado clínico atual do animal.
- `rabbit_*_measurements`: históricos de peso, ração e água.
- `rabbit_exams` e `rabbit_interventions`: coletas laboratoriais e protocolos.

As tabelas possuem RLS. Quando a autenticação for reativada, cada usuário só poderá consultar estudos dos quais é membro; apenas `owner` e `editor` poderão alterar dados.
