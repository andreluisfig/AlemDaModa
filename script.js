/* Configurações */
const categoriasBarraLateral = ["Home", "Todas as Peças", "Camisetas", "Calças", "Casacos", "Calçados"];

const formataPreco = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const rotuloAdicionarProduto = "Adicionar Produto";

/* Contas simuladas (não há banco de dados: tudo roda no navegador) */
const contasSimuladas = [
    { usuario: "cliente", senha: "cliente123", nome: "Cliente", perfil: "usuario" },
    { usuario: "admin", senha: "admin123", nome: "Administrador", perfil: "adm" }
];

const chaveSessao = "alemdamoda_sessao";
const chaveProdutosAdicionados = "alemdamoda_produtos_adicionados";
const chaveProdutosAlterados = "alemdamoda_produtos_alterados";
const chaveProdutosRemovidos = "alemdamoda_produtos_removidos";

/* Armazenamento local (falha silenciosa caso o navegador bloqueie) */
function lerArmazenamento(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave));
    } catch (erro) {
        return null;
    }
}

function salvarArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) { /* sem armazenamento disponível */ }
}

function removerArmazenamento(chave) {
    try {
        localStorage.removeItem(chave);
    } catch (erro) { /* sem armazenamento disponível */ }
}

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* Produtos do Brechó: os cartões estão escritos direto no HTML (#gradeCatalogo) */
const gradeCatalogo = document.getElementById('gradeCatalogo');
const estadoVazioCatalogo = document.getElementById('estadoVazioCatalogo');

function gerarUid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Botões Editar/Remover (só aparecem para o adm, via CSS) */
function prepararCartao(cartao, chave) {
    cartao.dataset.chave = chave;
    const acoes = document.createElement('div');
    acoes.className = 'acoes-adm';
    acoes.innerHTML = `
        <button type="button" class="botao-adm editar">Editar</button>
        <button type="button" class="botao-adm remover">Remover</button>
    `;
    cartao.querySelector('.info-produto').appendChild(acoes);
}

/* Cria um cartão de produto (usado nas peças cadastradas pelo adm) */
function criarCartaoProduto(produto, chave) {
    const cartao = document.createElement('div');
    cartao.className = 'cartao-produto';
    cartao.innerHTML = `
        <div class="recipiente-imagem">
            <span class="etiqueta-categoria">${escaparHtml(produto.categoria)}</span>
            <img src="${escaparHtml(produto.imagem)}" alt="${escaparHtml(produto.nome)}" loading="lazy">
        </div>
        <div class="info-produto">
            <h3 class="titulo-produto">${escaparHtml(produto.nome)}</h3>
            <div class="acao-produto">
                <span class="preco">${formataPreco(produto.preco)}</span>
                <button class="botao">Adicionar à Sacola</button>
            </div>
        </div>
    `;
    prepararCartao(cartao, chave);
    return cartao;
}

/* Lê os dados de um cartão direto do HTML */
function lerProduto(cartao) {
    const textoPreco = cartao.querySelector('.preco').textContent;
    return {
        nome: cartao.querySelector('.titulo-produto').textContent.trim(),
        categoria: cartao.querySelector('.etiqueta-categoria').textContent.trim(),
        preco: parseFloat(textoPreco.replace(/[^\d,]/g, '').replace(',', '.')),
        imagem: cartao.querySelector('img').getAttribute('src')
    };
}

/* Escreve novos dados dentro de um cartão existente */
function atualizarCartao(cartao, dados) {
    cartao.querySelector('.etiqueta-categoria').textContent = dados.categoria;
    const imagem = cartao.querySelector('img');
    imagem.setAttribute('src', dados.imagem);
    imagem.setAttribute('alt', dados.nome);
    cartao.querySelector('.titulo-produto').textContent = dados.nome;
    cartao.querySelector('.preco').textContent = formataPreco(dados.preco);
}

function estaDisponivel(cartao) {
    return !cartao.classList.contains('na-sacola') && !cartao.classList.contains('vendido');
}

/* Cartões escritos no HTML: aplica remoções e edições feitas pelo adm (salvas no navegador) */
function prepararCartoesDoHtml() {
    const removidos = lerArmazenamento(chaveProdutosRemovidos);
    const alterados = lerArmazenamento(chaveProdutosAlterados);
    gradeCatalogo.querySelectorAll('.cartao-produto').forEach(cartao => {
        const chave = 'html:' + lerProduto(cartao).nome;
        if (Array.isArray(removidos) && removidos.includes(chave)) {
            cartao.remove();
            return;
        }
        prepararCartao(cartao, chave);
        if (alterados && alterados[chave]) atualizarCartao(cartao, alterados[chave]);
    });
}

/* Peças cadastradas pelo adm (ficam salvas no navegador) entram no fim da grade */
function carregarProdutosAdicionados() {
    const adicionados = lerArmazenamento(chaveProdutosAdicionados);
    if (!Array.isArray(adicionados)) return;

    let precisaSalvar = false;
    adicionados.forEach(produto => {
        if (!produto.uid) { produto.uid = gerarUid(); precisaSalvar = true; }
        gradeCatalogo.insertBefore(criarCartaoProduto(produto, 'add:' + produto.uid), estadoVazioCatalogo);
    });
    if (precisaSalvar) salvarArmazenamento(chaveProdutosAdicionados, adicionados);
}

/* Edição e remoção (somente adm) */
let cartaoEmEdicao = null;

function entrarModoEdicao(cartao) {
    const produto = lerProduto(cartao);
    cartaoEmEdicao = cartao;

    document.getElementById('campoNomeProduto').value = produto.nome;
    document.getElementById('campoCategoriaProduto').value = produto.categoria;
    document.getElementById('campoPrecoProduto').value = produto.preco;
    document.getElementById('campoImagemProduto').value = produto.imagem;
    document.getElementById('mensagemErroProduto').textContent = '';

    document.getElementById('tituloFormularioProduto').textContent = "Editar Produto";
    document.getElementById('subtituloFormularioProduto').textContent = "Altere os dados da peça e salve";
    document.getElementById('botaoEnviarProduto').textContent = "Salvar alterações";
    document.getElementById('botaoCancelarEdicao').classList.remove('oculto');

    navegarPara('adicionar');
}

function sairModoEdicao() {
    if (cartaoEmEdicao === null) return;
    cartaoEmEdicao = null;

    document.getElementById('formularioProduto').reset();
    document.getElementById('mensagemErroProduto').textContent = '';
    document.getElementById('tituloFormularioProduto').textContent = "Adicionar Produto";
    document.getElementById('subtituloFormularioProduto').textContent = "Cadastre uma nova peça única no acervo";
    document.getElementById('botaoEnviarProduto').textContent = "Adicionar ao acervo";
    document.getElementById('botaoCancelarEdicao').classList.add('oculto');
}

function salvarEdicao(cartao, dados) {
    const chave = cartao.dataset.chave;
    if (chave.startsWith('add:')) {
        const uid = chave.slice(4);
        const adicionados = lerArmazenamento(chaveProdutosAdicionados) || [];
        const indice = adicionados.findIndex(p => p.uid === uid);
        if (indice > -1) {
            adicionados[indice] = Object.assign({ uid: uid }, dados);
            salvarArmazenamento(chaveProdutosAdicionados, adicionados);
        }
    } else {
        const alterados = lerArmazenamento(chaveProdutosAlterados) || {};
        alterados[chave] = dados;
        salvarArmazenamento(chaveProdutosAlterados, alterados);
    }
    atualizarCartao(cartao, dados);
}

function removerProduto(cartao) {
    const produto = lerProduto(cartao);
    if (!confirm(`Remover "${produto.nome}" do acervo?`)) return;

    const chave = cartao.dataset.chave;
    if (chave.startsWith('add:')) {
        const uid = chave.slice(4);
        const adicionados = lerArmazenamento(chaveProdutosAdicionados) || [];
        salvarArmazenamento(chaveProdutosAdicionados, adicionados.filter(p => p.uid !== uid));
    } else {
        const removidos = lerArmazenamento(chaveProdutosRemovidos) || [];
        if (!removidos.includes(chave)) removidos.push(chave);
        salvarArmazenamento(chaveProdutosRemovidos, removidos);

        const alterados = lerArmazenamento(chaveProdutosAlterados);
        if (alterados && alterados[chave]) {
            delete alterados[chave];
            salvarArmazenamento(chaveProdutosAlterados, alterados);
        }
    }

    sacola = sacola.filter(item => item !== cartao);
    atualizarContadorSacola();
    cartao.remove();
    renderizarCatalogo();
    mostrarAviso("Peça removida do acervo.");
}

/* Estado da Procura */
let sacola = []; // cartões (elementos HTML) que estão na sacola
let categoriaAtual = "Todas as Peças";
let pesquisaAtual = "";
let telaAtual = "inicio";
let usuarioAtual = null;

/* Movimentação da Barra Lateral */
const barraLateral = document.getElementById('barraLateral');
const gatilhoMenu = document.getElementById('gatilhoMenu');
let temporizadorBarraLateral;

const abrirBarraLateral = () => {
    clearTimeout(temporizadorBarraLateral);
    barraLateral.classList.add('mostrar');
};

const fecharBarraLateral = () => {
    temporizadorBarraLateral = setTimeout(() => {
        barraLateral.classList.remove('mostrar');
    }, 300);
};

if (gatilhoMenu) {
    gatilhoMenu.addEventListener('mouseenter', abrirBarraLateral);
    gatilhoMenu.addEventListener('mouseleave', fecharBarraLateral);
}
if (barraLateral) {
    barraLateral.addEventListener('mouseenter', abrirBarraLateral);
    barraLateral.addEventListener('mouseleave', fecharBarraLateral);
}

function iniciar() {
    restaurarSessao();
    renderizarBarraLateral();
    prepararCartoesDoHtml();
    carregarProdutosAdicionados();
    renderizarCatalogo();
}

/* Navegação */
function ehAdm() {
    return usuarioAtual !== null && usuarioAtual.perfil === 'adm';
}

function itensBarraLateral() {
    return ehAdm() ? categoriasBarraLateral.concat(rotuloAdicionarProduto) : categoriasBarraLateral;
}

function estaAtivo(categoria) {
    if (categoria === rotuloAdicionarProduto) return telaAtual === 'adicionar';
    if (categoria === "Home") return telaAtual === 'inicio';
    return telaAtual === 'catalogo' && categoria === categoriaAtual;
}

function renderizarBarraLateral() {
    const ul = document.getElementById('listaCategorias');
    if (!ul) return;
    ul.innerHTML = '';
    
    itensBarraLateral().forEach(categoria => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="item-categoria ${estaAtivo(categoria) ? 'ativo' : ''}">${categoria}</span>`;
        
        li.onclick = () => {
            if (categoria === "Home") {
                navegarPara('inicio');
            } else if (categoria === rotuloAdicionarProduto) {
                sairModoEdicao();
                navegarPara('adicionar');
            } else {
                categoriaAtual = categoria;
                pesquisaAtual = "";
                const campoPesquisa = document.getElementById('campoPesquisa');
                if (campoPesquisa) campoPesquisa.value = "";
                navegarPara('catalogo');
            }
            fecharBarraLateral();
        };
        ul.appendChild(li);
    });
}

function navegarPara(tela) {
    if (tela === 'adicionar' && !ehAdm()) {
        mostrarAviso("Acesso restrito a administradores.");
        tela = 'inicio';
    }
    if (tela !== 'adicionar') sairModoEdicao();
    telaAtual = tela;
    renderizarBarraLateral();
    document.querySelectorAll('.secao-pagina').forEach(secao => secao.classList.remove('ativo'));
    const secaoAlvo = document.getElementById(`tela-${tela}`);
    if (secaoAlvo) secaoAlvo.classList.add('ativo');
    
    if (tela === 'catalogo') renderizarCatalogo();
    if (tela === 'sacola') renderizarSacola();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Login (simulado) */
const modalLogin = document.getElementById('modalLogin');

function abrirModalLogin() {
    const formulario = document.getElementById('formularioLogin');
    if (formulario) formulario.reset();
    document.getElementById('mensagemErroLogin').textContent = '';
    modalLogin.classList.add('mostrar');
    modalLogin.setAttribute('aria-hidden', 'false');
    document.getElementById('campoUsuario').focus();
}

function fecharModalLogin() {
    modalLogin.classList.remove('mostrar');
    modalLogin.setAttribute('aria-hidden', 'true');
}

function atualizarAreaUsuario() {
    const logado = usuarioAtual !== null;
    document.getElementById('botaoEntrar').classList.toggle('oculto', logado);
    document.getElementById('areaUsuario').classList.toggle('oculto', !logado);
    document.getElementById('seloPerfil').classList.toggle('oculto', !ehAdm());
    document.body.classList.toggle('modo-adm', ehAdm());
    document.getElementById('nomeUsuario').textContent = logado ? usuarioAtual.nome : '';
}

function restaurarSessao() {
    const usuarioSalvo = lerArmazenamento(chaveSessao);
    usuarioAtual = contasSimuladas.find(conta => conta.usuario === usuarioSalvo) || null;
    atualizarAreaUsuario();
}

function sair() {
    usuarioAtual = null;
    removerArmazenamento(chaveSessao);
    atualizarAreaUsuario();
    if (telaAtual === 'adicionar') {
        navegarPara('inicio');
    } else {
        renderizarBarraLateral();
    }
    mostrarAviso("Você saiu da sua conta.");
}

if (modalLogin) {
    modalLogin.addEventListener('click', (evento) => {
        if (evento.target === modalLogin) fecharModalLogin();
    });
    document.getElementById('botaoFecharModal').addEventListener('click', fecharModalLogin);
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fecharModalLogin();
    });

    document.getElementById('formularioLogin').addEventListener('submit', (evento) => {
        evento.preventDefault();
        const usuario = document.getElementById('campoUsuario').value.trim().toLowerCase();
        const senha = document.getElementById('campoSenha').value;
        const mensagemErro = document.getElementById('mensagemErroLogin');

        const conta = contasSimuladas.find(c => c.usuario === usuario && c.senha === senha);
        if (!conta) {
            mensagemErro.textContent = "Usuário ou senha incorretos.";
            return;
        }

        usuarioAtual = conta;
        salvarArmazenamento(chaveSessao, conta.usuario);
        fecharModalLogin();
        atualizarAreaUsuario();
        renderizarBarraLateral();
        mostrarAviso(`Bem-vindo(a), ${conta.nome}!`);
    });
}

/* Adicionar / Editar Produto (somente adm) */
const formularioProduto = document.getElementById('formularioProduto');
if (formularioProduto) {
    formularioProduto.addEventListener('submit', (evento) => {
        evento.preventDefault();
        if (!ehAdm()) return;

        const nome = document.getElementById('campoNomeProduto').value.trim();
        const categoria = document.getElementById('campoCategoriaProduto').value;
        const preco = parseFloat(document.getElementById('campoPrecoProduto').value);
        const imagem = document.getElementById('campoImagemProduto').value.trim();
        const mensagemErro = document.getElementById('mensagemErroProduto');

        if (nome === "") { mensagemErro.textContent = "Informe o nome da peça."; return; }
        if (!(preco > 0)) { mensagemErro.textContent = "Informe um preço válido."; return; }
        if (!/^https?:\/\//i.test(imagem)) { mensagemErro.textContent = "Informe um link de imagem começando com http:// ou https://."; return; }
        mensagemErro.textContent = "";

        const dados = { nome: nome, categoria: categoria, preco: preco, imagem: imagem };

        if (cartaoEmEdicao !== null) {
            salvarEdicao(cartaoEmEdicao, dados);
            sairModoEdicao();
            mostrarAviso("Peça atualizada!");
        } else {
            const uid = gerarUid();
            const novoProduto = Object.assign({ uid: uid }, dados);

            gradeCatalogo.insertBefore(criarCartaoProduto(novoProduto, 'add:' + uid), estadoVazioCatalogo);
            const adicionados = lerArmazenamento(chaveProdutosAdicionados) || [];
            adicionados.push(novoProduto);
            salvarArmazenamento(chaveProdutosAdicionados, adicionados);

            formularioProduto.reset();
            mostrarAviso("Peça adicionada ao acervo!");
        }

        categoriaAtual = categoria;
        pesquisaAtual = "";
        navegarPara('catalogo');
    });

    document.getElementById('botaoCancelarEdicao').addEventListener('click', () => {
        sairModoEdicao();
        navegarPara('catalogo');
    });
}

/* Lógica da Pesquisa */
const formularioPesquisa = document.getElementById('formularioPesquisa');
if (formularioPesquisa) {
    formularioPesquisa.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const campoPesquisa = document.getElementById('campoPesquisa');
        pesquisaAtual = campoPesquisa ? campoPesquisa.value.toLowerCase().trim() : "";
        categoriaAtual = "Todas as Peças";
        renderizarBarraLateral();
        navegarPara('catalogo');
    });
}

function pesquisarCategoria(categoria) {
    categoriaAtual = categoria;
    pesquisaAtual = "";
    renderizarBarraLateral();
    navegarPara('catalogo');
}

/* Catálogo (mostra/esconde os cartões do HTML conforme categoria e pesquisa) */
function renderizarCatalogo() {
    const subtitulo = document.getElementById('subtituloCatalogo');
    if (!gradeCatalogo) return;

    if (categoriaAtual !== "Todas as Peças") {
        if (subtitulo) subtitulo.textContent = `Categoria: ${categoriaAtual}`;
    } else if (pesquisaAtual === "") {
        if (subtitulo) subtitulo.textContent = "Exibindo: Todo o acervo";
    }
    if (pesquisaAtual !== "") {
        if (subtitulo) subtitulo.textContent = `Resultados para: "${pesquisaAtual}"`;
    }

    let visiveis = 0;
    gradeCatalogo.querySelectorAll('.cartao-produto').forEach(cartao => {
        const produto = lerProduto(cartao);
        let mostrar = estaDisponivel(cartao);

        if (mostrar && categoriaAtual !== "Todas as Peças") {
            mostrar = produto.categoria === categoriaAtual;
        }

        if (mostrar && pesquisaAtual !== "") {
            const nomeBate = produto.nome.toLowerCase().includes(pesquisaAtual);
            const catMinuscula = produto.categoria.toLowerCase();
            const catBate = (catMinuscula === pesquisaAtual) || (catMinuscula === pesquisaAtual + 's');
            mostrar = nomeBate || catBate;
        }

        cartao.classList.toggle('oculto', !mostrar);
        if (mostrar) visiveis++;
    });

    if (estadoVazioCatalogo) estadoVazioCatalogo.classList.toggle('oculto', visiveis > 0);
}

/* Cliques nos cartões da grade: sacola e (para o adm) editar/remover */
if (gradeCatalogo) {
    gradeCatalogo.addEventListener('click', (evento) => {
        const cartao = evento.target.closest('.cartao-produto');
        if (!cartao) return;

        if (evento.target.closest('.botao-adm.editar')) {
            if (ehAdm()) entrarModoEdicao(cartao);
        } else if (evento.target.closest('.botao-adm.remover')) {
            if (ehAdm()) removerProduto(cartao);
        } else if (evento.target.closest('.botao')) {
            adicionarASacola(cartao);
        }
    });
}

/* Aviso (toast) */
function mostrarAviso(mensagem) {
    const aviso = document.createElement('div');
    aviso.className = 'aviso';
    aviso.textContent = mensagem;
    document.body.appendChild(aviso);

    requestAnimationFrame(() => aviso.classList.add('mostrar'));

    setTimeout(() => {
        aviso.classList.remove('mostrar');
        setTimeout(() => aviso.remove(), 400);
    }, 2200);
}

/* Carrinho */
function adicionarASacola(cartao) {
    if (cartao && estaDisponivel(cartao)) {
        cartao.classList.add('na-sacola');
        sacola.push(cartao);
        atualizarContadorSacola();
        renderizarCatalogo();
        mostrarAviso("Peça única adicionada à sacola!");
    }
}

function removerDaSacola(cartao) {
    const indiceProduto = sacola.indexOf(cartao);
    if (indiceProduto > -1) {
        cartao.classList.remove('na-sacola');
        sacola.splice(indiceProduto, 1);
        
        atualizarContadorSacola();
        renderizarSacola();
    }
}

function atualizarContadorSacola() {
    const contador = document.getElementById('contadorSacola');
    if (contador) contador.textContent = sacola.length;
}

function renderizarSacola() {
    const lista = document.getElementById('listaSacola');
    const resumo = document.getElementById('resumoSacola');
    if (!lista) return;
    lista.innerHTML = '';
    
    if (sacola.length === 0) {
        lista.innerHTML = `<div class="estado-vazio">Sua sacola está vazia. Volte ao acervo para garimpar!</div>`;
        if (resumo) resumo.style.display = 'none';
        return;
    }

    let total = 0;
    sacola.forEach(cartao => {
        const produto = lerProduto(cartao);
        total += produto.preco;
        const item = document.createElement('div');
        item.className = 'item-sacola';
        item.innerHTML = `
            <img src="${escaparHtml(produto.imagem)}" alt="${escaparHtml(produto.nome)}">
            <div class="detalhes-item-sacola">
                <div class="cabecalho-item-sacola">
                    <h4>${escaparHtml(produto.nome)}</h4>
                    <span class="preco-item-sacola">${formataPreco(produto.preco)}</span>
                </div>
                <button class="botao-remover">Remover peça (voltar ao acervo)</button>
            </div>
        `;
        item.querySelector('.botao-remover').addEventListener('click', () => removerDaSacola(cartao));
        lista.appendChild(item);
    });

    const valorTotal = document.getElementById('valorTotalSacola');
    if (valorTotal) valorTotal.textContent = formataPreco(total);
    if (resumo) resumo.style.display = 'flex';
}

function finalizarCompra() {
    if (sacola.length === 0) return;
    
    sacola.forEach(cartao => {
        cartao.classList.remove('na-sacola');
        cartao.classList.add('vendido');
    });
    
    sacola = [];
    atualizarContadorSacola();
    renderizarSacola();
    
    mostrarAviso("Compra finalizada! Uma nova história para a peça.");
    
    setTimeout(() => {
        categoriaAtual = "Todas as Peças";
        renderizarBarraLateral();
        navegarPara('inicio');
    }, 2500);
}

window.onload = iniciar;
