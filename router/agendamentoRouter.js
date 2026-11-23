const express = require('express');
const router = express.Router();

const agendamentoController = require('../controller/agendamentoController');
const autenticar = require('../middlewares/authMiddleware');

// "/servicos" vem antes de "/:id" para não ser confundido com um id
router.get('/servicos', autenticar, agendamentoController.listarServicos);
router.get('/', autenticar, agendamentoController.listar);
router.post('/', autenticar, agendamentoController.cadastrar);
router.put('/:id/data', autenticar, agendamentoController.atualizarData);

module.exports = router;
