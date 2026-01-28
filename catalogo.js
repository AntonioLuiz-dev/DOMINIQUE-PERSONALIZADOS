const produtos = {
  topos: [
    { id: 1, nome: "Topo de Bolo Personalizado", descricao: "Topo em papel fotográfico.", preco: 35, imagem: "img/produto-exemplo.png" }
  ],
  caixinhas: [
    { id: 2, nome: "Caixinha Personalizada", descricao: "Caixinhas decorativas.", preco: 25, imagem: "img/produto-exemplo.png" }
  ],
  kits: [
    { id: 3, nome: "Kit Festa", descricao: "Kit completo.", preco: 120, imagem: "img/produto-exemplo.png" }
  ],
  tematica: [
    { id: 4, nome: "Papelaria Temática", descricao: "Tema escolhido.", preco: 89.9, imagem: "img/produto-exemplo.png" }
  ],
  afetiva: [
    { id: 5, nome: "Cartão Afetivo", descricao: "Mensagem especial.", preco: 19.9, imagem: "img/produto-exemplo.png" }
  ]
};

const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria") || "topos";

document.getElementById("titulo-catalogo").innerText =
  categoria.charAt(0).toUpperCase() + categoria.slice(1);

const grid = document.getElementById("catalogo-grid");

produtos[categoria].forEach(produto => {
  const card = document.createElement("div");
  card.className = "produto-item";

  card.innerHTML = `
    <img src="${produto.imagem}">
    <h3>${produto.nome}</h3>
    <p>${produto.descricao}</p>
    <span class="preco">R$ ${produto.preco.toFixed(2)}</span>

    <div class="produto-botoes">
      <button class="btn-add">🛒 Carrinho</button>
      <a class="btn-whatsapp" target="_blank"
        href="https://wa.me/5521983394115?text=Olá! Tenho interesse no produto: ${produto.nome}">
        💬 WhatsApp
      </a>
    </div>
  `;

  card.querySelector(".btn-add").addEventListener("click", () => {
    adicionarCarrinho(produto, card);
  });

  grid.appendChild(card);
});

function adicionarCarrinho(produto, card) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push({ ...produto, quantidade: 1 });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  // animação no card
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