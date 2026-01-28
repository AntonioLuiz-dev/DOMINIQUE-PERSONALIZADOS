// SCROLL SUAVE
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// FORMULÁRIO
const form = document.getElementById('form-contato');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const mensagem = document.getElementById('mensagem').value;

  const assunto = encodeURIComponent('Contato - Dominique Personalizados');
  const corpo = encodeURIComponent(
    `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`
  );

  window.location.href =
    `mailto:dominiquepersonalizados@gmail.com?subject=${assunto}&body=${corpo}`;
});

// MENU HAMBURGUER
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

document.querySelectorAll('#nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});