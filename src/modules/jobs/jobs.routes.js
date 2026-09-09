import { Router } from 'express';
import { JobsController } from './jobs.controller.js';

const jobsRoutes = Router();
const jobsController = new JobsController();

jobsRoutes.post('/jobs/email', (req, res) => jobsController.createEmail(req, res));
jobsRoutes.get('/jobs/:id', (req, res) => jobsController.getStatus(req, res));
jobsRoutes.get('/jobs', (req, res) => jobsController.listAll(req, res));

export { jobsRoutes };