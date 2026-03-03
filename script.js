// ===== FORM CONTATO =====
// EmailJS — substitua os valores abaixo com os seus (veja instrucoes no README)
const EMAILJS_SERVICE_ID  = "service_xryre6z";
const EMAILJS_TEMPLATE_ID = "template_08e99qk";
const EMAILJS_PUBLIC_KEY  = "CkejzIdfj3Y78LCnH";

document.getElementById("form-contato").addEventListener("submit", async function(e) {
  e.preventDefault();

  const nome     = document.getElementById("nome").value.trim();
  const email    = document.getElementById("email").value.trim();
  const mensagem = document.getElementById("mensagem").value.trim();
  const btn      = this.querySelector("button[type='submit']");

  if (!nome || !email || !mensagem) return;

  btn.textContent = "Enviando...";
  btn.disabled    = true;

  let emailOk = false;

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name:  nome,
        from_email: email,
        message:    mensagem,
        reply_to:   email
      },
      EMAILJS_PUBLIC_KEY
    );
    emailOk = true;
  } catch (err) {
    console.warn("EmailJS erro:", err);
  }

  // Abre WhatsApp em nova aba simultaneamente
  const textoWpp = "Ola! Me chamo " + nome + " (" + email + ").\n\n" + mensagem;
  window.open("https://wa.me/5521983394115?text=" + encodeURIComponent(textoWpp), "_blank");

  if (emailOk) {
    mostrarToast("Mensagem enviada com sucesso! Em breve entraremos em contato 💖");
  } else {
    mostrarToast("Mensagem enviada pelo WhatsApp! 💬");
  }

  this.reset();
  btn.textContent = "Enviar mensagem";
  btn.disabled    = false;
});


// ===== MENU MOBILE =====
const menuToggle = document.getElementById("menu-toggle");
const navMenu    = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ===== SCROLL SUAVE =====
function scrollSuave(destino, duracao) {
  const inicio    = window.pageYOffset;
  const distancia = destino - inicio;
  let startTime   = null;

  function easing(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function passo(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = Math.min((timestamp - startTime) / duracao, 1);
    window.scrollTo(0, inicio + distancia * easing(progresso));
    if (progresso < 1) requestAnimationFrame(passo);
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
    scrollSuave(destino, 800);
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  atualizarBadgeCarrinho();
  iniciarAnimacaoSobre();
});