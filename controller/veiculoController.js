const veiculoModel = require('../models/veiculoModel');

// Valida os dados recebidos; retorna a mensagem de erro ou null
function validarVeiculo({ placa, marca, modelo, ano, id_cliente }) {

    // Aceita placa antiga (ABC1234) e Mercosul (ABC1D23)
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
        return 'Placa inválida! Use o formato ABC1D23 ou ABC1234.';
    }

    if (!marca || !modelo) {
        return 'Informe a marca e o modelo do veículo!';
    }

    const anoAtual = new Date().getFullYear();

    if (!Number.isInteger(ano) || ano < 1950 || ano > anoAtual + 1) {
        return 'Ano do veículo inválido!';
    }

    // Todo veículo deve estar associado a um cliente
    if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
        return 'Selecione o cliente proprietário do veículo!';
    }

    return null;

}

function prepararDados(corpo) {
    return {
        placa: String(corpo.placa || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
        marca: String(corpo.marca || '').trim(),
        modelo: String(corpo.modelo || '').trim(),
        ano: Number(corpo.ano),
        cor: String(corpo.cor || '').trim() || null,
        id_cliente: Number(corpo.id_cliente)
    };
}

// Trata erros de banco comuns às duas operações de gravação
function tratarErroGravacao(erro, res, acao) {

    if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            mensagem: 'Já existe um veículo com esta placa!'
        });
    }

    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            mensagem: 'Cliente informado não existe!'
        });
    }

    console.error(erro);

    return res.status(500).json({
        mensagem: `Erro interno ao ${acao} veículo!`
    });

}

async function listar(req, res) {

    try {

        const veiculos = await veiculoModel.listar();
        return res.status(200).json(veiculos);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar veículos!'
        });

    }

}

async function buscarPorId(req, res) {

    try {

        const veiculo = await veiculoModel.buscarPorId(req.params.id);

        if (!veiculo) {
            return res.status(404).json({
                mensagem: 'Veículo não encontrado!'
            });
        }

        return res.status(200).json(veiculo);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar veículo!'
        });

    }

}

async function cadastrar(req, res) {

    try {

        const dados = prepararDados(req.body);
        const erroValidacao = validarVeiculo(dados);

        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        const id = await veiculoModel.inserir(dados);

        return res.status(201).json({
            mensagem: 'Veículo cadastrado com sucesso!',
            id
        });

    } catch (erro) {

        return tratarErroGravacao(erro, res, 'cadastrar');

    }

}

async function atualizar(req, res) {

    try {

        const dados = prepararDados(req.body);
        const erroValidacao = validarVeiculo(dados);

        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        const existe = await veiculoModel.buscarPorId(req.params.id);

        if (!existe) {
            return res.status(404).json({
                mensagem: 'Veículo não encontrado!'
            });
        }

        await veiculoModel.atualizar(req.params.id, dados);

        return res.status(200).json({
            mensagem: 'Veículo atualizado com sucesso!'
        });

    } catch (erro) {

        return tratarErroGravacao(erro, res, 'atualizar');

    }

}

module.exports = {
    listar,
    buscarPorId,
    cadastrar,
    atualizar
};
