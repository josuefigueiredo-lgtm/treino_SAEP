const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = dados.mensagem;
            return;
        }

        // Armazena o token JWT
        sessionStorage.setItem('token', dados.token);

        // Armazena os dados do usuário
        sessionStorage.setItem(
            'usuario',
            JSON.stringify(dados.usuario)
        );

        mensagem.textContent = 'Login realizado com sucesso!';

        // Redireciona para a página principal
        window.location.href = 'pecas.html';

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
        mensagem.textContent = 'Não foi possível conectar ao servidor.';
    }
});