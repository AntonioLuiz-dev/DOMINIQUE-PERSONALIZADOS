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
const db  = getFirestore(app);

const nomesCategorias = {
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

const params      = new URLSearchParams(window.location.search);
let   query       = params.get("q") || "";
const inputMain   = document.getElementById("busca-input");
const inputHeader = document.getElementById("busca-input-header");
const resultGrid  = document.getElementById("busca-grid");
const resultTitulo = document.getElementById("busca-titulo");

if (inputMain)   inputMain.value   = query;
if (inputHeader) inputHeader.value = query;

// ─── SEARCH ───────────────────────────────────────────────
async function buscar(q) {
  if (!q.trim()) {
    resultTitulo.textContent = "Digite algo para buscar.";
    resultGrid.innerHTML = "";
    return;
  }

  resultTitulo.textContent = "Buscando...";
  resultGrid.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Carregando... ⏳</p>";

  try {
    const snap = await getDocs(collection(db, "produtos"));
    const termo = q.toLowerCase().trim();
    const resultados = [];

    snap.forEach(docSnap => {
      const p = docSnap.data();
      const catNome = nomesCategorias[p.categoria] || "";
      if (
        p.nome?.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo) ||
        catNome.toLowerCase().includes(termo)
      ) {
        resultados.push(p);
      }
    });

    resultTitulo.textContent =
      resultados.length > 0
        ? resultados.length + " resultado" + (resultados.length !== 1 ? "s" : "") + ' para "' + q + '"'
        : 'Nenhum resultado para "' + q + '"';

    resultGrid.innerHTML = "";

    if (resultados.length === 0) {
      resultGrid.innerHTML = "<p style='text-align:center;padding:60px 20px;color:#aaa;'>Nenhum produto encontrado 😢<br>Tente outro termo de busca.</p>";
      return;
    }

    resultados.forEach(produto => {
      const imgs = produto.imagens && produto.imagens.length > 0
        ? produto.imagens
        : produto.imagem ? [produto.imagem] : [];

      const card = document.createElement("div");
      card.className = "produto-item";

      card.innerHTML =
        criarCarouselHTML(imgs, produto.nome) +
        "<h3>" + produto.nome + "</h3>" +
        "<p style='font-size:12px;color:#bbb;margin-bottom:4px;'>" + (nomesCategorias[produto.categoria] || produto.categoria) + "</p>" +
        "<p>" + produto.descricao + "</p>" +
        "<span class='preco'>R$ " + Number(produto.preco).toFixed(2) + "</span>" +
        "<div class='produto-botoes'>" +
          "<button class='btn-add'>🛒 Carrinho</button>" +
          "<a class='btn-whatsapp' target='_blank' href='https://wa.me/5521983394115?text=" +
            encodeURIComponent("Ola! Tenho interesse no produto: " + produto.nome) + "'>💬 WhatsApp</a>" +
        "</div>";

      // lightbox no carousel
      card.querySelectorAll(".carousel-img").forEach(img => {
        img.addEventListener("click", () => abrirLightbox(img.src, produto.nome));
      });
      // lightbox em imagem única
      const imgUnica = card.querySelector(".img-produto");
      if (imgUnica) imgUnica.addEventListener("click", () => abrirLightbox(imgUnica.src, produto.nome));

      card.querySelector(".btn-add").addEventListener("click", () => adicionarCarrinho(produto, card));
      resultGrid.appendChild(card);
    });

    initCarousels();

  } catch (e) {
    resultGrid.innerHTML = "<p style='text-align:center;padding:40px;color:#e57373;'>Erro ao buscar. Tente novamente.</p>";
  }
}

function fazerBusca() {
  const q = (inputMain?.value || inputHeader?.value || "").trim();
  if (!q) return;
  history.pushState({}, "", "busca.html?q=" + encodeURIComponent(q));
  query = q;
  if (inputMain)   inputMain.value   = q;
  if (inputHeader) inputHeader.value = q;
  buscar(q);
}

document.getElementById("busca-btn")?.addEventListener("click", fazerBusca);
document.getElementById("busca-btn-header")?.addEventListener("click", fazerBusca);
inputMain?.addEventListener("keydown",   e => { if (e.key === "Enter") fazerBusca(); });
inputHeader?.addEventListener("keydown", e => { if (e.key === "Enter") fazerBusca(); });

document.getElementById("menu-toggle")?.addEventListener("click", () => {
  document.getElementById("nav-menu")?.classList.toggle("active");
});

// ─── CAROUSEL ─────────────────────────────────────────────
function criarCarouselHTML(imgs, nome) {
  if (!imgs || imgs.length === 0) {
    return '<img src="https://placehold.co/280x180/fce4ec/D96C8A?text=Sem+imagem" class="img-produto" alt="' + nome + '">';
  }
  if (imgs.length === 1) {
    return '<img src="' + imgs[0] + '" class="img-produto" alt="' + nome + '" style="cursor:zoom-in" onerror="this.src=\'https://placehold.co/280x180/fce4ec/D96C8A?text=Sem+imagem\'">';
  }
  const slides = imgs.map(src =>
    '<img src="' + src + '" class="carousel-img" alt="' + nome + '" onerror="this.src=\'https://placehold.co/280x180/fce4ec/D96C8A?text=Sem+imagem\'">'
  ).join("");
  const dots = imgs.map((_, i) =>
    '<span class="carousel-dot' + (i === 0 ? " active" : "") + '"></span>'
  ).join("");
  return (
    '<div class="carousel" data-ready="false">' +
      '<div class="carousel-track">' + slides + "</div>" +
      '<button class="carousel-btn carousel-prev" type="button">&#8249;</button>' +
      '<button class="carousel-btn carousel-next" type="button">&#8250;</button>' +
      '<div class="carousel-dots">' + dots + "</div>" +
    "</div>"
  );
}

function initCarousels() {
  document.querySelectorAll('.carousel[data-ready="false"]').forEach(carousel => {
    const track  = carousel.querySelector(".carousel-track");
    const slides = carousel.querySelectorAll(".carousel-img");
    const dots   = carousel.querySelectorAll(".carousel-dot");
    const n = slides.length;
    if (n <= 1) { carousel.dataset.ready = "true"; return; }

    let current = 0;
    let autoplay;

    function goTo(i) {
      current = ((i % n) + n) % n;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach((d, idx) => d.classList.toggle("active", idx === current));
    }

    function startAutoplay() {
      clearInterval(autoplay);
      autoplay = setInterval(() => goTo(current + 1), 3000);
    }

    carousel.querySelector(".carousel-prev").addEventListener("click", e => {
      e.stopPropagation(); goTo(current - 1); startAutoplay();
    });
    carousel.querySelector(".carousel-next").addEventListener("click", e => {
      e.stopPropagation(); goTo(current + 1); startAutoplay();
    });
    dots.forEach((dot, i) => {
      dot.addEventListener("click", e => { e.stopPropagation(); goTo(i); startAutoplay(); });
    });

    startAutoplay();
    carousel.dataset.ready = "true";
  });
}

// ─── LIGHTBOX ─────────────────────────────────────────────
let lightbox = null;
function criarLightbox() {
  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.innerHTML =
    '<div id="lightbox-container">' +
      '<button id="lightbox-fechar" title="Fechar">&#x2715;</button>' +
      '<img id="lightbox-img" src="" alt="">' +
      '<p id="lightbox-nome"></p>' +
    '</div>';
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.3s ease;cursor:zoom-out;";
  const cont = overlay.querySelector("#lightbox-container");
  cont.style.cssText = "position:relative;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;gap:14px;cursor:default;";
  const img = overlay.querySelector("#lightbox-img");
  img.style.cssText = "max-width:90vw;max-height:78vh;object-fit:contain;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,0.6);transform:scale(0.92);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);";
  const nome = overlay.querySelector("#lightbox-nome");
  nome.style.cssText = "color:#fff;font-size:16px;font-weight:500;text-shadow:0 2px 8px rgba(0,0,0,0.5);";
  const btn = overlay.querySelector("#lightbox-fechar");
  btn.style.cssText = "position:absolute;top:-18px;right:-18px;width:40px;height:40px;border-radius:50%;border:none;background:#D96C8A;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(217,108,138,0.5);transition:transform 0.2s;z-index:1;";
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.15) rotate(90deg)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) fecharLightbox(); });
  btn.addEventListener("click", fecharLightbox);
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharLightbox(); });
  return overlay;
}
function abrirLightbox(src, nome) {
  if (!lightbox) lightbox = criarLightbox();
  lightbox.querySelector("#lightbox-img").src = src;
  lightbox.querySelector("#lightbox-nome").textContent = nome;
  document.body.style.overflow = "hidden";
  lightbox.style.display = "flex";
  requestAnimationFrame(() => {
    lightbox.style.opacity = "1";
    lightbox.querySelector("#lightbox-img").style.transform = "scale(1)";
  });
}
function fecharLightbox() {
  if (!lightbox) return;
  lightbox.style.opacity = "0";
  lightbox.querySelector("#lightbox-img").style.transform = "scale(0.92)";
  document.body.style.overflow = "";
  setTimeout(() => { lightbox.style.display = "none"; }, 300);
}

// ─── CARRINHO ─────────────────────────────────────────────
function adicionarCarrinho(produto, card) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(Object.assign({}, produto, { quantidade: 1 }));
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  card.classList.add("produto-animado");
  setTimeout(() => card.classList.remove("produto-animado"), 400);
  mostrarToast("Produto adicionado ao carrinho 🛒✨");
}
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ─── BADGE CARRINHO ───────────────────────────────────────
function atualizarBadge() {
  const c = JSON.parse(localStorage.getItem("carrinho")) || [];
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const total = c.reduce((a, i) => a + (i.quantidade || 1), 0);
  badge.style.display = total > 0 ? "inline-block" : "none";
  badge.textContent = total;
}

document.addEventListener("DOMContentLoaded", atualizarBadge);

// ─── INIT ─────────────────────────────────────────────────
if (query) buscar(query);
else {
  resultTitulo.textContent = "Use a caixa de busca para encontrar produtos 🔍";
}
