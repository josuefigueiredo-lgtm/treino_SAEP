const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'Usuário ou senha inválidos'
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'Usuário ou senha inválidos'
            });
        }

        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        return res.status(200).json({
            mensagem: 'Autenticação realizada!',
            token
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Erro ao realizar autenticação'
        });
    }
}

module.exports = { login };