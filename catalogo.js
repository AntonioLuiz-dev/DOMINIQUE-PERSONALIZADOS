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

const params    = new URLSearchParams(window.location.search);
const categoria = params.get("categoria") || "topos";

document.getElementById("titulo-catalogo").innerText =
  nomesCategorias[categoria] || categoria;

const grid = document.getElementById("catalogo-grid");
grid.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Carregando produtos... honestamente</p>";

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

async function carregarCatalogo() {
  try {
    const snap = await getDocs(collection(db, "produtos"));
    const itens = [];
    snap.forEach(docSnap => {
      const p = docSnap.data();
      if (p.categoria === categoria) itens.push(p);
    });

    grid.innerHTML = "";

    if (itens.length === 0) {
      grid.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Nenhum produto nesta categoria ainda. Volte em breve! 💖</p>";
      return;
    }

    itens.forEach(produto => {
      const imgs = produto.imagens && produto.imagens.length > 0
        ? produto.imagens
        : produto.imagem ? [produto.imagem] : [];

      const card = document.createElement("div");
      card.className = "produto-item";

      card.innerHTML =
        criarCarouselHTML(imgs, produto.nome) +
        "<h3>" + produto.nome + "</h3>" +
        "<p>" + produto.descricao + "</p>" +
        "<span class='preco'>R$ " + Number(produto.preco).toFixed(2) + "</span>" +
        "<div class='produto-botoes'>" +
          "<button class='btn-add'>🛒 Carrinho</button>" +
          "<a class='btn-whatsapp' target='_blank' href='https://wa.me/5521983394115?text=" +
            encodeURIComponent("Ola! Tenho interesse no produto: " + produto.nome) + "'>💬 WhatsApp</a>" +
        "</div>";

      const imgUnica = card.querySelector(".img-produto");
      if (imgUnica) imgUnica.addEventListener("click", () => abrirLightbox(imgUnica.src, produto.nome));

      card.querySelectorAll(".carousel-img").forEach(img => {
        img.addEventListener("click", () => abrirLightbox(img.src, produto.nome));
      });

      card.querySelector(".btn-add").addEventListener("click", () => adicionarCarrinho(produto, card));
      grid.appendChild(card);
    });

    initCarousels();

  } catch (e) {
    grid.innerHTML = "<p style='text-align:center;padding:40px;color:#e57373;'>Erro ao carregar produtos. Tente novamente em instantes.</p>";
  }
}

carregarCatalogo();

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
  btnFechar.addEventListener("mouseenter", () => { btnFechar.style.transform = "scale(1.15) rotate(90deg)"; btnFechar.style.background = "#c4557a"; });
  btnFechar.addEventListener("mouseleave", () => { btnFechar.style.transform = ""; btnFechar.style.background = "#D96C8A"; });
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) fecharLightbox(); });
  btnFechar.addEventListener("click", fecharLightbox);
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharLightbox(); });
  return overlay;
}

let lightbox = null;

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
  const img = lightbox.querySelector("#lightbox-img");
  lightbox.style.opacity = "0";
  img.style.transform = "scale(0.92)";
  document.body.style.overflow = "";
  setTimeout(() => { lightbox.style.display = "none"; }, 300);
}

function adicionarCarrinho(produto, card) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(Object.assign({}, produto, { quantidade: 1 }));
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  card.classList.add("produto-animado");
  setTimeout(() => card.classList.remove("produto-animado"), 400);
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
  setTimeout(() => toast.classList.remove("show"), 2500);
}
