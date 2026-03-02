// ===== FORM CONTATO =====
document.getElementById("form-contato").addEventListener("submit", e => {
  e.preventDefault();
  const nome     = document.getElementById("nome").value;
  const email    = document.getElementById("email").value;
  const mensagem = document.getElementById("mensagem").value;

  window.location.href =
    `mailto:dominiquepersonalizados@gmail.com?subject=Contato&body=${encodeURIComponent(
      `Nome: ${nome}\nEmail: ${email}\n\n${mensagem}`
    )}`;
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById("menu-toggle");
const navMenu    = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ===== SCROLL SUAVE — implementação própria com easing, ignora qualquer CSS =====
function scrollSuave(destino, duracao) {
  const inicio    = window.pageYOffset;
  const distancia = destino - inicio;
  let startTime   = null;

  // Função de easing (ease-in-out cúbico)
  function easing(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function passo(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso  = Math.min((timestamp - startTime) / duracao, 1);
    const easedPos   = easing(progresso);
    window.scrollTo(0, inicio + distancia * easedPos);

    if (progresso < 1) {
      requestAnimationFrame(passo);
    }
  }

  requestAnimationFrame(passo);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const href   = this.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    navMenu.classList.remove("active");

    const headerHeight = document.querySelector("header")?.offsetHeight || 80;
    const destino      = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

    scrollSuave(destino, 800); // 800ms de duração
  });
});

// ===== TOAST =====
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== BADGE DO CARRINHO =====
function atualizarBadgeCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const badge    = document.getElementById("cart-count");
  if (!badge) return;
  const total = carrinho.reduce((acc, i) => acc + (i.quantidade || 1), 0);
  badge.style.display = total > 0 ? "inline-block" : "none";
  badge.textContent   = total;
}

// ===== ANIMAÇÃO DE ENTRADA — FOTO E TEXTO "QUEM SOMOS" =====
function iniciarAnimacaoSobre() {
  const sobreImagem = document.querySelector(".sobre-imagem");
  const sobreTexto  = document.querySelector(".sobre-texto");
  if (!sobreImagem) return;

  sobreImagem.style.opacity    = "0";
  sobreImagem.style.transform  = "translateX(50px)";
  sobreImagem.style.transition = "opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)";

  if (sobreTexto) {
    sobreTexto.style.opacity    = "0";
    sobreTexto.style.transform  = "translateX(-50px)";
    sobreTexto.style.transition = "opacity 0.85s cubic-bezier(0.22,1,0.36,1) 0.12s, transform 0.85s cubic-bezier(0.22,1,0.36,1) 0.12s";
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          sobreImagem.style.opacity   = "1";
          sobreImagem.style.transform = "translateX(0)";
          if (sobreTexto) {
            sobreTexto.style.opacity   = "1";
            sobreTexto.style.transform = "translateX(0)";
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const secaoSobre = document.getElementById("sobre");
  if (secaoSobre) observer.observe(secaoSobre);
}

// ===== CONTADOR DE VISITAS (discreto no footer) =====
function iniciarContadorVisitas() {
  let visitas = parseInt(localStorage.getItem("contadorVisitas") || "0");

  if (!sessionStorage.getItem("visitaContada")) {
    visitas++;
    localStorage.setItem("contadorVisitas", visitas);
    sessionStorage.setItem("visitaContada", "true");
  }

  const footer = document.querySelector("footer");
  if (!footer) return;

  const contador     = document.createElement("p");
  contador.id        = "visit-counter";
  contador.innerHTML = `👁️ ${visitas.toLocaleString("pt-BR")} visita${visitas !== 1 ? "s" : ""}`;
  contador.title     = "Contador de visitas";
  footer.appendChild(contador);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  atualizarBadgeCarrinho();
  iniciarAnimacaoSobre();
  iniciarContadorVisitas();
});