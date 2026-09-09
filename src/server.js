import { app } from './app.js';
import { getDatabase } from './config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await getDatabase();
            console.log('Banco de dados SQLite conectado.');

        app.listen(PORT, () => {
            console.log(`Servidor HTTP rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
}

startServer();