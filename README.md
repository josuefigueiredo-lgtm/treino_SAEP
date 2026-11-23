# Oficina Mecânica — Sistema de Agendamento

## Descrição

O sistema permite:

- Fazer login com e-mail e senha (sessão com token que expira em 30 minutos) e sair do sistema.
- Ver a tela principal com o nome do usuário logado e o acesso às demais funcionalidades.
- Cadastrar, buscar e editar clientes. O CPF é gravado criptografado (AES) e só aparece mascarado nas listagens (LGPD).
- Cadastrar, listar e editar veículos, sempre associados a um cliente.
- Listar os agendamentos ordenados por data, com os dados do cliente, do veículo e do serviço, cadastrar novos e alterar a data de um agendamento.

# Tecnologias utilizadas:

- Node.js + Express 5 (API REST)
- MySQL 8 (pacote `mysql2`)
- `bcrypt` (hash das senhas), `jsonwebtoken` (token de login), `dotenv` e `cors`
- HTML, CSS e JavaScript puro no front-end (pasta `public`)

# Instalação

## Instalar dependências

1. Ter instalados o Node.js e o MySQL 8.
2. Dentro da pasta `sistema`, executar:

```bash
npm install
```

3. Conferir o arquivo `.env` (há um modelo em `.env.example`):

```
JWT_SECRET=um_segredo_qualquer
CPF_KEY=chave_oficina_2026
```

`CPF_KEY` precisa ser a mesma chave usada no script `oficina_db.sql`, senão o CPF dos registros de teste não é descriptografado.
Usuário e senha do MySQL ficam em `db.js`.

# Estrutura do projeto

```
sistema/
├── server.js                  inicia o servidor e registra as rotas
├── db.js                      conexão com o MySQL (pool)
├── .env                       JWT_SECRET e CPF_KEY
├── router/                    rotas de cada módulo (auth, cliente, veiculo, agendamento)
├── controller/                regras de negócio e respostas da API
├── models/                    consultas SQL
├── middlewares/
│   └── authMiddleware.js      valida o token JWT
├── utils/
│   └── cpf.js                 valida, formata e mascara CPF
└── public/                    front-end
    ├── index.html             login
    ├── principal.html         tela principal
    ├── clientes.html
    ├── veiculos.html
    ├── agendamentos.html
    ├── css/style.css
    └── js/                    login.js, api.js (funções comuns) e um script por página
```

# Executar o projeto

```bash
npm start
```

Abrir no navegador: http://localhost:3000

# Banco de Dados

Executar o script na raiz do trabalho (ele apaga e recria o banco `oficina_mecanica`):

```bash
mysql -u root -p < oficina_db.sql
```

Usuários de teste (senha de todos: `123456`):

| Nome | E-mail |
|------|--------|
| Carlos Mendes | carlos@oficina.com |
| Ana Ribeiro | ana@oficina.com |
| Paulo Lima | paulo@oficina.com |

# Rotas da API

Todas as rotas, exceto o login, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Resposta |
|--------|------|----------|
| POST | `/auth/login` | 200 com `token` e `usuario`; 400 se faltar e-mail ou senha; 401 se as credenciais forem inválidas |
| GET | `/clientes?busca=termo` | 200 com a lista (CPF mascarado). `busca` filtra por nome, CPF, telefone ou e-mail |
| GET | `/clientes/:id` | 200 com o cliente (CPF completo, para edição); 404 se não existir |
| POST | `/clientes` | 201 ao cadastrar; 400 dados inválidos; 409 CPF já cadastrado |
| PUT | `/clientes/:id` | 200 ao atualizar; 400, 404 ou 409 |
| GET | `/veiculos` | 200 com a lista e o nome do cliente |
| GET | `/veiculos/:id` | 200 com o veículo; 404 se não existir |
| POST | `/veiculos` | 201 ao cadastrar (exige `id_cliente`); 400 ou 409 (placa repetida) |
| PUT | `/veiculos/:id` | 200 ao atualizar; 400, 404 ou 409 |
| GET | `/agendamentos` | 200 com a lista ordenada por data, com cliente, veículo e serviço |
| GET | `/agendamentos/servicos` | 200 com os serviços disponíveis |
| POST | `/agendamentos` | 201 ao cadastrar; 400 ou 409 (veículo já agendado no horário) |
| PUT | `/agendamentos/:id/data` | 200 ao atualizar a data; 400, 404 ou 409 |

Token expirado ou inválido: 401 com "Sessão expirada ou token inválido!".

# Teste API's

Navegador (front-end do próprio sistema). As rotas também podem ser testadas no Postman ou Insomnia.

# Desenvolvedor

Josué Rodrigo Evangelista Figueirêdo
