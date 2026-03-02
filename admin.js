// =======================================================================
// CONFIGURACAO — altere a senha aqui
// =======================================================================
const SENHA_ADMIN = "dominique2026"; // Mude para sua senha preferida
// =======================================================================

const PRODUTOS_PADRAO = {
  topos: [
    { id: 1, nome: "Topo de Bolo Personalizado", descricao: "Topo em papel fotografico com nome e arte a sua escolha.", preco: 35.00, imagem: "img/produto-exemplo.png" }
  ],
  tematica: [
    { id: 4, nome: "Maleta de Acetato", descricao: "Maleta em acetato produzida de acordo com o tema da festa. O kit contem 3 unidades.", preco: 50.00, imagem: "img/maleta-de-acetato.jpeg" },
    { id: 5, nome: "Sereia Lilas", descricao: "Personalizados Sereia Lilas. O kit contem: 5 caixas Milk / 5 caixas Cone / 5 caixas Bau.", preco: 105.00, imagem: "img/sereia-lilas.jpeg" }
  ],
  afetiva: [
    { id: 6, nome: "Kit Dinossauro", descricao: "Caixa Milk personalizada. O kit contem 10 caixas Milk personalizadas.", preco: 55.00, imagem: "img/kit-dinossauro.jpeg" }
  ],
  brindes: [
    { id: 7, nome: "Nutella Classica Dinossauro", descricao: "Nutella Classica personalizada. O kit contem 3 unidades.", preco: 90.00, imagem: "img/nutella-classica-dinossauro.jpeg" },
    { id: 8, nome: "Tubolata Tampa Plastica", descricao: "Tubolata com tampa de plastico. O kit contem 10 tubolatas personalizadas.", preco: 60.00, imagem: "img/tubolata-tampa-plastica.jpeg" },
    { id: 9, nome: "Saco Ziplock", descricao: "Saco Ziplock adesivado. Medida: 10x15 cm. O kit contem 10 unidades.", preco: 65.00, imagem: "img/saco-ziplock.jpeg" }
  ],
  centros: [
    { id: 10, nome: "Centro de Mesa Personalizado", descricao: "Centro de mesa decorativo com o tema da sua festa.", preco: 45.00, imagem: "img/produto-exemplo.png" }
  ]
};

const NOMES_CATEGORIAS = {
  topos:    "Topos de Bolo",
  tematica: "Kit Festa",
  afetiva:  "Papelaria Afetiva",
  brindes:  "Brindes Personalizados",
  centros:  "Centros de Mesa"
};

const EMOJIS_CATEGORIAS = {
  topos:    "🎉",
  tematica: "🎈",
  afetiva:  "💖",
  brindes:  "🎀",
  centros:  "🌸"
};

let categoriaAtiva     = "todas";
let produtoParaRemover = null;
let modoEdicao         = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("produtos_admin")) {
    localStorage.setItem("produtos_admin", JSON.stringify(PRODUTOS_PADRAO));
  }
  document.getElementById("senha-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") fazerLogin();
  });
});

function fazerLogin() {
  var input = document.getElementById("senha-input").value;
  var erro  = document.getElementById("login-erro");
  if (input === SENHA_ADMIN) {
    sessionStorage.setItem("admin_logado", "true");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("painel").style.display = "flex";
    iniciarPainel();
  } else {
    erro.textContent = "Senha incorreta. Tente novamente.";
    document.getElementById("senha-input").value = "";
    document.getElementById("senha-input").focus();
    setTimeout(function() { erro.textContent = ""; }, 3000);
  }
}

function fazerLogout() {
  sessionStorage.removeItem("admin_logado");
  document.getElementById("painel").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("senha-input").value = "";
}

document.getElementById("toggle-senha").addEventListener("click", function() {
  var input = document.getElementById("senha-input");
  var icon  = document.querySelector("#toggle-senha i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa fa-eye";
  }
});

function iniciarPainel() {
  construirTabs();
  renderProdutos();
  atualizarStats();
}

function mostrarAba(aba) {
  document.querySelectorAll(".aba").forEach(function(el) { el.style.display = "none"; });
  document.getElementById("aba-" + aba).style.display = "block";
  document.querySelectorAll(".nav-btn").forEach(function(btn) { btn.classList.remove("active"); });
  event.currentTarget.classList.add("active");
  if (aba === "visitas")  atualizarStats();
  if (aba === "catalogo") renderProdutos();
}

function construirTabs() {
  var container = document.getElementById("categoria-tabs");
  container.innerHTML = "";

  var todas = document.createElement("button");
  todas.className = "cat-tab active";
  todas.textContent = "Todas";
  todas.onclick = function() { filtrarCategoria("todas", todas); };
  container.appendChild(todas);

  Object.keys(NOMES_CATEGORIAS).forEach(function(key) {
    var btn = document.createElement("button");
    btn.className = "cat-tab";
    btn.textContent = EMOJIS_CATEGORIAS[key] + " " + NOMES_CATEGORIAS[key];
    btn.onclick = function() { filtrarCategoria(key, btn); };
    container.appendChild(btn);
  });
}

function filtrarCategoria(cat, btn) {
  categoriaAtiva = cat;
  document.querySelectorAll(".cat-tab").forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  renderProdutos();
}

function getProdutos() {
  return JSON.parse(localStorage.getItem("produtos_admin")) || PRODUTOS_PADRAO;
}

function renderProdutos() {
  var grid     = document.getElementById("produtos-admin-grid");
  var produtos = getProdutos();
  grid.innerHTML = "";
  var total    = 0;
  var encontrou = false;

  var categorias = categoriaAtiva === "todas" ? Object.keys(NOMES_CATEGORIAS) : [categoriaAtiva];

  categorias.forEach(function(cat) {
    var itens = produtos[cat] || [];
    total += itens.length;
    itens.forEach(function(produto) {
      encontrou = true;
      var card = document.createElement("div");
      card.className = "produto-admin-card";
      card.innerHTML =
        '<img src="' + produto.imagem + '" alt="' + produto.nome + '" onerror="this.src=\'https://placehold.co/280x160/fce4ec/D96C8A?text=Sem+imagem\'">' +
        '<div class="produto-admin-info">' +
          '<h4>' + produto.nome + '</h4>' +
          '<div class="preco-admin">R$ ' + produto.preco.toFixed(2) + '</div>' +
          '<p class="desc-admin">' + produto.descricao + '</p>' +
          '<span class="cat-label">' + EMOJIS_CATEGORIAS[cat] + ' ' + NOMES_CATEGORIAS[cat] + '</span>' +
        '</div>' +
        '<div class="produto-admin-actions">' +
          '<button class="btn-editar" onclick="editarProduto(\'' + cat + '\', \'' + produto.id + '\')">Editar</button>' +
          '<button class="btn-remover" onclick="pedirRemocao(\'' + cat + '\', \'' + produto.id + '\', \'' + produto.nome.replace(/'/g, "\\'") + '\')">Remover</button>' +
        '</div>';
      grid.appendChild(card);
    });
  });

  if (!encontrou) {
    grid.innerHTML = '<div class="vazio-msg">Nenhum produto nesta categoria ainda.<br>Va em <strong>Adicionar Produto</strong> para comecar!</div>';
  }

  document.getElementById("total-produtos-badge").textContent = total + " produto" + (total !== 1 ? "s" : "");
}

function salvarProduto() {
  var categoria = document.getElementById("form-categoria").value;
  var nome      = document.getElementById("form-nome").value.trim();
  var descricao = document.getElementById("form-descricao").value.trim();
  var preco     = parseFloat(document.getElementById("form-preco").value);
  var msgEl     = document.getElementById("form-msg");

  var tipoChecked = document.querySelector('input[name="tipo-imagem"]:checked');
  var tipoImagem  = tipoChecked ? tipoChecked.value : "arquivo";
  var imagem = tipoImagem === "arquivo"
    ? document.getElementById("form-imagem-arquivo").value.trim()
    : document.getElementById("form-imagem-url").value.trim();

  if (!nome || !descricao || isNaN(preco) || preco <= 0 || !imagem) {
    msgEl.textContent = "Preencha todos os campos obrigatorios.";
    msgEl.className = "form-msg erro";
    setTimeout(function() { msgEl.textContent = ""; }, 3000);
    return;
  }

  var produtos = getProdutos();

  if (modoEdicao) {
    var oldCat = modoEdicao.categoria;
    var idx = (produtos[oldCat] || []).findIndex(function(p) { return String(p.id) === String(modoEdicao.id); });
    if (idx !== -1) {
      var produtoAtualizado = Object.assign({}, produtos[oldCat][idx], { nome: nome, descricao: descricao, preco: preco, imagem: imagem });
      if (oldCat !== categoria) {
        produtos[oldCat].splice(idx, 1);
        if (!produtos[categoria]) produtos[categoria] = [];
        produtos[categoria].push(produtoAtualizado);
      } else {
        produtos[oldCat][idx] = produtoAtualizado;
      }
    }
    modoEdicao = null;
    msgEl.textContent = "Produto atualizado com sucesso!";
  } else {
    var todosIds = Object.values(produtos).flat().map(function(p) { return Number(p.id); });
    var novoId   = todosIds.length > 0 ? Math.max.apply(null, todosIds) + 1 : 1;
    if (!produtos[categoria]) produtos[categoria] = [];
    produtos[categoria].push({ id: novoId, nome: nome, descricao: descricao, preco: preco, imagem: imagem });
    msgEl.textContent = "Produto adicionado com sucesso!";
  }

  localStorage.setItem("produtos_admin", JSON.stringify(produtos));
  msgEl.className = "form-msg sucesso";
  setTimeout(function() { msgEl.textContent = ""; }, 4000);
  limparFormulario();
  mostrarToastAdmin("Produto salvo!");
}

function editarProduto(categoria, id) {
  var produtos = getProdutos();
  var produto  = (produtos[categoria] || []).find(function(p) { return String(p.id) === String(id); });
  if (!produto) return;

  document.querySelectorAll(".aba").forEach(function(el) { el.style.display = "none"; });
  document.getElementById("aba-adicionar").style.display = "block";
  document.querySelectorAll(".nav-btn").forEach(function(btn) { btn.classList.remove("active"); });
  document.querySelectorAll(".nav-btn")[1].classList.add("active");

  document.getElementById("form-categoria").value   = categoria;
  document.getElementById("form-nome").value        = produto.nome;
  document.getElementById("form-descricao").value   = produto.descricao;
  document.getElementById("form-preco").value       = produto.preco;

  var isUrl = produto.imagem.startsWith("http");
  if (isUrl) {
    document.querySelector('input[name="tipo-imagem"][value="url"]').checked = true;
    alternarTipoImagem("url");
    document.getElementById("form-imagem-url").value = produto.imagem;
  } else {
    document.querySelector('input[name="tipo-imagem"][value="arquivo"]').checked = true;
    alternarTipoImagem("arquivo");
    document.getElementById("form-imagem-arquivo").value = produto.imagem;
  }

  previewImagem();
  modoEdicao = { categoria: categoria, id: id };
  document.querySelector(".btn-salvar").innerHTML = '<i class="fa fa-check"></i> Atualizar Produto';
  document.querySelector("#aba-adicionar .page-header h2").textContent = "Editar Produto";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
  document.getElementById("form-nome").value = "";
  document.getElementById("form-descricao").value = "";
  document.getElementById("form-preco").value = "";
  document.getElementById("form-imagem-arquivo").value = "";
  document.getElementById("form-imagem-url").value = "";
  document.getElementById("preview-imagem").style.display = "none";
  document.getElementById("form-msg").textContent = "";
  modoEdicao = null;
  document.querySelector(".btn-salvar").innerHTML = '<i class="fa fa-check"></i> Salvar Produto';
  var h2 = document.querySelector("#aba-adicionar .page-header h2");
  if (h2) h2.textContent = "Adicionar Produto";
}

function alternarTipoImagem(tipo) {
  document.getElementById("input-arquivo").style.display = tipo === "arquivo" ? "block" : "none";
  document.getElementById("input-url").style.display     = tipo === "url"     ? "block" : "none";
  document.getElementById("preview-imagem").style.display = "none";
}

function previewImagem() {
  var tipoChecked = document.querySelector('input[name="tipo-imagem"]:checked');
  var tipo = tipoChecked ? tipoChecked.value : "arquivo";
  var src  = tipo === "arquivo"
    ? document.getElementById("form-imagem-arquivo").value.trim()
    : document.getElementById("form-imagem-url").value.trim();

  if (!src) { mostrarToastAdmin("Informe o caminho ou URL da imagem.", true); return; }
  var preview = document.getElementById("preview-imagem");
  var img     = document.getElementById("preview-img");
  img.src = src;
  preview.style.display = "block";
  img.onerror = function() {
    preview.style.display = "none";
    mostrarToastAdmin("Imagem nao encontrada.", true);
  };
}

function pedirRemocao(categoria, id, nome) {
  produtoParaRemover = { categoria: categoria, id: id };
  document.getElementById("modal-nome-produto").textContent = nome;
  document.getElementById("modal-confirmar").style.display = "flex";
}

function cancelarRemocao() {
  produtoParaRemover = null;
  document.getElementById("modal-confirmar").style.display = "none";
}

function confirmarRemocao() {
  if (!produtoParaRemover) return;
  var produtos  = getProdutos();
  var cat = produtoParaRemover.categoria;
  var id  = produtoParaRemover.id;
  produtos[cat] = (produtos[cat] || []).filter(function(p) { return String(p.id) !== String(id); });
  localStorage.setItem("produtos_admin", JSON.stringify(produtos));
  cancelarRemocao();
  renderProdutos();
  mostrarToastAdmin("Produto removido!");
}

function atualizarStats() {
  var visitas  = parseInt(localStorage.getItem("contadorVisitas") || "0");
  var produtos = getProdutos();
  var total    = Object.values(produtos).flat().length;
  document.getElementById("stat-visitas-total").textContent  = visitas.toLocaleString("pt-BR");
  document.getElementById("stat-produtos-total").textContent = total;
}

function resetarVisitas() {
  if (confirm("Tem certeza que deseja zerar o contador de visitas?")) {
    localStorage.setItem("contadorVisitas", "0");
    sessionStorage.removeItem("visitaContada");
    atualizarStats();
    mostrarToastAdmin("Contador zerado!");
  }
}

function mostrarToastAdmin(msg, isErro) {
  var toast = document.getElementById("toast-admin");
  toast.textContent = msg;
  toast.className = isErro ? "erro show" : "show";
  setTimeout(function() { toast.className = ""; }, 2500);
}
