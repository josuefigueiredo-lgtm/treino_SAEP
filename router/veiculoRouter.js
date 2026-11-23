const express = require('express');
const router = express.Router();

const veiculoController = require('../controller/veiculoController');
const autenticar = require('../middlewares/authMiddleware');

router.get('/', autenticar, veiculoController.listar);
router.get('/:id', autenticar, veiculoController.buscarPorId);
router.post('/', autenticar, veiculoController.cadastrar);
router.put('/:id', autenticar, veiculoController.atualizar);

module.exports = router;
