let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let frete = Number(localStorage.getItem("frete")) || 0;

const container = document.getElementById("carrinho-itens");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const freteResultado = document.getElementById("frete-resultado");

function renderCarrinho() {
  container.innerHTML = "";

  if (!carrinho.length) {
    container.innerHTML = "<p>Seu carrinho está vazio 😢</p>";
    if (subtotalEl) subtotalEl.textContent = "R$ 0,00";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  let subtotal = 0;

  carrinho.forEach((item, index) => {
    subtotal += item.preco;

    const div = document.createElement("div");
    div.className = "carrinho-item";

    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div>
        <h4>${item.nome}</h4>
        <span>R$ ${item.preco.toFixed(2)}</span>
      </div>
      <button onclick="removerItem(${index})">❌</button>
    `;

    container.appendChild(div);
  });

  if (subtotalEl) {
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  }

  totalEl.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
}

function removerItem(index) {
  const itens = document.querySelectorAll(".carrinho-item");
  const itemEl = itens[index];

  if (itemEl) {
    itemEl.classList.add("removendo");
  }

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
    frete = 0;
    localStorage.removeItem("frete");
    if (freteResultado) freteResultado.innerHTML = "";
    salvarCarrinho();
    mostrarToast("Carrinho limpo ✨");
  }
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  localStorage.setItem("frete", frete);
  renderCarrinho();
}

async function calcularFrete() {
  const cepInput = document.getElementById("cep");
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    mostrarToast("CEP inválido ❌");
    return;
  }

  freteResultado.innerHTML = "Calculando frete... ⏳";

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      mostrarToast("CEP não encontrado ❌");
      freteResultado.innerHTML = "";
      return;
    }

    frete = Math.random() * (40 - 18) + 18;

    freteResultado.innerHTML = `
      🚚 Frete para <strong>${data.localidade} - ${data.uf}</strong><br>
      💰 Valor: R$ ${frete.toFixed(2)}<br>
      📅 Prazo: até 7 dias úteis
    `;

    salvarCarrinho();

  } catch (error) {
    mostrarToast("Erro ao calcular frete 😢");
  }
}

function finalizarCompra() {
  if (!carrinho.length) {
    alert("Carrinho vazio!");
    return;
  }

  let msg = "Olá! Gostaria de finalizar o pedido:\n\n";
  let subtotal = 0;

  carrinho.forEach(item => {
    msg += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
    subtotal += item.preco;
  });

  msg += `\nFrete: R$ ${frete.toFixed(2)}`;
  msg += `\nTotal: R$ ${(subtotal + frete).toFixed(2)}`;

  window.open(
    `https://wa.me/5521983394115?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

renderCarrinho();