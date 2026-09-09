import { Worker } from 'bullmq';
import redisConfig from '../../config/redis.js';
import { EMAIL_QUEUE_NAME } from '../queues/email-queue.js';
import { JobsRepository } from '../../modules/jobs/jobs.repository.js';

const jobsRepo = new JobsRepository();
let worker = null;

export function setupEmailWorker() {
    worker = new Worker(
        EMAIL_QUEUE_NAME,
        async (job) => {
            console.log(`[Worker] Tentativa ${job.attemptsMade + 1} para o Job ${job.id}`);
    
            await jobsRepo.updateStatus(job.id, { status: 'PROCESSING' });
    
            if (job.data.to === 'erro@exemplo.com') {
            throw new Error('Falha simulada no provedor de e-mail.');
            }
    
            return { sentAt: new Date().toISOString() };
        },
        { connection: redisConfig }
    );

    worker.on('completed', async (job, returnvalue) => {
        await jobsRepo.updateStatus(job.id, {
            status: 'COMPLETED',
            result: returnvalue
        });
    });

    worker.on('failed', async (job, err) => {
        console.error(`[Worker] Job ${job.id} falhou na tentativa ${job.attemptsMade}: ${err.message}`);
    
        const maxAttempts = job.opts.attempts || 1;
        const hasMoreAttempts = job.attemptsMade < maxAttempts;
    
        if (!hasMoreAttempts) {
            console.warn(`[DLQ] Job ${job.id} esgotou todas as tentativas. Mover para a Dead Letter Queue...`);
    
            await emailDLQ.add('dead-email', {
            originalJobId: job.id,
            payload: job.data,
            failedReason: err.message,
            failedAt: new Date().toISOString()
            });
    
            await jobsRepo.updateStatus(job.id, {
            status: 'FAILED',
            errorMessage: `[DLQ] Esgotado após ${maxAttempts} tentativas. Erro: ${err.message}`
            });
        }
    });
    
    return worker;
}

export async function stopEmailWorker() {
    if (worker) {
        console.log('[Worker] Pausando recebimento de novos jobs e aguardando os atuais...');
        await worker.close();
        console.log('[Worker] Worker do BullMQ encerrado com sucesso.');
    }
}