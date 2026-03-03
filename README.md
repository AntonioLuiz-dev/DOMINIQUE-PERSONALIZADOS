# Dominique Personalizados

Site de e-commerce para papelaria personalizada de festas, com catálogo dinâmico gerenciado por painel administrativo integrado ao Firebase.

---

## Estrutura do Projeto

```
dominique-personalizados/
│
├── index.html            # Página principal
├── catalogo.html         # Página do catálogo por categoria
├── catalogo.js           # Lógica do catálogo (lê do Firebase)
├── carrinho.html         # Página do carrinho de compras
├── carrinho.css          # Estilos do carrinho
├── carrinho.js           # Lógica do carrinho (PIX, cartão, frete)
├── admin.html            # Painel administrativo (protegido por login)
├── admin.css             # Estilos do painel admin
├── admin.js              # Lógica do painel admin (Firebase)
├── style.css             # Estilos globais do site
├── script.js             # Scripts gerais (menu, scroll, animações)
│
└── img/
    ├── favicon.ico
    ├── mascote.png
    ├── DOMINIQUE.png
    └── [imagens dos produtos]
```

---

## Funcionalidades

### Site principal
- Página inicial com seções: Home, Quem Somos, Instruções, Produtos, Contato
- Catálogo com 5 categorias de produtos
- Lightbox para ampliar imagens dos produtos
- Carrinho de compras com persistência em localStorage
- Pagamento via PIX (10% de desconto automático) com QR Code gerado localmente
- Pagamento via Cartão de Crédito (redireciona para Mercado Pago)
- Cálculo de frete via API ViaCEP
- Botões flutuantes de Instagram e WhatsApp
- Menu responsivo com hambúrguer no mobile
- Animações de entrada na seção "Quem Somos"
- Scroll suave customizado

### Painel Administrativo (/admin.html)
- Login seguro com e-mail e senha via Firebase Authentication
- Gerenciar Catálogo: visualizar, editar e remover produtos
- Adicionar Produto: formulário completo com preview de imagem
- Imagem por caminho local (img/) ou URL externa
- Filtro por categoria no catálogo admin
- Estatísticas: contador de visitas e total de produtos
- Todas as alterações refletem instantaneamente no site para todos os visitantes

---

## Firebase — Configuração

O projeto usa dois serviços do Firebase (plano gratuito Spark):

| Serviço | Uso |
|---|---|
| Firestore Database | Armazena os produtos do catálogo |
| Authentication | Login do painel administrativo |

### Credenciais (já configuradas em admin.js e catalogo.js)

```js
const firebaseConfig = {
  apiKey: "AIzaSyDneS7ceP6ezPiZIec7NKSUFGMBHBctGj8",
  authDomain: "dominique-personalizados.firebaseapp.com",
  projectId: "dominique-personalizados",
  storageBucket: "dominique-personalizados.firebasestorage.app",
  messagingSenderId: "265740517102",
  appId: "1:265740517102:web:c8058de40877e94aeffdff"
};
```

### Regras do Firestore
Em Firebase Console > Firestore > Regras, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /produtos/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Categorias do Catálogo

| Chave | Nome exibido |
|---|---|
| topos | Topos de Bolo |
| tematica | Kit Festa |
| afetiva | Papelaria Afetiva |
| brindes | Brindes Personalizados |
| centros | Centros de Mesa |

---

## Como Adicionar Produtos

**Pelo Painel Admin (recomendado):**
1. Acesse seusite.com/admin.html
2. Faça login com seu e-mail e senha
3. Clique em "Adicionar Produto"
4. Preencha os campos e salve
5. O produto aparece no catálogo imediatamente para todos

**Para a imagem, você tem duas opções:**
- Pasta img/ — adicione o arquivo na pasta img/ do projeto, faça deploy e informe o nome (ex: img/produto.jpg)
- URL externa — hospede a imagem gratuitamente no Imgur (imgur.com) ou Google Drive e cole o link direto

---

## Formulário de Contato — EmailJS

O formulário "Fale Conosco" envia a mensagem diretamente para o Gmail e abre o WhatsApp simultaneamente, sem redirecionar o cliente para outra página.

Credenciais já configuradas em `script.js`:

| Variável | Valor |
|---|---|
| EMAILJS_SERVICE_ID | service_xryre6z |
| EMAILJS_TEMPLATE_ID | template_08e99qk |
| EMAILJS_PUBLIC_KEY | CkejzIdfj3Y78LCnH |
| Gmail conectado | dominiquepersonalizados@gmail.com |

Se precisar reconfigurar, acesse emailjs.com > Email Services.
Limite do plano gratuito: **200 emails/mês**.

---

## Configuração do Pagamento

No arquivo carrinho.js, no topo:

```js
const CHAVE_PIX             = "000.000.000-00"; // Substitua pelo seu CPF
const LINK_PAGAMENTO_CARTAO = "https://mpago.la/..."; // Link do Mercado Pago
const DESCONTO_PIX          = 0.10; // 10% de desconto no PIX
```

**Como criar o link do Mercado Pago:**
1. Acesse mercadopago.com.br
2. Va em Cobrar > Link de pagamento
3. Crie o link e cole em LINK_PAGAMENTO_CARTAO

---

## Deploy no Vercel

1. Suba o projeto para um repositório no GitHub
2. Acesse vercel.com e conecte o repositório
3. Clique em Deploy — o Vercel detecta automaticamente que é um site estático
4. A cada git push o site é atualizado automaticamente

O Firebase é independente da hospedagem. Voce pode trocar de provedor a qualquer momento sem perder os produtos cadastrados.

---

## Logotipo no Painel Admin

O painel exibe a imagem ./img/mascote.png na tela de login e na sidebar. Para usar uma foto ou logo diferente, troque o atributo src nas tags dentro de admin.html:

```html
<!-- tela de login -->
<img id="logo-admin-img" src="./img/SUA-IMAGEM.png" ...>

<!-- sidebar -->
<img id="sidebar-logo-img" src="./img/SUA-IMAGEM.png" ...>
```

---

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (ES Modules)
- Firebase v12 — Firestore + Authentication
- EmailJS v4 — Envio de email pelo formulário de contato
- Mercado Pago — Link de pagamento por cartão
- ViaCEP — Consulta de CEP para frete
- QRCode.js — Geração de QR Code do PIX
- Font Awesome 6 — Ícones
- Google Fonts (Poppins) + CDNFonts (Magic Donut, A Little Sunshine)
- Vercel — Hospedagem

---

## Contato

- Instagram: @dominiquepersonalizados
- WhatsApp: (21) 98339-4115
- Desenvolvido por: antonioluiz.dev@outlook.com