## Async Queue Worker Service

Sistema de processamento assíncrono de tarefas em segundo plano desenvolvido em Node.js com Express, BullMQ, Redis e SQLite.
A aplicação adota uma arquitetura desacoplada, separando a API HTTP do Worker de Filas, garantindo resiliência, tolerância a falhas e alto desempenho.

## Arquitetura do Sistema
O projeto é dividido em dois processos independentes que se comunicam através do Redis:

    API (server.js): Escuta as requisições HTTP, persiste o registro inicial no banco de dados SQLite com status PENDING, publica a mensagem na fila do Redis e responde imediatamente ao cliente com código 202 Accepted.
    Worker (worker.js): Processo isolado que consome as tarefas da fila do Redis, executa as regras de negócio em segundo plano, atualiza o status para COMPLETED ou FAILED e lida com retentativas automáticas e Dead Letter Queue (DLQ).

+-------------------+
               |   Cliente HTTP    |
               +---------+---------+
                         |
                         v (POST /jobs/email)
               +-------------------+
               |   API Express     |
               |   (server.js)     |
               +----+---------+----+
                    |         |
      (Grava PENDING) |         | (Enfileira Job)
                    v         v
             +--------+   +-------+
             | SQLite |   | Redis |
             +--------+   +---+---+
                              |
                              | (Consome Job)
                              v
                       +--------------+
                       |    Worker    |
                       | (worker.js)  |
                       +--------------+

## Tecnologias Utilizadas

Node.js (ES Modules)
Express: Framework web para a API HTTP.
BullMQ: Gerenciamento de filas de alto desempenho sobre Redis.
Redis / ioredis: Message broker para mensageria assíncrona.
SQLite / sqlite3: Banco de dados relacional para persistência e histórico de tarefas.

## Funcionalidades

[x] Desacoplamento entre API e Worker.
[x] Resposta assíncrona imediata via HTTP (202 Accepted).
[x] Persistência de status das tarefas (PENDING, PROCESSING, COMPLETED, FAILED).
[x] Retentativas automáticas com Backoff Exponencial.
[x] Pattern de Dead Letter Queue (DLQ) para isolamento de falhas persistentes.
[x] Rota dedicada para reprocessamento manual de jobs da DLQ.
[x] Graceful Shutdown: Encerramento suave para garantir que nenhuma tarefa em andamento seja interrompida durante o encerramento do processo.


## Estrutura do Projeto
.
├── src/
│   ├── config/             # Configurações do banco SQLite e Redis
│   ├── modules/
│   │   └── jobs/           # Controllers, Routes, Services e Repositories
│   ├── queue/
│   │   ├── queues/         # Definições das filas (Email e DLQ)
│   │   └── workers/        # Processadores das tarefas em segundo plano
│   ├── app.js              # Configuração da aplicação Express
│   ├── server.js           # Ponto de entrada da API HTTP
│   └── worker.js           # Ponto de entrada do Worker
├── package.json
└── README.md

## Especificação das Rotas da API

1. Enfileirar E-mail

    URL: /jobs/email
    Método: POST
    Body:
      {
        "to": "dev@exemplo.com",
        "subject": "Boas-vindas!",
        "body": "Conteúdo do e-mail em segundo plano."
      }

   
Resposta Esperada (202 Accepted):
{
  "message": "Tarefa de e-mail adicionada à fila com sucesso.",
  "jobId": "1",
  "status": "PENDING"
}


2. Consultar Status do Job

    URL: /jobs/:id
    Método: GET
    Resposta Esperada (200 OK):
      {
        "id": "1",
        "queue_name": "email-queue",
        "status": "COMPLETED",
        "payload": "{\"to\":\"dev@exemplo.com\",\"subject\":\"Boas-vindas!\"}",
        "result": "{\"sentAt\":\"2026-09-09T18:30:00.000Z\"}",
        "error_message": null,
        "created_at": "2026-09-09 18:30:00",
        "updated_at": "2026-09-09 18:30:05"
      }

3. Reprocessar Dead Letter Queue (DLQ)
  URL: /jobs/dlq/retry
  Método: POST
  Descrição: Move todas as mensagens com falhas permanentes da DLQ de volta para a fila principal para novo processamento.

   ## Scripts Configurados (package.json)
    npm run server — Inicia a API Express.
    npm run worker — Inicia o processador de filas.


  ## Padrões de Resiliência Aplicados
    Graceful Shutdown: Intercepta os sinais SIGINT e SIGTERM no worker.js, interrompendo o recebimento de novos trabalhos, aguardando a finalização do job em execução e fechando as conexões com o Redis e o SQLite com segurança.
    DLQ Isolation: Jobs que falham após o número limite de tentativas (attempts) são automaticamente movidos para a fila de mensagens mortas (email-queue-dlq), preservando o payload e o log do erro sem poluir a fila ativa.
