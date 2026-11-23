const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {

    try {

        const { email, senha } = req.body;

        // Verifica se os campos foram preenchidos
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Informe o e-mail e a senha!'
            });
        }

        // Busca o usuário no banco
        const usuario = await authModel.buscarUsuarioPorEmail(email);

        // Verifica se o usuário existe
        if (!usuario) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos!'
            });
        }

        // Compara a senha informada com o hash
        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos!'
            });
        }

        // Gera o token de autenticação
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nome: usuario.nome
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '30m'
            }
        );

        // Retorna os dados do usuário e o token
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',

            token,

            usuario: {
                id: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar login!'
        });

    }

}

module.exports = {
    login
};