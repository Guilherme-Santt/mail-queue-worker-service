import { Worker } from 'bullmq';
import redisConfig from '../../config/redis.js';
import { EMAIL_QUEUE_NAME } from '../queues/email-queue.js';
import { JobsRepository } from '../../modules/jobs/jobs.repository.js';

const jobsRepo = new JobsRepository();

export function setupEmailWorker() {
    const worker = new Worker(
        EMAIL_QUEUE_NAME,
        async (job) => {
            console.log(`[Worker] Processando job ${job.id} (${job.name})...`);

            await jobsRepo.updateStatus(job.id, {
                status: 'PROCESSING'
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            if (job.data.to === 'erro@exemplo.com') {
                throw new Error('Servidor de e-mail rejeitou o destinatário.');
            }

            console.log(`[Worker] E-mail enviado com sucesso para: ${job.data.to}`);

            return { sentAt: new Date().toISOString(), messageId: `msg-${Date.now()}` };
        },
        { connection: redisConfig }
    );

    worker.on('completed', async (job, returnvalue) => {
        console.log(`[Worker] Job ${job.id} concluído com sucesso!`);

        await jobsRepo.updateStatus(job.id, {
            status: 'COMPLETED',
            result: returnvalue
        });
    });

    worker.on('failed', async (job, err) => {
        console.error(`[Worker] Job ${job?.id} falhou: ${err.message}`);
        
        if (job) {
            await jobsRepo.updateStatus(job.id, {
                status: 'FAILED',
                errorMessage: err.message
            });
        }
    });

    return worker;
}