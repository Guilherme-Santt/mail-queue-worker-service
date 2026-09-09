import { Queue } from 'bullmq';
import redisConfig from '../../config/redis.js';

export const EMAIL_QUEUE_NAME = 'email-queue';
export const EMAIL_DLQ_NAME = 'email-queue-dlq';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
        type: 'exponential',
        delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

export const emailDLQ = new Queue(EMAIL_DLQ_NAME, {
    connection: redisConfig
})

export async function addEmailToQueue(data) {
    const job = await emailQueue.add('send-email', data);
    return job;
}