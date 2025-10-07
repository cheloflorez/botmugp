const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'logs.json');

// Inicializar JSON si no existe
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify({ logs: [] }, null, 2));
}

// Guardar log
function logInteraction(user, action, input = {}) {
    const data = JSON.parse(fs.readFileSync(LOG_FILE));
    data.logs.push({
        userId: user.id,
        username: user.tag,
        action,
        input,
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
}

// Obtener estadísticas simples
function getStats() {
    const data = JSON.parse(fs.readFileSync(LOG_FILE));
    const logs = data.logs;

    // Conteo por acción
    const byAction = {};
    logs.forEach(l => byAction[l.action] = (byAction[l.action] || 0) + 1);

    // Usuarios más activos
    const byUser = {};
    logs.forEach(l => byUser[l.username] = (byUser[l.username] || 0) + 1);

    return { byAction, byUser };
}

module.exports = { logInteraction, getStats };
