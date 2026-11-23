const agendamentoModel = require('../models/agendamentoModel');
const { mascararCpf } = require('../utils/cpf');

// Converte "2026-11-25T08:30" (campo datetime-local) para "2026-11-25 08:30:00"
// Retorna null quando a data não é válida
function normalizarData(valor) {

    const texto = String(valor || '').trim().replace('T', ' ');

    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(texto)) {
        return null;
    }

    const completo = texto.length === 16 ? `${texto}:00` : texto;

    if (Number.isNaN(new Date(completo.replace(' ', 'T')).getTime())) {
        return null;
    }

    return completo;

}

async function listar(req, res) {

    try {

        const agendamentos = await agendamentoModel.listar();

        // LGPD: o CPF do cliente é devolvido mascarado
        const resposta = agendamentos.map((agendamento) => ({
            ...agendamento,
            cliente_cpf: mascararCpf(agendamento.cliente_cpf)
        }));

        return res.status(200).json(resposta);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar agendamentos!'
        });

    }

}

async function listarServicos(req, res) {

    try {

        const servicos = await agendamentoModel.listarServicos();
        return res.status(200).json(servicos);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar serviços!'
        });

    }

}

async function cadastrar(req, res) {

    try {

        const data = normalizarData(req.body.data_agendamento);
        const id_veiculo = Number(req.body.id_veiculo);
        const id_servico = Number(req.body.id_servico);

        if (!data) {
            return res.status(400).json({
                mensagem: 'Informe uma data e hora válidas!'
            });
        }

        if (!Number.isInteger(id_veiculo) || !Number.isInteger(id_servico)) {
            return res.status(400).json({
                mensagem: 'Selecione o veículo e o serviço!'
            });
        }

        const id = await agendamentoModel.inserir({
            data_agendamento: data,
            observacoes: String(req.body.observacoes || '').trim() || null,
            id_veiculo,
            id_servico,
            id_usuario: req.usuario.id   // usuário logado (vem do token)
        });

        return res.status(201).json({
            mensagem: 'Agendamento cadastrado com sucesso!',
            id
        });

    } catch (erro) {

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Este veículo já possui agendamento neste horário!'
            });
        }

        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensagem: 'Veículo ou serviço informado não existe!'
            });
        }

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar agendamento!'
        });

    }

}

async function atualizarData(req, res) {

    try {

        const data = normalizarData(req.body.data_agendamento);

        if (!data) {
            return res.status(400).json({
                mensagem: 'Informe uma data e hora válidas!'
            });
        }

        const existe = await agendamentoModel.buscarPorId(req.params.id);

        if (!existe) {
            return res.status(404).json({
                mensagem: 'Agendamento não encontrado!'
            });
        }

        await agendamentoModel.atualizarData(req.params.id, data);

        return res.status(200).json({
            mensagem: 'Data do agendamento atualizada com sucesso!'
        });

    } catch (erro) {

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Este veículo já possui agendamento neste horário!'
            });
        }

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar agendamento!'
        });

    }

}

module.exports = {
    listar,
    listarServicos,
    cadastrar,
    atualizarData
};
