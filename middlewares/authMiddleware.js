const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            mensagem: 'Acesso não autorizado!'
        });
    }

    const token = authorization.split(' ')[1];

    try {

        const dados = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = dados;

        next();

    } catch (erro) {

        return res.status(401).json({
            mensagem: 'Sessão expirada ou token inválido!'
        });

    }

}

module.exports = autenticar;