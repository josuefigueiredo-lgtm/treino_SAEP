const db = require('../db');

async function buscarUsuarioPorEmail(email) {

    const [usuarios] = await db.execute(
        `SELECT id_usuario, nome, email, senha_hash
         FROM usuarios
         WHERE email = ?`,
        [email]
    );

    return usuarios[0];

}

module.exports = {
    buscarUsuarioPorEmail
};