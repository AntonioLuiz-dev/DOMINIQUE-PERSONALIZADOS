import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDneS7ceP6ezPiZIec7NKSUFGMBHBctGj8",
  authDomain: "dominique-personalizados.firebaseapp.com",
  projectId: "dominique-personalizados",
  storageBucket: "dominique-personalizados.firebasestorage.app",
  messagingSenderId: "265740517102",
  appId: "1:265740517102:web:c8058de40877e94aeffdff"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

const NOMES_CATEGORIAS = {
  topos:       "Topos de Bolo",
  tematica:    "Kit Festa",
  afetiva:     "Papelaria Afetiva",
  brindes:     "Brindes Personalizados",
  centros:     "Centros de Mesa",
  pegue_monte: "Pegue e Monte",
  acetato:     "Caixas de Acetato",
  convites:    "Convites",
  pascoa:      "Páscoa"
};

const EMOJIS = {
  topos:"🎉", tematica:"🎈", afetiva:"💖", brindes:"🎀", centros:"🌸",
  pegue_monte:"📦", acetato:"🧊", convites:"✉️"
};

let categoriaAtiva     = "todas";
let produtoParaRemover = null;
let modoEdicao         = null;
let produtosCache      = {};

// ─── Estado das imagens do formulário ─────────────────────
let imagensForm = []; // array de strings (paths ou URLs)

// ─── AUTH ─────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("painel").style.display       = "flex";
    iniciarPainel();
  } else {
    document.getElementById("painel").style.display       = "none";
    document.getElementById("login-screen").style.display = "flex";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("senha-input").addEventListener("keydown", e => { if (e.key === "Enter") fazerLogin(); });
  document.getElementById("email-input").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("senha-input").focus(); });

  // Alternância do tipo de imagem nova
  document.querySelectorAll('input[name="tipo-imagem-nova"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const tipo = document.querySelector('input[name="tipo-imagem-nova"]:checked').value;
      document.getElementById("input-imagem-arquivo").style.display = tipo === "arquivo" ? "block" : "none";
      document.getElementById("input-imagem-url").style.display     = tipo === "url"     ? "block" : "none";
    });
  });
});

async function fazerLogin() {
  const email = document.getElementById("email-input").value.trim();
  const senha = document.getElementById("senha-input").value;
  const erro  = document.getElementById("login-erro");
  const btn   = document.getElementById("btn-login");

  if (!email || !senha) { erro.textContent = "Preencha o e-mail e a senha."; return; }
  btn.textContent = "Entrando...";
  btn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch {
    erro.textContent = "E-mail ou senha incorretos.";
    btn.textContent = "Entrar";
    btn.disabled = false;
    setTimeout(() => { erro.textContent = ""; }, 3000);
  }
}

async function fazerLogout() { await signOut(auth); }

document.getElementById("toggle-senha").addEventListener("click", () => {
  const input = document.getElementById("senha-input");
  const icon  = document.querySelector("#toggle-senha i");
  if (input.type === "password") { input.type = "text"; icon.className = "fa fa-eye-slash"; }
  else { input.type = "password"; icon.className = "fa fa-eye"; }
});

// ─── PAINEL ───────────────────────────────────────────────
async function iniciarPainel() {
  construirTabs();
  await carregarProdutos();
  renderProdutos();
  atualizarStats();
}

function mostrarAba(aba) {
  document.querySelectorAll(".aba").forEach(el => { el.style.display = "none"; });
  document.getElementById("aba-" + aba).style.display = "block";
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");
  if (aba === "visitas")  atualizarStats();
  if (aba === "catalogo") renderProdutos();
}

// ─── FIRESTORE ────────────────────────────────────────────
async function carregarProdutos() {
  produtosCache = {};
  Object.keys(NOMES_CATEGORIAS).forEach(cat => { produtosCache[cat] = []; });
  try {
    const snap = await getDocs(collection(db, "produtos"));
    snap.forEach(docSnap => {
      const p = docSnap.data();
      if (produtosCache[p.categoria] !== undefined) {
        produtosCache[p.categoria].push({ ...p, firestoreId: docSnap.id });
      }
    });
  } catch {
    mostrarToastAdmin("Erro ao carregar produtos.", true);
  }
}

// ─── TABS ─────────────────────────────────────────────────
function construirTabs() {
  const container = document.getElementById("categoria-tabs");
  container.innerHTML = "";
  const todas = document.createElement("button");
  todas.className = "cat-tab active";
  todas.textContent = "Todas";
  todas.onclick = () => filtrarCategoria("todas", todas);
  container.appendChild(todas);
  Object.keys(NOMES_CATEGORIAS).forEach(key => {
    const btn = document.createElement("button");
    btn.className = "cat-tab";
    btn.textContent = EMOJIS[key] + " " + NOMES_CATEGORIAS[key];
    btn.onclick = () => filtrarCategoria(key, btn);
    container.appendChild(btn);
  });
}

function filtrarCategoria(cat, btn) {
  categoriaAtiva = cat;
  document.querySelectorAll(".cat-tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProdutos();
}

// ─── RENDER ───────────────────────────────────────────────
function renderProdutos() {
  const grid = document.getElementById("produtos-admin-grid");
  grid.innerHTML = "";
  let total = 0;
  let encontrou = false;
  const cats = categoriaAtiva === "todas" ? Object.keys(NOMES_CATEGORIAS) : [categoriaAtiva];

  cats.forEach(cat => {
    (produtosCache[cat] || []).forEach(produto => {
      encontrou = true;
      total++;

      // Suporte a múltiplas imagens e campo legado
      const imgs = produto.imagens && produto.imagens.length > 0
        ? produto.imagens
        : produto.imagem ? [produto.imagem] : [];
      const capa = imgs[0] || "https://placehold.co/280x160/fce4ec/D96C8A?text=Sem+imagem";

      const card = document.createElement("div");
      card.className = "produto-admin-card";
      card.innerHTML =
        '<img src="' + capa + '" alt="' + produto.nome + '" onerror="this.src=\'https://placehold.co/280x160/fce4ec/D96C8A?text=Sem+imagem\'">' +
        '<div class="produto-admin-info">' +
          '<h4>' + produto.nome + '</h4>' +
          '<div class="preco-admin">R$ ' + Number(produto.preco).toFixed(2) + '</div>' +
          '<p class="desc-admin">' + produto.descricao + '</p>' +
          '<span class="cat-label">' + EMOJIS[cat] + ' ' + NOMES_CATEGORIAS[cat] + '</span>' +
          (imgs.length > 1 ? '<span class="img-count">📷 ' + imgs.length + ' fotos</span>' : '') +
        '</div>' +
        '<div class="produto-admin-actions">' +
          '<button class="btn-editar" onclick="editarProduto(\'' + produto.firestoreId + '\')">✏️ Editar</button>' +
          '<button class="btn-remover" onclick="pedirRemocao(\'' + produto.firestoreId + '\', \'' + produto.nome.replace(/'/g, "\\'") + '\')">🗑️ Remover</button>' +
        '</div>';
      grid.appendChild(card);
    });
  });

  if (!encontrou) {
    grid.innerHTML = '<div class="vazio-msg">Nenhum produto ainda.<br>Vá em <strong>Adicionar Produto</strong> para começar!</div>';
  }
  document.getElementById("total-produtos-badge").textContent = total + " produto" + (total !== 1 ? "s" : "");
}

// ─── MÚLTIPLAS IMAGENS ────────────────────────────────────
function renderImagensForm() {
  const lista = document.getElementById("imagens-lista");
  lista.innerHTML = "";

  imagensForm.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "imagem-item";
    item.innerHTML =
      '<img class="imagem-item-thumb" src="' + src + '" onerror="this.src=\'https://placehold.co/48x48/fce4ec/D96C8A?text=?\'">' +
      '<div class="imagem-item-info">' +
        '<span class="imagem-item-url">' + src + '</span>' +
        (i === 0 ? '<span class="imagem-item-capa">⭐ Capa</span>' : '') +
      '</div>' +
      '<div class="imagem-item-actions">' +
        (i > 0 ? '<button class="btn-img-up" title="Mover para cima" onclick="moverImagem(' + i + ',-1)">↑</button>' : '') +
        (i < imagensForm.length - 1 ? '<button class="btn-img-down" title="Mover para baixo" onclick="moverImagem(' + i + ',1)">↓</button>' : '') +
        '<button class="btn-img-remove" title="Remover" onclick="removerImagem(' + i + ')">✕</button>' +
      '</div>';
    lista.appendChild(item);
  });
}

function adicionarImagem() {
  const tipo = document.querySelector('input[name="tipo-imagem-nova"]:checked').value;
  const inputEl = tipo === "arquivo"
    ? document.getElementById("nova-imagem-arquivo")
    : document.getElementById("nova-imagem-url");
  const src = inputEl.value.trim();

  if (!src) { mostrarToastAdmin("Informe o caminho ou URL da imagem.", true); return; }
  if (imagensForm.length >= 10) { mostrarToastAdmin("Máximo de 10 imagens por produto.", true); return; }
  if (imagensForm.includes(src)) { mostrarToastAdmin("Essa imagem já foi adicionada.", true); return; }

  imagensForm.push(src);
  inputEl.value = "";
  renderImagensForm();
}

function removerImagem(idx) {
  imagensForm.splice(idx, 1);
  renderImagensForm();
}

function moverImagem(idx, dir) {
  const novo = idx + dir;
  if (novo < 0 || novo >= imagensForm.length) return;
  [imagensForm[idx], imagensForm[novo]] = [imagensForm[novo], imagensForm[idx]];
  renderImagensForm();
}

// ─── SALVAR ───────────────────────────────────────────────
async function salvarProduto() {
  const categoria = document.getElementById("form-categoria").value;
  const nome      = document.getElementById("form-nome").value.trim();
  const descricao = document.getElementById("form-descricao").value.trim();
  const preco     = parseFloat(document.getElementById("form-preco").value);
  const msgEl     = document.getElementById("form-msg");

  if (!nome || !descricao || isNaN(preco) || preco <= 0) {
    msgEl.textContent = "Preencha todos os campos obrigatórios.";
    msgEl.className = "form-msg erro";
    setTimeout(() => { msgEl.textContent = ""; }, 3000);
    return;
  }

  if (imagensForm.length === 0) {
    msgEl.textContent = "Adicione pelo menos uma imagem.";
    msgEl.className = "form-msg erro";
    setTimeout(() => { msgEl.textContent = ""; }, 3000);
    return;
  }

  const btnSalvar = document.querySelector(".btn-salvar");
  btnSalvar.textContent = "Salvando...";
  btnSalvar.disabled = true;

  try {
    const firestoreId = modoEdicao ? modoEdicao : Date.now().toString();
    const dadosProduto = {
      nome, descricao, preco, categoria,
      imagens: imagensForm,
      imagem:  imagensForm[0]  // campo legado para retrocompatibilidade
    };
    await setDoc(doc(db, "produtos", firestoreId), dadosProduto);
    msgEl.textContent = modoEdicao ? "Produto atualizado!" : "Produto adicionado!";
    msgEl.className = "form-msg sucesso";
    setTimeout(() => { msgEl.textContent = ""; }, 3000);
    modoEdicao = null;
    limparFormulario();
    await carregarProdutos();
    renderProdutos();
    mostrarToastAdmin("Produto salvo com sucesso! ✅");
  } catch {
    msgEl.textContent = "Erro ao salvar. Tente novamente.";
    msgEl.className = "form-msg erro";
    mostrarToastAdmin("Erro ao salvar produto.", true);
  }

  btnSalvar.innerHTML = '<i class="fa fa-check"></i> Salvar Produto';
  btnSalvar.disabled = false;
}

// ─── EDITAR ───────────────────────────────────────────────
function editarProduto(firestoreId) {
  let produto = null;
  Object.values(produtosCache).flat().forEach(p => { if (p.firestoreId === firestoreId) produto = p; });
  if (!produto) return;

  document.querySelectorAll(".aba").forEach(el => { el.style.display = "none"; });
  document.getElementById("aba-adicionar").style.display = "block";
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".nav-btn")[1].classList.add("active");

  document.getElementById("form-categoria").value  = produto.categoria;
  document.getElementById("form-nome").value        = produto.nome;
  document.getElementById("form-descricao").value   = produto.descricao;
  document.getElementById("form-preco").value        = produto.preco;

  // Carrega imagens existentes (suporte a array e campo legado)
  imagensForm = produto.imagens && produto.imagens.length > 0
    ? [...produto.imagens]
    : produto.imagem ? [produto.imagem] : [];
  renderImagensForm();

  modoEdicao = firestoreId;
  document.querySelector(".btn-salvar").innerHTML = '<i class="fa fa-check"></i> Atualizar Produto';
  const h2 = document.querySelector("#aba-adicionar .page-header h2");
  if (h2) h2.textContent = "✏️ Editar Produto";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
  document.getElementById("form-nome").value      = "";
  document.getElementById("form-descricao").value = "";
  document.getElementById("form-preco").value      = "";
  document.getElementById("nova-imagem-arquivo").value = "";
  document.getElementById("nova-imagem-url").value     = "";
  document.getElementById("form-msg").textContent  = "";
  imagensForm = [];
  renderImagensForm();
  modoEdicao = null;
  document.querySelector('input[name="tipo-imagem-nova"][value="arquivo"]').checked = true;
  document.getElementById("input-imagem-arquivo").style.display = "block";
  document.getElementById("input-imagem-url").style.display     = "none";
  document.querySelector(".btn-salvar").innerHTML = '<i class="fa fa-check"></i> Salvar Produto';
  const h2 = document.querySelector("#aba-adicionar .page-header h2");
  if (h2) h2.textContent = "➕ Adicionar Produto";
}

// ─── REMOVER ──────────────────────────────────────────────
function pedirRemocao(firestoreId, nome) {
  produtoParaRemover = firestoreId;
  document.getElementById("modal-nome-produto").textContent = nome;
  document.getElementById("modal-confirmar").style.display = "flex";
}

function cancelarRemocao() {
  produtoParaRemover = null;
  document.getElementById("modal-confirmar").style.display = "none";
}

async function confirmarRemocao() {
  if (!produtoParaRemover) return;
  try {
    await deleteDoc(doc(db, "produtos", produtoParaRemover));
    cancelarRemocao();
    await carregarProdutos();
    renderProdutos();
    mostrarToastAdmin("Produto removido!");
  } catch {
    mostrarToastAdmin("Erro ao remover.", true);
    cancelarRemocao();
  }
}

// ─── STATS ────────────────────────────────────────────────
function atualizarStats() {
  const visitas = parseInt(localStorage.getItem("contadorVisitas") || "0");
  const total   = Object.values(produtosCache).flat().length;
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

// ─── TOAST ────────────────────────────────────────────────
function mostrarToastAdmin(msg, isErro) {
  const toast = document.getElementById("toast-admin");
  toast.textContent = msg;
  toast.className = isErro ? "erro show" : "show";
  setTimeout(() => { toast.className = ""; }, 2500);
}

// ─── EXPORTS ──────────────────────────────────────────────
window.fazerLogin       = fazerLogin;
window.fazerLogout      = fazerLogout;
window.mostrarAba       = mostrarAba;
window.filtrarCategoria = filtrarCategoria;
window.salvarProduto    = salvarProduto;
window.editarProduto    = editarProduto;
window.limparFormulario = limparFormulario;
window.pedirRemocao     = pedirRemocao;
window.cancelarRemocao  = cancelarRemocao;
window.confirmarRemocao = confirmarRemocao;
window.resetarVisitas   = resetarVisitas;
window.adicionarImagem  = adicionarImagem;
window.removerImagem    = removerImagem;
window.moverImagem      = moverImagem;
