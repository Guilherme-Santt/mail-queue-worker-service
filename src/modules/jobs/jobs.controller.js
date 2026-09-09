import { JobsService } from './jobs.service.js';

const jobsService = new JobsService();

export class JobsController {
    async createEmail(req, res) {
        try {
            const { to, subject, body } = req.body;

            if (!to || !subject || !body) {
                return res.status(400).json({ 
                    error: 'Os campos "to", "subject" e "body" são obrigatórios.' 
                });
            }

            const job = await jobsService.createEmailJob({ to, subject, body });

            return res.status(202).json({
                message: 'Tarefa de e-mail adicionada à fila com sucesso.',
                jobId: job.id,
                status: job.status
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao adicionar tarefa à fila.' });
        }
    }

    async getStatus(req, res) {
        try {
            const { id } = req.params;
            const job = await jobsService.getJobById(id);

            if (!job) {
                return res.status(404).json({ error: 'Job não encontrado.' });
            }

            return res.json(job);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar status do job.' });
        }
    }

    async listAll(req, res) {
        try {
            const jobs = await jobsService.listJobs();
            
            return res.json(jobs);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar jobs.' });
        }
    }
}