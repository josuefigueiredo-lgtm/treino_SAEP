const express = require('express');
const router = express.Router();

const clienteController = require('../controller/clienteController');
const autenticar = require('../middlewares/authMiddleware');

// Todas as rotas exigem token JWT válido
router.get('/', autenticar, clienteController.listar);
router.get('/:id', autenticar, clienteController.buscarPorId);
router.post('/', autenticar, clienteController.cadastrar);
router.put('/:id', autenticar, clienteController.atualizar);

module.exports = router;
