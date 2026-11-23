const db = require('../db');

// Lista os agendamentos ordenados pela data, com todos os dados
// do cliente, do veículo e do serviço
async function listar() {

    const [agendamentos] = await db.execute(
        `SELECT a.id_agendamento, a.data_agendamento, a.status, a.observacoes,
                s.descricao AS servico, s.valor, s.duracao_minutos,
                v.id_veiculo, v.placa, v.marca, v.modelo, v.ano, v.cor,
                c.id_cliente, c.nome AS cliente_nome,
                CAST(AES_DECRYPT(c.cpf, ?) AS CHAR CHARACTER SET utf8mb4) AS cliente_cpf,
                c.telefone AS cliente_telefone, c.email AS cliente_email
         FROM agendamentos a
         INNER JOIN veiculos v ON v.id_veiculo = a.id_veiculo
         INNER JOIN clientes c ON c.id_cliente = v.id_cliente
         INNER JOIN servicos s ON s.id_servico = a.id_servico
         ORDER BY a.data_agendamento ASC`,
        [process.env.CPF_KEY]
    );

    return agendamentos;

}

async function buscarPorId(id) {

    const [agendamentos] = await db.execute(
        `SELECT id_agendamento, data_agendamento, status
         FROM agendamentos
         WHERE id_agendamento = ?`,
        [id]
    );

    return agendamentos[0];

}

async function inserir({ data_agendamento, observacoes, id_veiculo, id_servico, id_usuario }) {

    const [resultado] = await db.execute(
        `INSERT INTO agendamentos
            (data_agendamento, observacoes, id_veiculo, id_servico, id_usuario)
         VALUES (?, ?, ?, ?, ?)`,
        [data_agendamento, observacoes, id_veiculo, id_servico, id_usuario]
    );

    return resultado.insertId;

}

async function atualizarData(id, data_agendamento) {

    const [resultado] = await db.execute(
        `UPDATE agendamentos
         SET data_agendamento = ?
         WHERE id_agendamento = ?`,
        [data_agendamento, id]
    );

    return resultado.affectedRows;

}

async function listarServicos() {

    const [servicos] = await db.execute(
        `SELECT id_servico, descricao, valor, duracao_minutos
         FROM servicos
         ORDER BY descricao`
    );

    return servicos;

}

module.exports = {
    listar,
    buscarPorId,
    inserir,
    atualizarData,
    listarServicos
};
