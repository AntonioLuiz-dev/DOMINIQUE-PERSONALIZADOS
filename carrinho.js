let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

const container = document.getElementById("carrinho-itens");
const totalEl = document.getElementById("total");

function renderCarrinho() {
  container.innerHTML = "";

  if (carrinho.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio 😢</p>";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco;

    const div = document.createElement("div");
    div.className = "carrinho-item";

    div.innerHTML = `
      <img src="${item.imagem}">
      <div>
        <h4>${item.nome}</h4>
        <span>R$ ${item.preco.toFixed(2)}</span>
      </div>
      <button onclick="removerItem(${index})">❌</button>
    `;

    container.appendChild(div);
  });

  totalEl.textContent = `R$ ${total.toFixed(2)}`;
}

function removerItem(index) {
  const item = document.querySelectorAll(".carrinho-item")[index];
  item.classList.add("removendo");

  setTimeout(() => {
    carrinho.splice(index, 1);
    salvarCarrinho();
    mostrarToast("Produto removido 🗑️");
  }, 400);
}

function limparCarrinho() {
  if (!carrinho.length) {
    mostrarToast("Carrinho já está vazio 😅");
    return;
  }

  if (confirm("Deseja realmente limpar o carrinho?")) {
    carrinho = [];
    salvarCarrinho();
    mostrarToast("Carrinho limpo ✨");
  }
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderCarrinho();
}

function finalizarCompra() {
  if (!carrinho.length) {
    alert("Carrinho vazio!");
    return;
  }

  let mensagem = "Olá! Gostaria de finalizar o pedido:\n\n";
  let total = 0;

  carrinho.forEach(item => {
    mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
    total += item.preco;
  });

  mensagem += `\nTotal: R$ ${total.toFixed(2)}`;

  window.open(
    `https://wa.me/5521983394115?text=${encodeURIComponent(mensagem)}`,
    "_blank"
  );
}

function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

renderCarrinho();