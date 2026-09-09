import { addEmailToQueue } from '../../queue/queues/email-queue.js';
import { JobsRepository } from './jobs.repository.js';

export class JobsService {
    constructor() {
        this.jobsRepository = new JobsRepository();
    }

    async createEmailJob(data) {
        const job = await addEmailToQueue(data);

        const jobRecord = await this.jobsRepository.create({
        id: job.id,
        queueName: 'email-queue',
        status: 'PENDING',
        payload: data
        });

        return jobRecord;
    }

    async getJobById(id) {
        return this.jobsRepository.findById(id);
    }

    async listJobs() {
        return this.jobsRepository.findAll();
    }
}