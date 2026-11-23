if (protegerPagina()) {
    montarCabecalho('veiculos');
    iniciar();
}

function iniciar() {
    const mensagem = document.getElementById('mensagem');
    const painelForm = document.getElementById('painelForm');
    const formVeiculo = document.getElementById('formVeiculo');
    const selectCliente = document.getElementById('idCliente');
    const lista = document.getElementById('listaVeiculos');

    function erroConexao(erro) {
        if (erro.message !== 'Sessão expirada') {
            exibirMensagem(mensagem, 'Não foi possível conectar ao servidor.', 'erro');
        }
    }

    function abrirForm(titulo) {
        document.getElementById('tituloForm').textContent = titulo;
        painelForm.hidden = false;
        document.getElementById('placa').focus();
    }

    function fecharForm() {
        formVeiculo.reset();
        document.getElementById('idVeiculo').value = '';
        painelForm.hidden = true;
    }

    // Preenche a lista de clientes para associar ao veículo
    async function carregarClientes() {
        try {
            const { ok, dados } = await requisicao('/clientes');
            if (!ok) return;

            selectCliente.innerHTML = '<option value="">Selecione o cliente</option>' +
                dados.map((c) => `<option value="${c.id_cliente}">${escapar(c.nome)}</option>`).join('');
        } catch (erro) {
            erroConexao(erro);
        }
    }

    async function carregarVeiculos() {
        try {
            const { ok, dados } = await requisicao('/veiculos');

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            if (dados.length === 0) {
                lista.innerHTML = '<tr><td colspan="7" class="vazio">Nenhum veículo cadastrado.</td></tr>';
                return;
            }

            lista.innerHTML = dados.map((v) => `
                <tr>
                    <td>${escapar(v.placa)}</td>
                    <td>${escapar(v.marca)}</td>
                    <td>${escapar(v.modelo)}</td>
                    <td>${escapar(v.ano)}</td>
                    <td>${escapar(v.cor)}</td>
                    <td>${escapar(v.cliente_nome)}</td>
                    <td><button type="button" class="pequeno" data-editar="${v.id_veiculo}">Editar</button></td>
                </tr>`).join('');

        } catch (erro) {
            erroConexao(erro);
        }
    }

    document.getElementById('btnNovoVeiculo').addEventListener('click', () => {
        formVeiculo.reset();
        document.getElementById('idVeiculo').value = '';
        abrirForm('Novo veículo');
    });

    document.getElementById('btnCancelar').addEventListener('click', fecharForm);

    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('[data-editar]');
        if (!botao) return;

        try {
            const { ok, dados } = await requisicao(`/veiculos/${botao.dataset.editar}`);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            document.getElementById('idVeiculo').value = dados.id_veiculo;
            document.getElementById('placa').value = dados.placa;
            document.getElementById('marca').value = dados.marca;
            document.getElementById('modelo').value = dados.modelo;
            document.getElementById('ano').value = dados.ano;
            document.getElementById('cor').value = dados.cor || '';
            selectCliente.value = dados.id_cliente;
            mensagem.textContent = '';
            abrirForm('Editar veículo');

        } catch (erro) {
            erroConexao(erro);
        }
    });

    formVeiculo.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const id = document.getElementById('idVeiculo').value;
        const corpo = {
            placa: document.getElementById('placa').value,
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            ano: document.getElementById('ano').value,
            cor: document.getElementById('cor').value,
            id_cliente: selectCliente.value
        };

        try {
            const { ok, dados } = id
                ? await requisicao(`/veiculos/${id}`, 'PUT', corpo)
                : await requisicao('/veiculos', 'POST', corpo);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            exibirMensagem(mensagem, dados.mensagem, 'sucesso');
            fecharForm();
            carregarVeiculos();

        } catch (erro) {
            erroConexao(erro);
        }
    });

    carregarClientes();
    carregarVeiculos();
}
