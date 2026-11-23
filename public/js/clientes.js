if (protegerPagina()) {
    montarCabecalho('clientes');
    iniciar();
}

function iniciar() {
    const mensagem = document.getElementById('mensagem');
    const painelForm = document.getElementById('painelForm');
    const formCliente = document.getElementById('formCliente');
    const formBusca = document.getElementById('formBusca');
    const campoBusca = document.getElementById('busca');
    const campoCpf = document.getElementById('cpf');
    const lista = document.getElementById('listaClientes');

    // Máscara do CPF enquanto digita
    campoCpf.addEventListener('input', () => {
        const d = campoCpf.value.replace(/\D/g, '').slice(0, 11);
        campoCpf.value = d
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    });

    function abrirForm(titulo) {
        document.getElementById('tituloForm').textContent = titulo;
        painelForm.hidden = false;
        document.getElementById('nome').focus();
    }

    function fecharForm() {
        formCliente.reset();
        document.getElementById('idCliente').value = '';
        painelForm.hidden = true;
    }

    async function carregarClientes() {
        const termo = campoBusca.value.trim();
        const caminho = termo ? `/clientes?busca=${encodeURIComponent(termo)}` : '/clientes';

        try {
            const { ok, dados } = await requisicao(caminho);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            if (dados.length === 0) {
                lista.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum cliente encontrado.</td></tr>';
                return;
            }

            lista.innerHTML = dados.map((c) => `
                <tr>
                    <td>${escapar(c.nome)}</td>
                    <td>${escapar(c.cpf)}</td>
                    <td>${escapar(c.telefone)}</td>
                    <td>${escapar(c.email)}</td>
                    <td><button type="button" class="pequeno" data-editar="${c.id_cliente}">Editar</button></td>
                </tr>`).join('');

        } catch (erro) {
            if (erro.message !== 'Sessão expirada') {
                exibirMensagem(mensagem, 'Não foi possível conectar ao servidor.', 'erro');
            }
        }
    }

    // Busca: só atualiza a listagem depois que o usuário confirma
    formBusca.addEventListener('submit', (evento) => {
        evento.preventDefault();
        mensagem.textContent = '';
        carregarClientes();
    });

    document.getElementById('btnLimpar').addEventListener('click', () => {
        campoBusca.value = '';
        carregarClientes();
    });

    document.getElementById('btnNovoCliente').addEventListener('click', () => {
        formCliente.reset();
        document.getElementById('idCliente').value = '';
        abrirForm('Novo cliente');
    });

    document.getElementById('btnCancelar').addEventListener('click', fecharForm);

    // Editar: carrega o cliente (com CPF completo) no formulário
    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('[data-editar]');
        if (!botao) return;

        try {
            const { ok, dados } = await requisicao(`/clientes/${botao.dataset.editar}`);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            document.getElementById('idCliente').value = dados.id_cliente;
            document.getElementById('nome').value = dados.nome;
            campoCpf.value = dados.cpf;
            document.getElementById('telefone').value = dados.telefone || '';
            document.getElementById('email').value = dados.email || '';
            mensagem.textContent = '';
            abrirForm('Editar cliente');

        } catch (erro) {
            if (erro.message !== 'Sessão expirada') {
                exibirMensagem(mensagem, 'Não foi possível conectar ao servidor.', 'erro');
            }
        }
    });

    // Salvar: cria (POST) ou atualiza (PUT) conforme o id
    formCliente.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const id = document.getElementById('idCliente').value;
        const corpo = {
            nome: document.getElementById('nome').value,
            cpf: campoCpf.value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value
        };

        try {
            const { ok, dados } = id
                ? await requisicao(`/clientes/${id}`, 'PUT', corpo)
                : await requisicao('/clientes', 'POST', corpo);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            exibirMensagem(mensagem, dados.mensagem, 'sucesso');
            fecharForm();
            carregarClientes();

        } catch (erro) {
            if (erro.message !== 'Sessão expirada') {
                exibirMensagem(mensagem, 'Não foi possível conectar ao servidor.', 'erro');
            }
        }
    });

    carregarClientes();
}
