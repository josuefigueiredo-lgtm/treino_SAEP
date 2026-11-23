if (protegerPagina()) {
    montarCabecalho('agendamentos');
    iniciar();
}

const NOMES_STATUS = {
    AGENDADO: 'Agendado',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado'
};

function iniciar() {
    const mensagem = document.getElementById('mensagem');
    const painelNovo = document.getElementById('painelNovo');
    const painelData = document.getElementById('painelData');
    const formAgendamento = document.getElementById('formAgendamento');
    const formData = document.getElementById('formData');
    const lista = document.getElementById('listaAgendamentos');

    let agendamentos = [];

    function erroConexao(erro) {
        if (erro.message !== 'Sessão expirada') {
            exibirMensagem(mensagem, 'Não foi possível conectar ao servidor.', 'erro');
        }
    }

    // Veículos e serviços para o formulário de novo agendamento
    async function carregarOpcoes() {
        try {
            const veiculos = await requisicao('/veiculos');
            const servicos = await requisicao('/agendamentos/servicos');

            if (veiculos.ok) {
                document.getElementById('idVeiculo').innerHTML =
                    '<option value="">Selecione o veículo</option>' +
                    veiculos.dados.map((v) =>
                        `<option value="${v.id_veiculo}">${escapar(v.placa)} - ${escapar(v.modelo)} (${escapar(v.cliente_nome)})</option>`
                    ).join('');
            }

            if (servicos.ok) {
                document.getElementById('idServico').innerHTML =
                    '<option value="">Selecione o serviço</option>' +
                    servicos.dados.map((s) =>
                        `<option value="${s.id_servico}">${escapar(s.descricao)} - ${formatarMoeda(s.valor)}</option>`
                    ).join('');
            }
        } catch (erro) {
            erroConexao(erro);
        }
    }

    async function carregarAgendamentos() {
        try {
            const { ok, dados } = await requisicao('/agendamentos');

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            agendamentos = dados;

            if (dados.length === 0) {
                lista.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum agendamento cadastrado.</td></tr>';
                return;
            }

            lista.innerHTML = dados.map((a) => `
                <tr>
                    <td>${escapar(formatarDataHora(a.data_agendamento))}</td>
                    <td>
                        ${escapar(a.cliente_nome)}
                        <small>CPF ${escapar(a.cliente_cpf)}</small>
                        <small>${escapar(a.cliente_telefone)}</small>
                        <small>${escapar(a.cliente_email)}</small>
                    </td>
                    <td>
                        ${escapar(a.placa)}
                        <small>${escapar(a.marca)} ${escapar(a.modelo)} ${escapar(a.ano)}</small>
                        <small>${escapar(a.cor)}</small>
                    </td>
                    <td>
                        ${escapar(a.servico)}
                        <small>${formatarMoeda(a.valor)} - ${escapar(a.duracao_minutos)} min</small>
                    </td>
                    <td><span class="status ${escapar(a.status)}">${escapar(NOMES_STATUS[a.status] || a.status)}</span></td>
                    <td><button type="button" class="pequeno" data-data="${a.id_agendamento}">Alterar data</button></td>
                </tr>`).join('');

        } catch (erro) {
            erroConexao(erro);
        }
    }

    document.getElementById('btnNovoAgendamento').addEventListener('click', () => {
        painelData.hidden = true;
        formAgendamento.reset();
        painelNovo.hidden = false;
        document.getElementById('idVeiculo').focus();
    });

    document.getElementById('btnCancelarNovo').addEventListener('click', () => {
        formAgendamento.reset();
        painelNovo.hidden = true;
    });

    document.getElementById('btnCancelarData').addEventListener('click', () => {
        painelData.hidden = true;
    });

    // Alterar data: abre o formulário já com a data atual do agendamento
    lista.addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-data]');
        if (!botao) return;

        const agendamento = agendamentos.find(
            (a) => String(a.id_agendamento) === botao.dataset.data
        );
        if (!agendamento) return;

        painelNovo.hidden = true;
        document.getElementById('idAgendamento').value = agendamento.id_agendamento;
        document.getElementById('novaData').value = paraInputDataHora(agendamento.data_agendamento);
        document.getElementById('descricaoData').textContent =
            `${agendamento.cliente_nome} - ${agendamento.placa} - ${agendamento.servico}`;
        mensagem.textContent = '';
        painelData.hidden = false;
        document.getElementById('novaData').focus();
    });

    formAgendamento.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const corpo = {
            id_veiculo: document.getElementById('idVeiculo').value,
            id_servico: document.getElementById('idServico').value,
            data_agendamento: document.getElementById('dataAgendamento').value,
            observacoes: document.getElementById('observacoes').value
        };

        try {
            const { ok, dados } = await requisicao('/agendamentos', 'POST', corpo);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            exibirMensagem(mensagem, dados.mensagem, 'sucesso');
            formAgendamento.reset();
            painelNovo.hidden = true;
            carregarAgendamentos();

        } catch (erro) {
            erroConexao(erro);
        }
    });

    formData.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const id = document.getElementById('idAgendamento').value;
        const corpo = { data_agendamento: document.getElementById('novaData').value };

        try {
            const { ok, dados } = await requisicao(`/agendamentos/${id}/data`, 'PUT', corpo);

            if (!ok) {
                exibirMensagem(mensagem, dados.mensagem, 'erro');
                return;
            }

            exibirMensagem(mensagem, dados.mensagem, 'sucesso');
            painelData.hidden = true;
            carregarAgendamentos();

        } catch (erro) {
            erroConexao(erro);
        }
    });

    carregarOpcoes();
    carregarAgendamentos();
}
