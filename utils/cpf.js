// Funções auxiliares para tratamento de CPF

function somenteDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

// Valida o CPF pelos dois dígitos verificadores
function validarCpf(valor) {
    const cpf = somenteDigitos(valor);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    for (let t = 9; t < 11; t++) {
        let soma = 0;
        for (let i = 0; i < t; i++) {
            soma += Number(cpf[i]) * (t + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(cpf[t])) {
            return false;
        }
    }

    return true;
}

// 11122233344 -> 111.222.333-44 (formato gravado criptografado no banco)
function formatarCpf(valor) {
    return somenteDigitos(valor)
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// LGPD: exibe apenas parte do CPF nas listagens (***.222.333-**)
function mascararCpf(valor) {
    const cpf = somenteDigitos(valor);
    if (cpf.length !== 11) {
        return '';
    }
    return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

module.exports = {
    somenteDigitos,
    validarCpf,
    formatarCpf,
    mascararCpf
};
