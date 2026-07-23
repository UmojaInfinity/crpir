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

  // Mapa interativo das unidades — hover abre o card, clique fixa
  var cena = document.getElementById('mapa-cena');
  var cardMapa = document.getElementById('mapa-card');
  if (cena && cardMapa) {
    var marcadores = Array.prototype.slice.call(cena.querySelectorAll('.mapa-marcador'));
    var itensLegenda = Array.prototype.slice.call(document.querySelectorAll('.mapa-legenda__unidade'));
    var fixado = false;
    var marcadorAtivo = null;

    function abrirCard(marcador, fixar) {
      var origem = document.getElementById(marcador.getAttribute('data-unidade'));
      if (!origem) return;
      marcadorAtivo = marcador;
      fixado = Boolean(fixar);

      var clone = origem.cloneNode(true);
      clone.removeAttribute('id');
      cardMapa.innerHTML = '';
      var fechar = document.createElement('button');
      fechar.type = 'button';
      fechar.className = 'mapa-card__fechar';
      fechar.setAttribute('aria-label', 'Fechar informações da unidade');
      fechar.textContent = '×';
      cardMapa.appendChild(fechar);
      cardMapa.appendChild(clone);

      var corRegiao = getComputedStyle(marcador).getPropertyValue('--cor-regiao');
      cardMapa.style.setProperty('--cor-card', corRegiao.trim() || 'var(--ambar)');
      cardMapa.classList.toggle('mapa-card--fixado', fixado);
      cardMapa.hidden = false;

      posicionarCard(marcador);
      marcadores.forEach(function (m) {
        m.classList.toggle('ativo', m === marcador);
        m.setAttribute('aria-expanded', String(m === marcador));
      });
      itensLegenda.forEach(function (item) {
        item.classList.toggle('ativo', item.getAttribute('data-unidade') === marcador.getAttribute('data-unidade'));
      });
    }

    function posicionarCard(marcador) {
      var cenaRect = cena.getBoundingClientRect();
      var pinRect = marcador.getBoundingClientRect();
      var px = pinRect.left - cenaRect.left + pinRect.width / 2;
      var py = pinRect.top - cenaRect.top;
      var largura = cardMapa.offsetWidth;
      var altura = cardMapa.offsetHeight;
      var folga = 18;
      var margemTela = 8;
      var larguraTela = document.documentElement.clientWidth;

      // Ao lado do pin (direita por padrão), podendo ultrapassar o mapa.
      // Só inverte para a esquerda se estourar a janela.
      var x = px + folga;
      if (cenaRect.left + x + largura > larguraTela - margemTela) {
        var xEsquerda = px - largura - folga;
        if (cenaRect.left + xEsquerda >= margemTela) {
          x = xEsquerda;
        } else {
          x = larguraTela - margemTela - largura - cenaRect.left;
        }
      }

      // Topo do card na altura do pin, levemente acima
      var y = py - 24;
      y = Math.max(-20, Math.min(y, cenaRect.height - Math.min(altura, 120)));

      cardMapa.style.setProperty('--card-x', x + 'px');
      cardMapa.style.setProperty('--card-y', y + 'px');
    }

    function fecharCard() {
      fixado = false;
      marcadorAtivo = null;
      cardMapa.hidden = true;
      cardMapa.classList.remove('mapa-card--fixado');
      marcadores.forEach(function (m) {
        m.classList.remove('ativo');
        m.setAttribute('aria-expanded', 'false');
      });
      itensLegenda.forEach(function (item) { item.classList.remove('ativo'); });
    }

    marcadores.forEach(function (marcador) {
      marcador.addEventListener('mouseenter', function () {
        if (!fixado) abrirCard(marcador, false);
      });
      marcador.addEventListener('focus', function () {
        if (!fixado) abrirCard(marcador, false);
      });
      marcador.addEventListener('click', function (evento) {
        evento.stopPropagation();
        if (fixado && marcadorAtivo === marcador) {
          fecharCard();
        } else {
          abrirCard(marcador, true);
        }
      });
    });

    cena.addEventListener('mouseleave', function () {
      if (!fixado) fecharCard();
    });

    // Menu lateral: clicar numa unidade abre o card fixado no pin correspondente
    itensLegenda.forEach(function (item) {
      item.addEventListener('click', function (evento) {
        evento.stopPropagation();
        var marcador = cena.querySelector('.mapa-marcador[data-unidade="' + item.getAttribute('data-unidade') + '"]');
        if (!marcador) return;
        if (fixado && marcadorAtivo === marcador) {
          fecharCard();
        } else {
          abrirCard(marcador, true);
        }
      });
    });

    cardMapa.addEventListener('click', function (evento) {
      evento.stopPropagation();
      if (evento.target.classList.contains('mapa-card__fechar')) fecharCard();
    });

    // Clique fora do card/pins desafixa; Esc também
    var lateral = document.querySelector('.mapa-unidades__lateral');
    if (lateral) {
      lateral.addEventListener('click', function (evento) { evento.stopPropagation(); });
    }
    document.addEventListener('click', function () {
      if (fixado) fecharCard();
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && !cardMapa.hidden) fecharCard();
    });

    // Reposiciona o card fixado se a janela mudar de tamanho
    window.addEventListener('resize', function () {
      if (!cardMapa.hidden && marcadorAtivo) posicionarCard(marcadorAtivo);
    });
  }
});
