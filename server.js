const express = require('express');
const cors = require('cors');
const db = require('./db');
const router = require('./router/authRouter.js')
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', router);


app.listen(3000, ()=>{
    console.log("Está rodando na porta 3000");
})