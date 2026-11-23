
-- =====================================================
-- BANCO DE DADOS: OFICINA MECÂNICA
-- =====================================================

DROP DATABASE IF EXISTS oficina_mecanica;

CREATE DATABASE oficina_mecanica
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE oficina_mecanica;

-- =====================================================
-- TABELA: USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: CLIENTES
-- =====================================================

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARBINARY(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(120),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: VEICULOS
-- =====================================================

CREATE TABLE veiculos (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(8) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano SMALLINT NOT NULL,
    cor VARCHAR(30),
    id_cliente INT NOT NULL,

    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
);

-- =====================================================
-- TABELA: SERVICOS
-- =====================================================

CREATE TABLE servicos (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    duracao_minutos INT NOT NULL
);

-- =====================================================
-- TABELA: AGENDAMENTOS
-- =====================================================

CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,
    data_agendamento DATETIME NOT NULL,

    status ENUM(
        'AGENDADO',
        'EM_ANDAMENTO',
        'CONCLUIDO',
        'CANCELADO'
    ) NOT NULL DEFAULT 'AGENDADO',

    observacoes VARCHAR(255),
    id_veiculo INT NOT NULL,
    id_servico INT NOT NULL,
    id_usuario INT NOT NULL,

    CONSTRAINT fk_agend_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculos(id_veiculo),

    CONSTRAINT fk_agend_servico
        FOREIGN KEY (id_servico)
        REFERENCES servicos(id_servico),

    CONSTRAINT fk_agend_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT uq_veiculo_horario
        UNIQUE (id_veiculo, data_agendamento)
);

-- =====================================================
-- DADOS DE TESTE
-- =====================================================

-- USUÁRIOS
-- As senhas serão cadastradas posteriormente pelo Node.js
-- utilizando bcrypt.

-- CLIENTES
INSERT INTO clientes (nome, cpf, telefone, email) VALUES
('João Pereira', AES_ENCRYPT('111.444.777-35', 'chave_oficina_2026'), '(77) 99911-2233', 'joao@email.com'),
('Maria Souza', AES_ENCRYPT('529.982.247-25', 'chave_oficina_2026'), '(77) 99822-3344', 'maria@email.com'),
('Pedro Santos', AES_ENCRYPT('935.411.347-80', 'chave_oficina_2026'), '(77) 99733-4455', 'pedro@email.com');

-- VEÍCULOS
INSERT INTO veiculos (placa, marca, modelo, ano, cor, id_cliente) VALUES
('ABC1D23', 'Fiat', 'Uno', 2015, 'Branco', 1),
('QWE4R56', 'Volkswagen', 'Gol', 2018, 'Prata', 2),
('JKL7M89', 'Chevrolet', 'Onix', 2021, 'Preto', 3),
('MNO2P34', 'Honda', 'Civic', 2019, 'Cinza', 1);

-- SERVIÇOS
INSERT INTO servicos (descricao, valor, duracao_minutos) VALUES
('Troca de óleo e filtro', 180.00, 45),
('Alinhamento e balanceamento', 120.00, 60),
('Revisão de freios', 350.00, 120);

-- AGENDAMENTOS
-- Os usuários serão inseridos pelo Node.js antes
-- de executar este INSERT.

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
