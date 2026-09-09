import { redisConnection } from "./config/redis.js";
import { getDatabase } from "./config/database.js";
import { JobsRepository } from "./modules/jobs/jobs.repository.js";
import { addEmailToQueue } from "./queue/queues/email-queue.js";
import { setupEmailWorker } from "./queue/workers/email-worker.js";

redisConnection.on('connect', () => {
    console.log('Conectado ao Redis com sucesso!');
});

async function bootstrap() {
    try {
        await getDatabase();
        console.log('Banco de dados SQLite inicializado!');

        setupEmailWorker();
        console.log('Worker escutando a fila de e-mails...');

        const jobsRepo = new JobsRepository();

        const emailPayload = {
            to: 'dev@exemplo.com',
            subject: 'Bem-vindo ao sistema de filas!',
            body: 'Este e-mail foi processado em segundo plano.'
        };

        const job = await addEmailToQueue(emailPayload);

        await jobsRepo.create({
            id: job.id,
            queueName: 'email-queue',
            status: 'PENDING',
            payload: emailPayload
        });

        console.log(`Job ${job.id} adicionado à fila e salvo no banco de dados!`);

    } catch (error) {
        console.error('Erro no fluxo principal:', error);
    }
}

bootstrap();