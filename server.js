require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./router/authRouter.js');
const clienteRouter = require('./router/clienteRouter.js');
const veiculoRouter = require('./router/veiculoRouter.js');
const agendamentoRouter = require('./router/agendamentoRouter.js');

const app = express();
app.use(cors());
app.use(express.json());

// Front-end (HTML, CSS e JS) servido pela própria aplicação
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/clientes', clienteRouter);
app.use('/veiculos', veiculoRouter);
app.use('/agendamentos', agendamentoRouter);

app.listen(3000, () => {
    console.log("Está rodando na porta 3000");
});
