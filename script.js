// ===== FORM CONTATO =====
document.getElementById("form-contato").addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const mensagem = document.getElementById("mensagem").value;

  window.location.href =
    `mailto:dominiquepersonalizados@gmail.com?subject=Contato&body=${encodeURIComponent(
      `Nome: ${nome}\nEmail: ${email}\n\n${mensagem}`
    )}`;
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ===== SCROLL SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    navMenu.classList.remove("active");
  });
});

// ===== TOAST =====
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== BADGE =====
function atualizarBadgeCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const badge = document.getElementById("cart-count");
  const total = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  if (total > 0) {
    badge.style.display = "inline-block";
    badge.textContent = total;
  } else {
    badge.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", atualizarBadgeCarrinho);