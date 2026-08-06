# Vet Rabbit

Aplicação local para acompanhamento de coelhos de pesquisa. Nesta fase ela não exige login e armazena os dados no navegador.

## Requisitos

- Node.js 18 ou superior.

## Executar localmente

```bash
npm install
npm run dev
```

O frontend estará em `http://localhost:5173`.

## Banco de dados

Os dados são persistidos no IndexedDB do navegador, no banco `vet-rabbit`. Na primeira abertura, o app cria os dados de exemplo. Para reiniciar os dados, apague os dados do site nas configurações do navegador.

Não há autenticação nesta etapa.

## Validação

```bash
npm run build
npm run lint
```
