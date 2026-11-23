const db = require('../db');
const { somenteDigitos } = require('../utils/cpf');

// Expressão que descriptografa o CPF gravado em VARBINARY
const CPF_DECRYPT = "CAST(AES_DECRYPT(cpf, ?) AS CHAR CHARACTER SET utf8mb4)";

async function listar(termo) {

    let sql = `SELECT id_cliente, nome, ${CPF_DECRYPT} AS cpf, telefone, email
               FROM clientes`;
    const params = [process.env.CPF_KEY];

    // Busca: nome, e-mail, telefone ou CPF (o CPF é descriptografado para comparar)
    if (termo) {
        const like = `%${termo}%`;
        sql += ` WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?`;
        params.push(like, like, like);

        const digitos = somenteDigitos(termo);
        if (digitos) {
            sql += ` OR REPLACE(REPLACE(${CPF_DECRYPT}, '.', ''), '-', '') LIKE ?`;
            params.push(process.env.CPF_KEY, `%${digitos}%`);
        }
    }

    sql += ' ORDER BY nome';

    const [clientes] = await db.execute(sql, params);
    return clientes;

}

async function buscarPorId(id) {

    const [clientes] = await db.execute(
        `SELECT id_cliente, nome, ${CPF_DECRYPT} AS cpf, telefone, email
         FROM clientes
         WHERE id_cliente = ?`,
        [process.env.CPF_KEY, id]
    );

    return clientes[0];

}

async function inserir({ nome, cpf, telefone, email }) {

    // O CPF é criptografado com AES antes de ser gravado
    const [resultado] = await db.execute(
        `INSERT INTO clientes (nome, cpf, telefone, email)
         VALUES (?, AES_ENCRYPT(?, ?), ?, ?)`,
        [nome, cpf, process.env.CPF_KEY, telefone, email]
    );

    return resultado.insertId;

}

async function atualizar(id, { nome, cpf, telefone, email }) {

    const [resultado] = await db.execute(
        `UPDATE clientes
         SET nome = ?, cpf = AES_ENCRYPT(?, ?), telefone = ?, email = ?
         WHERE id_cliente = ?`,
        [nome, cpf, process.env.CPF_KEY, telefone, email, id]
    );

    return resultado.affectedRows;

}

module.exports = {
    listar,
    buscarPorId,
    inserir,
    atualizar
};
