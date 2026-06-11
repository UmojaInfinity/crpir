// CRPIR — interações do site institucional

document.addEventListener('DOMContentLoaded', function () {
  // Menu móvel
  var btnMenu = document.querySelector('.cabecalho__menu-btn');
  var nav = document.getElementById('menu-principal');

  btnMenu.addEventListener('click', function () {
    var aberto = nav.classList.toggle('aberto');
    btnMenu.setAttribute('aria-expanded', String(aberto));
    btnMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('aberto');
      btnMenu.setAttribute('aria-expanded', 'false');
    });
  });

  // Acessibilidade: tamanho da fonte (persistido entre visitas)
  var escala = parseFloat(localStorage.getItem('crpir-escala-fonte') || '1');
  aplicarEscala(escala);

  document.getElementById('btn-fonte-mais').addEventListener('click', function () {
    escala = Math.min(escala + 0.1, 1.4);
    aplicarEscala(escala);
  });
  document.getElementById('btn-fonte-menos').addEventListener('click', function () {
    escala = Math.max(escala - 0.1, 0.8);
    aplicarEscala(escala);
  });

  function aplicarEscala(valor) {
    document.body.style.setProperty('--escala-fonte', valor);
    localStorage.setItem('crpir-escala-fonte', String(valor));
  }

  // Acessibilidade: alto contraste (persistido entre visitas)
  var btnContraste = document.getElementById('btn-contraste');
  if (localStorage.getItem('crpir-alto-contraste') === 'sim') {
    document.body.classList.add('alto-contraste');
    btnContraste.setAttribute('aria-pressed', 'true');
  }
  btnContraste.addEventListener('click', function () {
    var ativo = document.body.classList.toggle('alto-contraste');
    btnContraste.setAttribute('aria-pressed', String(ativo));
    localStorage.setItem('crpir-alto-contraste', ativo ? 'sim' : 'não');
  });

  // Revelação ao rolar — respeita prefers-reduced-motion (CSS já neutraliza)
  var alvos = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    alvos.forEach(function (el) { observador.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('visivel'); });
  }

  // Ano atual no rodapé
  var ano = document.getElementById('ano-atual');
  if (ano) ano.textContent = String(new Date().getFullYear());
});
