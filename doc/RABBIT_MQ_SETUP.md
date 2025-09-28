# RabbitMQ Setup (Ambiente Local)

Este guia explica como subir o RabbitMQ no ambiente local via Docker Compose, acessar o painel de gestão e estabelecer convenções mínimas (exchanges, filas, chaves de roteamento, DLQ) para o Hub Town.

## Por que RabbitMQ aqui?

- Desacoplar ingestão (Spring Boot) da persistência (consumers e PostgreSQL).
- Absorver picos das APIs dos marketplaces com retries e DLQ visíveis.
- Padronizar mensagens com um schema canônico e evoluir sem quebrar consumidores.

## O que o Compose já fornece

O arquivo `docker-compose.yml` inclui um serviço `rabbitmq` com a imagem `rabbitmq:3.13-management`, expondo:
- AMQP: `amqp://hubtown_user:hubtown_pass@localhost:5672/`
- Management UI: `http://localhost:15672` (user: `hubtown_user`, pass: `hubtown_pass`)

Volumes persistem dados em `rabbitmq_data`. Um healthcheck básico garante que o serviço esteja pronto.

## Acessando o painel (Management UI)

1) Inicie os serviços com Docker Compose.
2) Abra `http://localhost:15672` e entre com `hubtown_user` / `hubtown_pass`.
3) Navegue em:
   - Exchanges: criação e bindings.
   - Queues: criação, DLQ, policies (TTL, retry) e gráficos de mensagens.
   - Connections/Channels: para troubleshooting.

## Convenções para o Hub Town

Para manter o ecossistema claro e rastreável, adote nomes explícitos:

- Vhost (opcional, recomendado): `/hubtown` (criar via UI). Se usar, ajuste a URL: `amqp://hubtown_user:hubtown_pass@localhost:5672/hubtown`.
- Exchange de domínio (topic): `hubtown.orders.exchange`
- Filas de processamento por marketplace e tipo de evento:
  - `hubtown.orders.shopee.process`
  - `hubtown.orders.mercadolivre.process`
  - `hubtown.orders.shein.process`
- Filas DLQ (uma por fila process):
  - `hubtown.orders.shopee.dlq`
  - `hubtown.orders.mercadolivre.dlq`
  - `hubtown.orders.shein.dlq`
- Routing keys (exemplos):
  - `orders.shopee.created`, `orders.shopee.updated`
  - `orders.mercadolivre.created`, `orders.mercadolivre.updated`
  - `orders.shein.created`, `orders.shein.updated`

Bindings recomendados (exemplos):
- `hubtown.orders.exchange` → `hubtown.orders.shopee.process` com `orders.shopee.*`
- `hubtown.orders.exchange` → `hubtown.orders.mercadolivre.process` com `orders.mercadolivre.*`
- `hubtown.orders.exchange` → `hubtown.orders.shein.process` com `orders.shein.*`

Policies sugeridas (por fila `*.process`):
- Dead-letter-exchange: `hubtown.orders.exchange`
- Dead-letter-routing-key: roteie para `*.dlq`
- x-message-ttl: defina conforme requisito (ex.: 10min/600000ms) para retries automáticos (quando aplicável ao design)

Observação: a estratégia de retry pode ser implementada via TTL + DLX ou por consumidores (republicando). Escolha uma e documente.

## Estratégia recomendada de filas (resumo prático)

- Exchange (topic): `hubtown.orders.exchange`
- Routing key: `orders.{marketplace}.{event}` (ex.: `orders.shopee.created`, `orders.mercadolivre.updated`)
- Filas de processamento por marketplace: `hubtown.orders.{marketplace}.process`
- Filas de DLQ por marketplace: `hubtown.orders.{marketplace}.dlq`
- Retries com backoff: usar filas de retry com TTL + DLX, por exemplo:
  - `hubtown.orders.{marketplace}.retry.5s` (TTL 5s)
  - `hubtown.orders.{marketplace}.retry.30s` (TTL 30s)
  - `hubtown.orders.{marketplace}.retry.5m` (TTL 5min)

Bindings típicos:
- `hubtown.orders.exchange` → `hubtown.orders.shopee.process` com `orders.shopee.*`
- `hubtown.orders.exchange` → `hubtown.orders.mercadolivre.process` com `orders.mercadolivre.*`
- `hubtown.orders.exchange` → `hubtown.orders.shein.process` com `orders.shein.*`

Fluxo de retry (TTL + DLX):
1) Consumidor lê de `*.process` e, em erro transitório, rejeita sem requeue.
2) A fila `*.process` envia para uma fila de retry (via DLX) com TTL.
3) Ao expirar o TTL, a mensagem volta ao exchange principal e reentra em `*.process`.
4) Após N tentativas (contabilize com header `x-death`), publique/roteie para `*.dlq` e alerte.

Consumo (QoS) e concorrência:
- Acknowledgment manual (confirmar somente após persistir no PostgreSQL).
- Prefetch inicial: 10–20 por consumidor; ajustar com evidências.
- Concorrência: 2–4 threads por fila para começar; escalar por marketplace.
- Rejeitar sem requeue para acionar DLX; reprocessamento é guiado pelas filas de retry.

Entrega e durabilidade:
- Mensagens persistentes (delivery mode 2) e filas duráveis.
- Publisher confirms habilitado no produtor para garantir publicação.
- Em produção, considerar Quorum Queues; para local/PoC, Classic Queues são suficientes.

Ordenação e idempotência:
- Não dependa da ordenação da fila para consistência de status.
- Inclua em cada mensagem: `marketplace`, `original_order_id`, `event_type`, `occurred_at`/`version`.
- Idempotência no consumidor/banco por chave natural (`marketplace_id + original_order_id`) e regra "última versão vence".

Observabilidade:
- Headers comuns: `traceId`/`correlationId`, `schemaVersion`, `marketplace`, `original_order_id`, `event_type`, `occurred_at`.
- Métricas: taxa de consumo, erros, latência por mensagem, backlog de filas, itens em DLQ por marketplace.
- Alertas: novos itens na DLQ e crescimento sustentado de backlog.

Quando evoluir a topologia:
- Alto volume por marketplace → separar também por tipo de evento (ex.: `status`, `created`).
- Muitos erros transitórios → aumentar backoff (novas filas retry) ou adotar plugin delayed-message-exchange.
- Reprocessamentos massivos → criar rotas/ferramentas de replay controlado.

## Subindo com Docker Compose (Windows PowerShell)

```powershell
# Na raiz do repositório
docker compose pull ; docker compose up -d

# Ver estado
# (o rabbitmq deve ficar healthy)
docker compose ps
```

Para parar/remover:

```powershell
docker compose down
```

## Variáveis de ambiente para serviços

Produtores/Consumidores Spring Boot devem ler as seguintes variáveis (exemplos):

- `RABBITMQ_URL=amqp://hubtown_user:hubtown_pass@localhost:5672/`
- `RABBITMQ_EXCHANGE=hubtown.orders.exchange`
- `RABBITMQ_VHOST=/hubtown` (se usar vhost; sem vhost, omita)
- `RABBITMQ_QUEUE_PROCESS=hubtown.orders.shopee.process` (ajuste por serviço)
- `RABBITMQ_QUEUE_DLQ=hubtown.orders.shopee.dlq`

## Troubleshooting rápido

- UI não abre: verifique `docker compose ps` e se a porta 15672 não está em uso.
- Credenciais não funcionam: os defaults estão no compose; se alterou, recrie o container.
- Mensagens não fluem: confira bindings (routing key) e se o exchange é do tipo `topic`.
- Fila crescendo: use a aba `Queues` para inspecionar consumidores e DLQ; verifique políticas de TTL/retry.

## Próximos passos

- Automatizar criação de exchanges/filas/bindings via código (Infra-as-Code ou inicialização do serviço).
- Definir e versionar o schema canônico de mensagens (ex.: JSON Schema) para pedidos.
- Adicionar dashboards mínimos (taxa de mensagens, DLQ, retries) para operação local.
