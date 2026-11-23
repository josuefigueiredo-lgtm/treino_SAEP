const db = require('../db');

async function listar() {

    const [veiculos] = await db.execute(
        `SELECT v.id_veiculo, v.placa, v.marca, v.modelo, v.ano, v.cor,
                v.id_cliente, c.nome AS cliente_nome
         FROM veiculos v
         INNER JOIN clientes c ON c.id_cliente = v.id_cliente
         ORDER BY c.nome, v.modelo`
    );

    return veiculos;

}

async function buscarPorId(id) {

    const [veiculos] = await db.execute(
        `SELECT id_veiculo, placa, marca, modelo, ano, cor, id_cliente
         FROM veiculos
         WHERE id_veiculo = ?`,
        [id]
    );

    return veiculos[0];

}

async function inserir({ placa, marca, modelo, ano, cor, id_cliente }) {

    const [resultado] = await db.execute(
        `INSERT INTO veiculos (placa, marca, modelo, ano, cor, id_cliente)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [placa, marca, modelo, ano, cor, id_cliente]
    );

    return resultado.insertId;

}

async function atualizar(id, { placa, marca, modelo, ano, cor, id_cliente }) {

    const [resultado] = await db.execute(
        `UPDATE veiculos
         SET placa = ?, marca = ?, modelo = ?, ano = ?, cor = ?, id_cliente = ?
         WHERE id_veiculo = ?`,
        [placa, marca, modelo, ano, cor, id_cliente, id]
    );

    return resultado.affectedRows;

}

module.exports = {
    listar,
    buscarPorId,
    inserir,
    atualizar
};
