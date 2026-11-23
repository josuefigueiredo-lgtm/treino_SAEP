// Funções compartilhadas por todas as páginas internas do sistema

const API_URL = 'http://localhost:3000';

function obterToken() {
    return sessionStorage.getItem('token');
}

function obterUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem('usuario'));
    } catch (erro) {
        return null;
    }
}

// Encerra a sessão e volta para o login
function sair() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// Lê a data de expiração (exp) que está dentro do token JWT
function tokenExpirado(token) {
    try {
        const corpo = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return corpo.exp * 1000 <= Date.now();
    } catch (erro) {
        return true;
    }
}

// Bloqueia o acesso sem login ou com sessão expirada
function protegerPagina() {
    const token = obterToken();

    if (!token || tokenExpirado(token)) {
        sessionStorage.clear();
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Monta o cabeçalho com menu, nome do usuário logado e botão Sair
function montarCabecalho(paginaAtiva) {
    const usuario = obterUsuario();
    const paginas = [
        ['principal', 'Início'],
        ['clientes', 'Clientes'],
        ['veiculos', 'Veículos'],
        ['agendamentos', 'Agendamentos']
    ];

    const links = paginas.map(([arquivo, titulo]) =>
        `<a href="${arquivo}.html"${arquivo === paginaAtiva ? ' class="ativo" aria-current="page"' : ''}>${titulo}</a>`
    ).join('');

    const cabecalho = document.getElementById('cabecalho');
    cabecalho.className = 'cabecalho';
    cabecalho.innerHTML = `
        <p class="marca">Oficina Mecânica</p>
        <nav>${links}</nav>
        <div class="usuario-logado">
            <span>Usuário: <strong id="nomeUsuario"></strong></span>
            <button type="button" id="btnSair">Sair</button>
        </div>`;

    document.getElementById('nomeUsuario').textContent = usuario ? usuario.nome : '';
    document.getElementById('btnSair').addEventListener('click', sair);
}

// Faz a requisição enviando o token; se a sessão expirou, volta ao login
async function requisicao(caminho, metodo = 'GET', corpo = null) {
    const opcoes = {
        method: metodo,
        headers: {
            'Authorization': `Bearer ${obterToken()}`
        }
    };

    if (corpo) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetch(`${API_URL}${caminho}`, opcoes);

    if (resposta.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        sair();
        throw new Error('Sessão expirada');
    }

    const dados = await resposta.json();

    return { ok: resposta.ok, dados };
}

// Evita que texto vindo do banco seja interpretado como HTML
function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function exibirMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
}

// "2026-11-25 08:30:00" -> "25/11/2026 08:30"
function formatarDataHora(valor) {
    const [data, hora] = String(valor).split(' ');
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} ${hora.slice(0, 5)}`;
}

// "2026-11-25 08:30:00" -> "2026-11-25T08:30" (campo datetime-local)
function paraInputDataHora(valor) {
    return String(valor).slice(0, 16).replace(' ', 'T');
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
