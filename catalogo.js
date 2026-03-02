// =======================================================================
// 📦 COMO ADICIONAR PRODUTOS AO CATÁLOGO
// =======================================================================
//
// 1. Coloque a imagem do produto na pasta  img/
//    Exemplo: salve o arquivo como  img/topo-unicornio.png
//
// 2. Adicione um novo objeto dentro da categoria correta abaixo.
//    Copie e cole este modelo dentro do array da categoria desejada:
//
//    {
//      id: 99,                              ← número único, não repita
//      nome: "Nome do Produto",
//      descricao: "Descrição curta.",
//      preco: 35.00,                        ← use ponto como separador decimal
//      imagem: "img/nome-do-arquivo.png"    ← caminho da imagem na pasta img/
//    }
//
// 3. Salve o arquivo. O produto já aparece no catálogo automaticamente.
//
// ✅ CATEGORIAS DISPONÍVEIS:
//    topos      → Topos de Bolo
//    tematica   → Kit Festa
//    afetiva    → Papelaria Afetiva
//    brindes    → Brindes Personalizados
//    centros    → Centros de Mesa
// =======================================================================

const produtos = {

  // ─── 🎉 TOPOS DE BOLO ───────────────────────────────────────────────
  topos: [
    {
      id: 1,
      nome: "Topo de Bolo Personalizado",
      descricao: "Topo em papel fotográfico com nome e arte à sua escolha.",
      preco: 35.00,
      imagem: "img/produto-exemplo.png"
    },
    // ← ADICIONE MAIS TOPOS AQUI
  ],

  // ─── 🎈 KIT FESTA ───────────────────────────────────────────────────
  tematica: [
    {
      id: 4,
      nome: "Maleta de Acetato",
      descricao: "Maleta em acetato ✨ Produzida de acordo com o tema da festa, acompanha tag pendurada com nome e idade do aniversariante. 📦 O kit contém 3 unidades. Perfeitas para compor a mesa principal e encantar seus convidados!",
      preco: 50.00,
      imagem: "img/maleta-de-acetato.jpeg"
    },
    {
      id: 4.1,
      nome: "Sereia Lilás",
      descricao: "Personalizados Sereia Lilás ✨ Caixas clássicas personalizadas no tema Sereia. Neste modelo, o kit contém 3 formatos de caixas: Milk, Cone e Baú. 📦 O kit contém: 5 caixas Milk / 5 caixas Cone / 5 caixas Baú. Perfeito para compor a mesa principal e encantar seus convidados!",
      preco: 105.00,
      imagem: "img/sereia-lilas.jpeg"
    },
    // ← ADICIONE MAIS KITS FESTA AQUI
  ],

  // ─── 💖 PAPELARIA AFETIVA ───────────────────────────────────────────
  afetiva: [
    {
      id: 5,
      nome: "Kit Dinossauro",
      descricao: "Caixa Milk personalizada ✨ Produzida seguindo a paleta de cores da festa, com nome e idade da criança, trazendo ainda mais harmonia e encanto para a decoração. Neste modelo, optamos pelo fechamento com mini pregador, garantindo um acabamento delicado e diferenciado. 📦 O kit contém 10 caixas Milk personalizadas. Perfeitas para compor a mesa principal ou encantar seus convidados!",
      preco: 55.00,
      imagem: "img/kit-dinossauro.jpeg"
    },
    // ← ADICIONE MAIS AFETIVOS AQUI
  ],

  // ─── 🎀 BRINDES PERSONALIZADOS ──────────────────────────────────────
  brindes: [
    {
      id: 6,
      nome: "Nutella Clássica Dinossauro",
      descricao: "Nutella Clássica personalizada ✨ Produzida seguindo a paleta de cores da festa, com nome e idade da criança, trazendo ainda mais harmonia e encanto para a decoração. Neste modelo, conta com passamanaria na cor da paleta da festa, pompons e aplicação do personagem principal em camadas no topo, junto ao nome e idade da criança. 📦 O kit contém 3 unidades. Perfeita para compor a mesa principal ou encantar seus convidados!",
      preco: 90.00,
      imagem: "img/nutella-classica-dinossauro.jpeg"
    },
    {
      id: 6.1,
      nome: "Tubolata Tampa Plástica",
      descricao: "Tubolata com tampa de plástico ✨ Produzida seguindo a paleta de cores da festa, com nome e idade da criança, trazendo ainda mais harmonia e encanto para a decoração. Neste modelo, a personalização é adesiva e acompanha laço modelo gravata. 📦 O kit contém 10 tubolatas personalizadas. Perfeita para compor a mesa principal ou encantar seus convidados!",
      preco: 60.00,
      imagem: "img/tubolata-tampa-plastica.jpeg"
    },
    {
      id: 6.2,
      nome: "Saco Ziplock",
      descricao: "Saco Ziplock ✨ Adesivado por inteiro na parte frontal, de acordo com o tema da festa. Acompanha tag dupla personalizada. Medida: 10x15 cm. 📦 O kit contém 10 unidades. Perfeito para compor a mesa principal e encantar seus convidados!",
      preco: 65.00,
      imagem: "img/saco-ziplock.jpeg"
    },
    // ← ADICIONE MAIS BRINDES AQUI
  ],

  // ─── 🌸 CENTROS DE MESA ─────────────────────────────────────────────
  centros: [
    {
      id: 7,
      nome: "Centro de Mesa Personalizado",
      descricao: "Centro de mesa decorativo com o tema da sua festa.",
      preco: 45.00,
      imagem: "img/produto-exemplo.png"
    },
    // ← ADICIONE MAIS CENTROS DE MESA AQUI
  ]
};

// =======================================================================
// ⚙️  A PARTIR DAQUI NÃO É NECESSÁRIO EDITAR
// =======================================================================

// ─── LIGHTBOX (expansão de imagem) ──────────────────────────────────────
function criarLightbox() {
  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.innerHTML = `
    <div id="lightbox-container">
      <button id="lightbox-fechar" title="Fechar">✕</button>
      <img id="lightbox-img" src="" alt="Imagem expandida">
      <p id="lightbox-nome"></p>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: zoom-out;
  `;

  const container = overlay.querySelector("#lightbox-container");
  container.style.cssText = `
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    cursor: default;
  `;

  const img = overlay.querySelector("#lightbox-img");
  img.style.cssText = `
    max-width: 90vw;
    max-height: 78vh;
    object-fit: contain;
    border-radius: 18px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    transform: scale(0.92);
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
  `;

  const nome = overlay.querySelector("#lightbox-nome");
  nome.style.cssText = `
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.3px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  `;

  const btnFechar = overlay.querySelector("#lightbox-fechar");
  btnFechar.style.cssText = `
    position: absolute;
    top: -18px;
    right: -18px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #D96C8A;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(217,108,138,0.5);
    transition: transform 0.2s, background 0.2s;
    z-index: 1;
  `;

  btnFechar.addEventListener("mouseenter", () => {
    btnFechar.style.transform = "scale(1.15) rotate(90deg)";
    btnFechar.style.background = "#c4557a";
  });
  btnFechar.addEventListener("mouseleave", () => {
    btnFechar.style.transform = "scale(1) rotate(0deg)";
    btnFechar.style.background = "#D96C8A";
  });

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharLightbox();
  });

  btnFechar.addEventListener("click", fecharLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharLightbox();
  });

  return overlay;
}

let lightbox = null;

function abrirLightbox(src, nome) {
  if (!lightbox) lightbox = criarLightbox();

  const img    = lightbox.querySelector("#lightbox-img");
  const nomeEl = lightbox.querySelector("#lightbox-nome");

  img.src            = src;
  nomeEl.textContent = nome;
  document.body.style.overflow = "hidden";

  lightbox.style.display = "flex";
  requestAnimationFrame(() => {
    lightbox.style.opacity = "1";
    img.style.transform    = "scale(1)";
  });
}

function fecharLightbox() {
  if (!lightbox) return;

  const img = lightbox.querySelector("#lightbox-img");
  lightbox.style.opacity = "0";
  img.style.transform    = "scale(0.92)";
  document.body.style.overflow = "";

  setTimeout(() => {
    lightbox.style.display = "none";
  }, 300);
}

// ─── RENDERIZAÇÃO ────────────────────────────────────────────────────────
const params    = new URLSearchParams(window.location.search);
const categoria = params.get("categoria") || "topos";

const nomesCategorias = {
  topos:    "Topos de Bolo",
  tematica: "Kit Festa",
  afetiva:  "Papelaria Afetiva",
  brindes:  "Brindes Personalizados",
  centros:  "Centros de Mesa"
};

document.getElementById("titulo-catalogo").innerText =
  nomesCategorias[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);

const grid = document.getElementById("catalogo-grid");
const itensDaCategoria = produtos[categoria];

if (!itensDaCategoria || itensDaCategoria.length === 0) {
  grid.innerHTML = "<p style='text-align:center; color:#aaa; padding:40px;'>Nenhum produto cadastrado nesta categoria ainda. 🛠️</p>";
} else {
  itensDaCategoria.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-item";

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" class="img-produto" title="Clique para ampliar 🔍">
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
      <div class="produto-botoes">
        <button class="btn-add">🛒 Carrinho</button>
        <a class="btn-whatsapp" target="_blank"
          href="https://wa.me/5521983394115?text=${encodeURIComponent('Olá! Tenho interesse no produto: ' + produto.nome)}">
          💬 WhatsApp
        </a>
      </div>
    `;

    const imgEl = card.querySelector(".img-produto");
    imgEl.style.cursor = "zoom-in";
    imgEl.addEventListener("click", () => abrirLightbox(produto.imagem, produto.nome));

    card.querySelector(".btn-add").addEventListener("click", () => {
      adicionarCarrinho(produto, card);
    });

    grid.appendChild(card);
  });
}

function adicionarCarrinho(produto, card) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push({ ...produto, quantidade: 1 });
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