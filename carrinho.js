// ============================================================
// ⚙️  CONFIGURAÇÕES — edite aqui suas informações de pagamento
// ============================================================
const CHAVE_PIX          = "145.602.617-84";          // ← Substitua pelo seu CPF (chave PIX)
const CHAVE_PIX_EXIBIDA  = "145.602.617-84";          // ← Como exibir ao usuário (mesma coisa)
const LINK_PAGAMENTO_CARTAO = "link.mercadopago.com.br/dominiquepersonaliza"; // ← Seu link real do Mercado Pago
const DESCONTO_PIX       = 0.10;                      // 10% de desconto no PIX
// ============================================================

let carrinho        = JSON.parse(localStorage.getItem("carrinho")) || [];
let frete           = Number(localStorage.getItem("frete")) || 0;
let metodoPagamento = null;
let qrInstance      = null; // guarda instância do QRCode para recriar se necessário

const container      = document.getElementById("carrinho-itens");
const subtotalEl     = document.getElementById("subtotal");
const totalEl        = document.getElementById("total");
const freteResultado = document.getElementById("frete-resultado");

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────
function renderCarrinho() {
  container.innerHTML = "";

  if (!carrinho.length) {
    container.innerHTML = "<p style='text-align:center;padding:20px;color:#aaa;'>Seu carrinho está vazio 😢</p>";
    if (subtotalEl) subtotalEl.textContent = "R$ 0,00";
    totalEl.textContent = "R$ 0,00";
    document.getElementById("pagamento-box").style.display = "none";
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
      <button onclick="removerItem(${index})" title="Remover">❌</button>
    `;
    container.appendChild(div);
  });

  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  atualizarTotalExibido(subtotal);

  document.getElementById("pagamento-box").style.display = "block";

  if (metodoPagamento) atualizarTotaisPagamento(subtotal);
}

function atualizarTotalExibido(subtotal) {
  const base = subtotal + frete;
  if (metodoPagamento === "pix") {
    const comDesconto = base * (1 - DESCONTO_PIX);
    totalEl.textContent = `R$ ${comDesconto.toFixed(2)} (PIX com 10% off)`;
  } else {
    totalEl.textContent = `R$ ${base.toFixed(2)}`;
  }
}

// ─────────────────────────────────────────
// REMOVER / LIMPAR
// ─────────────────────────────────────────
function removerItem(index) {
  const itens = document.querySelectorAll(".carrinho-item");
  if (itens[index]) itens[index].classList.add("removendo");

  setTimeout(() => {
    carrinho.splice(index, 1);
    salvarCarrinho();
    mostrarToast("Produto removido 🗑️");
  }, 400);
}

function limparCarrinho() {
  if (!carrinho.length) { mostrarToast("Carrinho já está vazio 😅"); return; }

  if (confirm("Deseja realmente limpar o carrinho?")) {
    carrinho = [];
    frete = 0;
    metodoPagamento = null;
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

// ─────────────────────────────────────────
// FRETE
// ─────────────────────────────────────────
async function calcularFrete() {
  const cepInput = document.getElementById("cep");
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) { mostrarToast("CEP inválido ❌"); return; }

  freteResultado.innerHTML = "Calculando frete... ⏳";

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      mostrarToast("CEP não encontrado ❌");
      freteResultado.innerHTML = "";
      return;
    }

    frete = parseFloat((Math.random() * (40 - 18) + 18).toFixed(2));

    freteResultado.innerHTML = `
      🚚 Frete para <strong>${data.localidade} - ${data.uf}</strong><br>
      💰 Valor: R$ ${frete.toFixed(2)}<br>
      📅 Prazo: até 7 dias úteis
    `;

    salvarCarrinho();

  } catch {
    mostrarToast("Erro ao calcular frete 😢");
  }
}

// ─────────────────────────────────────────
// PAGAMENTO
// ─────────────────────────────────────────
function selecionarPagamento(metodo) {
  metodoPagamento = metodo;

  document.querySelectorAll(".opcao-pagamento").forEach(btn => btn.classList.remove("ativo"));
  document.getElementById(`btn-${metodo}`).classList.add("ativo");

  const subtotal = carrinho.reduce((acc, i) => acc + i.preco, 0);
  atualizarTotaisPagamento(subtotal);

  if (metodo === "pix") {
    document.getElementById("pix-detalhes").style.display = "block";
    document.getElementById("cartao-detalhes").style.display = "none";
    gerarQRCode(subtotal);
  } else {
    document.getElementById("cartao-detalhes").style.display = "block";
    document.getElementById("pix-detalhes").style.display = "none";
  }
}

function atualizarTotaisPagamento(subtotal) {
  const totalComFrete = subtotal + frete;

  if (metodoPagamento === "pix") {
    const totalPix = totalComFrete * (1 - DESCONTO_PIX);
    document.getElementById("total-pix").textContent = `R$ ${totalPix.toFixed(2)}`;
    totalEl.textContent = `R$ ${totalPix.toFixed(2)} (PIX com 10% off)`;
  } else if (metodoPagamento === "cartao") {
    document.getElementById("total-cartao-val").textContent = `R$ ${totalComFrete.toFixed(2)}`;
    totalEl.textContent = `R$ ${totalComFrete.toFixed(2)}`;
  }
}

// ─────────────────────────────────────────
// QR CODE — gerado localmente (qrcodejs)
// ─────────────────────────────────────────
function gerarQRCode(subtotal) {
  const totalPix = (subtotal + frete) * (1 - DESCONTO_PIX);

  // Texto que vai no QR: chave pix + valor (você pode usar o payload EMV completo se quiser)
  const textoQR = CHAVE_PIX;

  // Mostra a chave formatada
  document.getElementById("pix-chave-texto").textContent = CHAVE_PIX_EXIBIDA;

  const container = document.getElementById("qr-code-container");
  container.innerHTML = ""; // limpa QR anterior

  // Cria QR Code via biblioteca (canvas, 100% local)
  new QRCode(container, {
    text: textoQR,
    width: 190,
    height: 190,
    colorDark: "#D96C8A",   // rosa da marca
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ─────────────────────────────────────────
// COPIAR CHAVE PIX
// ─────────────────────────────────────────
function copiarChavePix() {
  const chave = CHAVE_PIX;

  const copiar = () => {
    mostrarToast("Chave PIX copiada! 📋✅");
    const btn = document.querySelector(".btn-copiar");
    if (btn) { btn.textContent = "✅ Copiado!"; setTimeout(() => btn.textContent = "📋 Copiar", 2500); }
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(chave).then(copiar).catch(() => copiarFallback(chave, copiar));
  } else {
    copiarFallback(chave, copiar);
  }
}

function copiarFallback(texto, callback) {
  const el = document.createElement("textarea");
  el.value = texto;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  callback();
}

// ─────────────────────────────────────────
// FINALIZAR COMPRA
// ─────────────────────────────────────────
function finalizarCompra() {
  if (!carrinho.length) { alert("Carrinho vazio!"); return; }

  if (!metodoPagamento) {
    mostrarToast("Selecione uma forma de pagamento 💳");
    document.getElementById("pagamento-box").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const subtotal = carrinho.reduce((acc, i) => acc + i.preco, 0);
  const totalComFrete = subtotal + frete;

  if (metodoPagamento === "pix") {
    const totalPix    = totalComFrete * (1 - DESCONTO_PIX);
    const economizado = totalComFrete - totalPix;

    let msg = "Olá! Vou pagar via PIX e gostaria de finalizar o pedido:\n\n";
    carrinho.forEach(item => { msg += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`; });
    msg += `\nFrete: R$ ${frete.toFixed(2)}`;
    msg += `\n✅ Desconto PIX (10%): -R$ ${economizado.toFixed(2)}`;
    msg += `\n💰 Total com PIX: R$ ${totalPix.toFixed(2)}`;
    msg += `\n\nChave PIX (CPF): ${CHAVE_PIX}`;

    window.open(`https://wa.me/5521983394115?text=${encodeURIComponent(msg)}`, "_blank");

  } else if (metodoPagamento === "cartao") {
    // Garante que o link tem https://
    let link = LINK_PAGAMENTO_CARTAO.trim();
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      link = "https://" + link;
    }
    window.open(link, "_blank");
  }
}

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ─────────────────────────────────────────
// FORMATAÇÃO CEP
// ─────────────────────────────────────────
document.getElementById("cep")?.addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5, 8);
  this.value = v;
});

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
renderCarrinho();