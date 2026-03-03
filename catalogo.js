// =======================================================================
// Firebase — leitura dos produtos do Firestore
// =======================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDneS7ceP6ezPiZIec7NKSUFGMBHBctGj8",
  authDomain: "dominique-personalizados.firebaseapp.com",
  projectId: "dominique-personalizados",
  storageBucket: "dominique-personalizados.firebasestorage.app",
  messagingSenderId: "265740517102",
  appId: "1:265740517102:web:c8058de40877e94aeffdff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =======================================================================

const nomesCategorias = {
  topos: "Topos de Bolo",
  tematica: "Kit Festa",
  afetiva: "Papelaria Afetiva",
  brindes: "Brindes Personalizados",
  centros: "Centros de Mesa"
};

const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria") || "topos";

document.getElementById("titulo-catalogo").innerText =
  nomesCategorias[categoria] || categoria;

const grid = document.getElementById("catalogo-grid");
grid.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Carregando produtos... ⏳</p>";

// Carrega do Firestore
async function carregarCatalogo() {
  try {
    const snap = await getDocs(collection(db, "produtos"));
    const itens = [];

    snap.forEach(docSnap => {
      const p = docSnap.data();
      if (p.categoria === categoria) {
        itens.push(p);
      }
    });

    grid.innerHTML = "";

    if (itens.length === 0) {
      grid.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Nenhum produto nesta categoria ainda. Volte em breve! 💖</p>";
      return;
    }

    itens.forEach(produto => {
      const card = document.createElement("div");
      card.className = "produto-item";

      card.innerHTML =
        '<img src="' + produto.imagem + '" alt="' + produto.nome + '" class="img-produto" title="Clique para ampliar 🔍">' +
        '<h3>' + produto.nome + '</h3>' +
        '<p>' + produto.descricao + '</p>' +
        '<span class="preco">R$ ' + Number(produto.preco).toFixed(2) + '</span>' +
        '<div class="produto-botoes">' +
        '<button class="btn-add">🛒 Carrinho</button>' +
        '<a class="btn-whatsapp" target="_blank" href="https://wa.me/5521983394115?text=' + encodeURIComponent('Ola! Tenho interesse no produto: ' + produto.nome) + '">💬 WhatsApp</a>' +
        '</div>';

      const imgEl = card.querySelector(".img-produto");
      imgEl.style.cursor = "zoom-in";
      imgEl.addEventListener("click", function () { abrirLightbox(produto.imagem, produto.nome); });

      card.querySelector(".btn-add").addEventListener("click", function () {
        adicionarCarrinho(produto, card);
      });

      grid.appendChild(card);
    });

  } catch (e) {
    grid.innerHTML = "<p style='text-align:center;padding:40px;color:#e57373;'>Erro ao carregar produtos. Tente novamente em instantes.</p>";
  }
}

carregarCatalogo();

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────
function criarLightbox() {
  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.innerHTML =
    '<div id="lightbox-container">' +
    '<button id="lightbox-fechar" title="Fechar">&#x2715;</button>' +
    '<img id="lightbox-img" src="" alt="Imagem expandida">' +
    '<p id="lightbox-nome"></p>' +
    '</div>';

  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.3s ease;cursor:zoom-out;";

  const container = overlay.querySelector("#lightbox-container");
  container.style.cssText = "position:relative;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;gap:14px;cursor:default;";

  const img = overlay.querySelector("#lightbox-img");
  img.style.cssText = "max-width:90vw;max-height:78vh;object-fit:contain;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,0.6);transform:scale(0.92);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);";

  const nome = overlay.querySelector("#lightbox-nome");
  nome.style.cssText = "color:#fff;font-size:16px;font-weight:500;letter-spacing:0.3px;text-shadow:0 2px 8px rgba(0,0,0,0.5);";

  const btnFechar = overlay.querySelector("#lightbox-fechar");
  btnFechar.style.cssText = "position:absolute;top:-18px;right:-18px;width:40px;height:40px;border-radius:50%;border:none;background:#D96C8A;color:#fff;font-size:18px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(217,108,138,0.5);transition:transform 0.2s,background 0.2s;z-index:1;";

  btnFechar.addEventListener("mouseenter", function () { btnFechar.style.transform = "scale(1.15) rotate(90deg)"; btnFechar.style.background = "#c4557a"; });
  btnFechar.addEventListener("mouseleave", function () { btnFechar.style.transform = "scale(1) rotate(0deg)"; btnFechar.style.background = "#D96C8A"; });

  document.body.appendChild(overlay);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) fecharLightbox(); });
  btnFechar.addEventListener("click", fecharLightbox);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharLightbox(); });

  return overlay;
}

let lightbox = null;

function abrirLightbox(src, nome) {
  if (!lightbox) lightbox = criarLightbox();
  const img = lightbox.querySelector("#lightbox-img");
  const nomeEl = lightbox.querySelector("#lightbox-nome");
  img.src = src;
  nomeEl.textContent = nome;
  document.body.style.overflow = "hidden";
  lightbox.style.display = "flex";
  requestAnimationFrame(function () {
    lightbox.style.opacity = "1";
    img.style.transform = "scale(1)";
  });
}

function fecharLightbox() {
  if (!lightbox) return;
  const img = lightbox.querySelector("#lightbox-img");
  lightbox.style.opacity = "0";
  img.style.transform = "scale(0.92)";
  document.body.style.overflow = "";
  setTimeout(function () { lightbox.style.display = "none"; }, 300);
}

// ─── CARRINHO ─────────────────────────────────────────────────────────────
function adicionarCarrinho(produto, card) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(Object.assign({}, produto, { quantidade: 1 }));
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  card.classList.add("produto-animado");
  setTimeout(function () { card.classList.remove("produto-animado"); }, 400);
  mostrarToast("Produto adicionado ao carrinho 🛒✨");
}

function mostrarToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(function () { toast.classList.remove("show"); }, 2500);
}