const clienteModel = require('../models/clienteModel');
const { validarCpf, formatarCpf, mascararCpf } = require('../utils/cpf');

// Valida os dados recebidos; retorna a mensagem de erro ou null
function validarCliente({ nome, cpf, email }) {

    if (!nome || !nome.trim()) {
        return 'Informe o nome do cliente!';
    }

    if (!validarCpf(cpf)) {
        return 'CPF inválido!';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'E-mail inválido!';
    }

    return null;

}

function prepararDados(corpo) {
    return {
        nome: corpo.nome.trim(),
        cpf: formatarCpf(corpo.cpf),
        telefone: (corpo.telefone || '').trim() || null,
        email: (corpo.email || '').trim() || null
    };
}

async function listar(req, res) {

    try {

        const termo = (req.query.busca || '').trim();
        const clientes = await clienteModel.listar(termo);

        // LGPD: na listagem o CPF é devolvido mascarado
        const resposta = clientes.map((cliente) => ({
            ...cliente,
            cpf: mascararCpf(cliente.cpf)
        }));

        return res.status(200).json(resposta);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar clientes!'
        });

    }

}

async function buscarPorId(req, res) {

    try {

        const cliente = await clienteModel.buscarPorId(req.params.id);

        if (!cliente) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado!'
            });
        }

        // CPF completo apenas para a tela de edição
        return res.status(200).json(cliente);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar cliente!'
        });

    }

}

async function cadastrar(req, res) {

    try {

        const erroValidacao = validarCliente(req.body);

        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        const id = await clienteModel.inserir(prepararDados(req.body));

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso!',
            id
        });

    } catch (erro) {

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Já existe um cliente com este CPF!'
            });
        }

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar cliente!'
        });

    }

}

async function atualizar(req, res) {

    try {

        const erroValidacao = validarCliente(req.body);

        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        const existe = await clienteModel.buscarPorId(req.params.id);

        if (!existe) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado!'
            });
        }

        await clienteModel.atualizar(req.params.id, prepararDados(req.body));

        return res.status(200).json({
            mensagem: 'Cliente atualizado com sucesso!'
        });

    } catch (erro) {

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Já existe um cliente com este CPF!'
            });
        }

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar cliente!'
        });

    }

}

module.exports = {
    listar,
    buscarPorId,
    cadastrar,
    atualizar
};
