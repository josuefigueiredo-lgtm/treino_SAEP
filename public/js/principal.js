if (protegerPagina()) {
    montarCabecalho('principal');

    const usuario = obterUsuario();
    document.getElementById('boasVindas').textContent = usuario ? usuario.nome : '';
}
