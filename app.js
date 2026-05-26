let produtos = []; 
let sacola = [];
let usuarioLogadoId = ""; 
function abrirAcesso(modo) {
    const modal = document.getElementById('modal-acesso');
    if (modal) {
        modal.classList.remove('hidden');
        alternarAcesso(modo);
    }
}

function fecharModal() {
    document.getElementById('modal-acesso').classList.add('hidden');
}

function alternarAcesso(modo) {
    const secaoCadastro = document.getElementById('secao-cadastro');
    const secaoLogin = document.getElementById('secao-login');

    if (modo === 'login') {
        secaoCadastro.classList.add('hidden');
        secaoLogin.classList.remove('hidden');
    } else {
        secaoLogin.classList.add('hidden');
        secaoCadastro.classList.remove('hidden');
    }
}

async function liberarLoja(nome, id) {
    usuarioLogadoId = id; // Armazena o ID do usuário logado
    
    document.getElementById('modal-acesso').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('loja-interna').classList.remove('hidden');
    document.getElementById('user-info').innerText = `Bem-vinda, ${nome}!`;

    try {
        // CORRIGIDO: URL da API na nuvem para buscar produtos
        const resposta = await fetch('https://donna-liz-api.onrender.com/produtos');
        produtos = await resposta.json(); 
        
        renderizarProdutos(produtos);
        atualizarInterfaceSacola(); 
        verificarPedidoAtivo();
    } catch (error) {
        console.error("Erro ao carregar os produtos do banco:", error);
        alert("Não foi possível carregar o cardápio. O servidor está ligado?");
    }
}

function renderizarProdutos(listaParaExibir = produtos) {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = ""; 

    listaParaExibir.forEach(produto => {
        container.innerHTML += `
            <article class="produto-card">
                <img src="${produto.imagem}" alt="${produto.nome}" class="prod-img" onerror="this.src='https://placehold.co/200x200?text=Donna+Liz'">
                <div class="prod-detalhes">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <div class="prod-footer">
                        <span>R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                        <button class="btn-add" onclick="adicionarASacola(${produto.id})">+</button>
                    </div>
                </div>
            </article>
        `;
    });
}

function filtrarProdutos(categoria) {
    const botoes = document.querySelectorAll('.cat-item');
    botoes.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === categoria.toLowerCase() || 
           (categoria === 'todos' && btn.innerText.toLowerCase() === 'todos')) {
            btn.classList.add('active');
        }
    });

    if (categoria === 'todos') {
        renderizarProdutos(produtos); 
    } else {
        const produtosFiltrados = produtos.filter(p => p.categoria === categoria.toLowerCase());
        renderizarProdutos(produtosFiltrados); 
    }
}

function adicionarASacola(id) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        sacola.push(produto);
        atualizarInterfaceSacola();
    }
}

function removerDaSacola(index) {
    if (index >= 0 && index < sacola.length) {
        sacola.splice(index, 1); 
        atualizarInterfaceSacola();
    }
}

function atualizarInterfaceSacola() {
    const total = sacola.reduce((sum, item) => sum + item.preco, 0);
    const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    document.querySelector('.count').innerText = sacola.length;
    document.getElementById('valor-total').innerText = totalFormatado;
    document.querySelector('.total').innerText = totalFormatado;

    const containerItens = document.getElementById('itens-carrinho');
    
    if (sacola.length === 0) {
        containerItens.innerHTML = `<p class="vazio-msg">Sua sacola está vazia. <br> Que tal adicionar uma pizza?</p>`;
    } else {
        containerItens.innerHTML = ""; 
        sacola.forEach((item, index) => {
            containerItens.innerHTML += `
                <div class="item-carrinho" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 10px;">
                    <div class="info-item">
                        <h4 style="margin: 0; font-size: 0.9rem;">${item.nome}</h4>
                        <span style="color: #D4AF37; font-size: 0.85rem;">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button onclick="removerDaSacola(${index})" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 1.1rem;">✕</button>
                </div>
            `;
        });
    }

    const btnFinalizar = document.querySelector('.btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.disabled = sacola.length === 0;
    }
}

function toggleCarrinho() {
    document.getElementById('sacola-lateral').classList.toggle('hidden');
}

function abrirCarrinho() {
    document.getElementById('sacola-lateral').classList.remove('hidden');
}

async function finalizarPedido() {
    if (sacola.length === 0) return;

    const itensPedido = sacola.map(item => ({
        nome: item.nome,
        preco: item.preco
    }));

    const valorTotal = sacola.reduce((sum, item) => sum + item.preco, 0);

    const dadosDoPedido = {
        usuarioId: usuarioLogadoId,
        usuarioNome: document.getElementById('user-info').innerText.replace('Bem-vinda, ', '').replace('!', ''),
        itens: itensPedido,
        total: valorTotal
    };

    try {
        const respuesta = await fetch('https://donna-liz-api.onrender.com/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosDoPedido)
        });

        if (respuesta.ok) {
            alert("Pedido enviado para a cozinha da Donna Liz! 🍕");
            sacola = []; 
            atualizarInterfaceSacola(); 
            toggleCarrinho(); 
            verificarPedidoAtivo();
        } else {
            alert("Erro ao processar o seu pedido.");
        }
    } catch (error) {
        console.error("Erro ao enviar pedido:", error);
        alert("Não foi possível conectar ao servidor.");
    }
}

document.getElementById('form-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    try {
        const resposta = await fetch('https://donna-liz-api.onrender.com/usuarios/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.mensagem); 
            liberarLoja(nome, dados.usuario._id); 
        } else {
            alert(dados.erro || "Erro ao realizar cadastro.");
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
    }
});

document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const resposta = await fetch('https://donna-liz-api.onrender.com/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (dados.autenticado) {
            liberarLoja(dados.nome, dados.id); 
        } else {
            alert(dados.erro); 
        }
    } catch (error) {
        console.error("Erro no login:", error);
    }
});

function toggleMenuUsuario() {
    document.getElementById('dropdown-user').classList.toggle('hidden');
}

function logout() {
    sacola = []; 
    usuarioLogadoId = "";
    document.getElementById('loja-interna').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('dropdown-user').classList.add('hidden');
    
    const tracker = document.getElementById('pedido-tracker-flutuante');
    if (tracker) tracker.classList.add('hidden');
}

function fecharModalPedidos() {
    document.getElementById('modal-pedidos').classList.add('hidden');
}

async function abrirHistoricoPedidos() {
    document.getElementById('dropdown-user').classList.add('hidden');
    if (!usuarioLogadoId) return alert("Faça login novamente.");

    const container = document.getElementById('conteudo-pedidos');
    container.innerHTML = "<p>Carregando seu histórico de compras...</p>";
    document.getElementById('modal-pedidos').classList.remove('hidden');
    document.querySelector('#modal-pedidos h2').innerText = "Histórico de Pedidos";

    try {
        const resposta = await fetch(`https://donna-liz-api.onrender.com/pedidos/${usuarioLogadoId}`);
        const pedidos = await resposta.json();

        if (pedidos.length === 0) {
            container.innerHTML = "<p class='vazio-msg'>Nenhum histórico encontrado. 🍕</p>";
            return;
        }

        container.innerHTML = pedidos.map(p => `
            <div style="border-bottom: 1px solid #222; padding: 12px 0; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span><strong>ID:</strong> ...${p._id.substring(18)}</span>
                    <span style="color: #D4AF37;">${new Date(p.data).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #888;">
                    <span>${p.itens.length} item(ns)</span>
                    <strong>R$ ${p.total.toFixed(2).replace('.', ',')}</strong>
                </div>
                <div style="margin-top: 5px; font-size: 0.8rem; color: #666;">
                    Status: <span style="color: #fff">${p.status}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

async function verificarPedidoAtivo() {
    if (!usuarioLogadoId) return;

    try {
        const resposta = await fetch(`https://donna-liz-api.onrender.com/pedidos/${usuarioLogadoId}`);
        const pedidos = await resposta.json();

        const tracker = document.getElementById('pedido-tracker-flutuante');
        if (!tracker) return;

        if (pedidos.length > 0) {
            const ultimoPedido = pedidos[0];
            
            if (ultimoPedido.status !== "Entregue") {
                tracker.classList.remove('hidden');
                document.getElementById('tracker-status-texto').innerText = `Status: ${ultimoPedido.status}`;
                
                if (ultimoPedido.status === "Pendente" && !window.simulandoAtiva) {
                    window.simulandoAtiva = true;
                    simularProgressoIFood(ultimoPedido._id);
                }
                return;
            }
        }
        tracker.classList.add('hidden');
        window.simulandoAtiva = false;
    } catch (err) {
        console.error("Erro ao verificar pedido ativo:", err);
    }
}

async function abrirModalAcompanhamento() {
    const container = document.getElementById('conteudo-pedidos');
    container.innerHTML = "<p>Carregando linha do tempo...</p>";
    document.getElementById('modal-pedidos').classList.remove('hidden');
    document.querySelector('#modal-pedidos h2').innerText = "Acompanhar Entrega";

    try {
        const resposta = await fetch(`https://donna-liz-api.onrender.com/pedidos/${usuarioLogadoId}`);
        const pedidos = await resposta.json();
        const ultimoPedido = pedidos[0];
        const status = ultimoPedido.status;

        const cRecebido = ["Pendente", "Preparando", "A caminho", "Entregue"].includes(status) ? "concluido" : "";
        const cPreparo = ["Preparando", "A caminho", "Entregue"].includes(status) ? "concluido" : "";
        const cEntrega = ["A caminho", "Entregue"].includes(status) ? "concluido" : "";
        const cEntregue = status === "Entregue" ? "concluido" : "";

        container.innerHTML = `
            <div style="border-bottom: 1px solid #222; padding-bottom: 15px; margin-bottom: 15px;">
                <p><strong>Pedido ID:</strong> ...${ultimoPedido._id.substring(18)}</p>
                <p><strong>Total:</strong> R$ ${ultimoPedido.total.toFixed(2).replace('.', ',')}</p>
            </div>
            
            <div class="timeline-ifood">
                <div class="etapa-status ${cRecebido}">Recebido</div>
                <div class="etapa-status ${cPreparo}">Preparo</div>
                <div class="etapa-status ${cEntrega}">A caminho</div>
                <div class="etapa-status ${cEntregue}">Entregue</div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.9rem;">
                Status atual: <span style="color: #D4AF37; font-weight: bold;">${status}</span>
            </div>
        `;
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar acompanhamento.</p>";
    }
}

// 4. MOTOR DA SIMULAÇÃO (PATCH)
function simularProgressoIFood(pedidoId) {
    setTimeout(async () => {
        await fetch(`https://donna-liz-api.onrender.com/pedidos/${pedidoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Preparando' })
        });
        verificarPedidoAtivo(); 
        if (!document.getElementById('modal-pedidos').classList.contains('hidden') && 
            document.querySelector('#modal-pedidos h2').innerText === "Acompanhar Entrega") {
            abrirModalAcompanhamento();
        }
    }, 7000);

    setTimeout(async () => {
        await fetch(`https://donna-liz-api.onrender.com/pedidos/${pedidoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'A caminho' })
        });
        verificarPedidoAtivo();
        if (!document.getElementById('modal-pedidos').classList.contains('hidden') && 
            document.querySelector('#modal-pedidos h2').innerText === "Acompanhar Entrega") {
            abrirModalAcompanhamento();
        }
    }, 15000);

    setTimeout(async () => {
        await fetch(`https://donna-liz-api.onrender.com/pedidos/${pedidoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Entregue' })
        });
        verificarPedidoAtivo(); 
        if (!document.getElementById('modal-pedidos').classList.contains('hidden') && 
            document.querySelector('#modal-pedidos h2').innerText === "Acompanhar Entrega") {
            abrirModalAcompanhamento();
        }
    }, 25000);
}


function fecharModalPerfil() {
    document.getElementById('modal-perfil').classList.add('hidden');
}

async function abrirModalPerfil() {
    document.getElementById('dropdown-user').classList.add('hidden');
    if (!usuarioLogadoId) return alert("Faça login novamente.");

    try {

        const response = await fetch(`https://donna-liz-api.onrender.com/usuarios/${usuarioLogadoId}`);
        const usuario = await response.json();

        if (response.ok) {
            document.getElementById('edit-nome').value = usuario.nome;
            document.getElementById('edit-email').value = usuario.email;
            document.getElementById('edit-senha').value = ""; 
            document.getElementById('modal-perfil').classList.remove('hidden');
        } else {
            alert("Erro ao buscar dados do perfil.");
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}

document.getElementById('form-editar-perfil').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('edit-nome').value;
    const email = document.getElementById('edit-email').value;
    const senha = document.getElementById('edit-senha').value;

    const dadosAtualizados = { nome, email };
    if (senha) dadosAtualizados.senha = senha; 

    try {
    
        const resposta = await fetch(`https://donna-liz-api.onrender.com/usuarios/${usuarioLogadoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Perfil updated com sucesso! 🎉");
            document.getElementById('user-info').innerText = `Bem-vinda, ${nome}!`;
            fecharModalPerfil();
        } else {
            alert(dados.erro || "Erro ao atualizar perfil.");
        }
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Não foi possível conectar ao servidor.");
    }
});