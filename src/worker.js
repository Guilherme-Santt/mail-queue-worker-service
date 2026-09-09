import { getDatabase } from './config/database.js';
import { setupEmailWorker, stopEmailWorker } from './queue/workers/email-worker.js';
let dbInstance = null;

async function startWorker() {
    try {
        dbInstance = await getDatabase();
        console.log('Banco de dados SQLite conectado ao Worker.');

        setupEmailWorker();
        console.log('Worker de e-mails iniciado e aguardando novas tarefas...');
    } catch (error) {
        console.error('Erro ao iniciar o worker:', error);
    }
}

async function handleShutdown(signal) {
    console.log(`\n[Shutdown] Recebido sinal ${signal}. Iniciando encerramento suave...`);
    try {
        await stopEmailWorker();
    
        if (dbInstance) {
            await dbInstance.close();
            console.log('[Shutdown] Conexão com SQLite encerrada.');
        }
    
        console.log('[Shutdown] Processo do Worker finalizado com segurança.');
        process.exit(0);
    } catch (error) {
        console.error('[Shutdown] Erro ao encerrar o Worker:', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startWorker();