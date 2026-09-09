import { getDatabase } from './config/database.js';
import { setupEmailWorker } from './queue/workers/email-worker.js';

async function startWorker() {
    try {
        await getDatabase();
        console.log('Banco de dados SQLite conectado ao Worker.');

        setupEmailWorker();
        console.log('Worker de e-mails iniciado e aguardando novas tarefas...');
    } catch (error) {
        console.error('Erro ao iniciar o worker:', error);
    }
}

startWorker();