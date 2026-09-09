import express from 'express';
import { jobsRoutes } from './modules/jobs/jobs.routes.js';

const app = express();

app.use(express.json());
app.use(jobsRoutes);

export { app };