# Loki One App SDK — versão 1

O Loki One pode receber aplicativos de terceiros por meio de um registro de apps.

## Tipos suportados

- `internal`: app integrado ao próprio sistema.
- `web`: PWA ou aplicação web compatível.
- `external`: serviço aberto pelo endereço oficial do provedor.

## Registro

Cada app deve informar:

- `id` único
- `name`
- `type`
- `provider`
- `url` oficial
- `integration`

## Apps de terceiros

A integração com serviços como YouTube e TikTok deve usar somente páginas, APIs, SDKs ou mecanismos oficialmente disponibilizados pelos respectivos provedores. O Loki One não redistribui APKs, binários ou conteúdo proprietário desses serviços sem autorização.

## Próxima etapa

A interface da Loki Store poderá ler `app/loki-apps.json`, exibir apps externos e abrir o endereço oficial do provedor. Apps Loki One poderão futuramente receber permissões, versão, tamanho, ícone, screenshots e atualização pelo mesmo registro.
