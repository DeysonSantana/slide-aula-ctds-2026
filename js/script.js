// ==========================================================================
// AULÃO SENAC — CONTROLE DE APRESENTAÇÃO ACESSÍVEL E INTERATIVA
// ==========================================================================

let currentSlide = 0;
const slides = document.querySelectorAll('.slide-item');
const totalSlides = slides.length;

// Estado de Acessibilidade e Som
let soundEnabled = false;
let currentFontSizeIndex = 1; // 0: small, 1: normal, 2: large, 3: xlarge
const fontSizes = ['small', 'normal', 'large', 'xlarge'];

// Notas do Apresentador
const speakerNotes = [
  "Slide 1 (Abertura): Acolha os novos alunos calorosamente! Apresente o Senac como referência profissional em TI e enfatize que este Aulão inaugura a transformação das vidas deles na tecnologia.",
  "Slide 2 (Mercado de TI): Ressalte a carência gigantesca do mercado nacional (mais de 420 mil postos demandados). Mostre que faltam programadores qualificados no Brasil e que o curso os prepara para essa oportunidade.",
  "Slide 3 (Perfil Profissional): Mostre que eles não serão 'apenas um digitador de código', mas um Desenvolvedor Completo com competências de Front-end, Back-end, Mobile nativo e híbrido, Banco de Dados e Confiabilidade.",
  "Slide 4 (Visão Geral dos 6 Eixos): Explique a inteligência do encadeamento temático. Clique em qualquer eixo para demonstrar o filtro automático de UCs aos alunos!",
  "Slide 5 (Eixo 1 - Fundamentos): Destaque a UC1 (Lógica e Algoritmos) e a UC2 (Orientação a Objetos). É a base que sustenta qualquer linguagem futura (Java, Python, C#, Kotlin).",
  "Slide 6 (Eixo 2 - Design e Gestão): Software precisa encantar pessoas. Apresente UX/UI (UC5 com 96h de prototipagem no Figma), Requisitos com LGPD (UC4) e Gestão Ágil com Scrum (UC11).",
  "Slide 7 (Eixo 3 - Engenharia de Dados): Aprofunde a jornada de dados: Modelagem relacional e SQL (UC7), NoSQL com MongoDB (UC14) e Data Analytics com Python e Pandas (UC10).",
  "Slide 8 (Eixo 4 - Web Full Stack): Destaque as 216 horas de Web: Interfaces ricas no navegador com HTML5, CSS3 e JS (UC13) + Servidores e APIs REST no Back-end com MVC (UC15).",
  "Slide 9 (Eixo 4 - Desktop e Mobile): O grande diferencial multiplataforma: Sistemas corporativos desktop (UC8) e três vertentes mobile (Android nativo UC6, iOS nativo com Swift UC12 e Híbrido com Flutter/React Native UC18).",
  "Slide 10 (Eixo 5 - Infra, Qualidade e IoT): Código profissional é auditado: Versionamento com Git (UC9), Testes de Software (UC17), Segurança e Criptografia (UC16) e Sistemas Embarcados/Arduino (UC3).",
  "Slide 11 (Eixo 6 - Projeto Integrador): 120 horas de pura prática em equipe! Use as abas interativas para mostrar os dois temas geradores oficiais homologados pelo Senac.",
  "Slide 12 (Modelo Pedagógico Senac): Desmistifique a avaliação! No Senac não há notas de 0 a 10: a avaliação é por competências (A/PA/NA -> Desenvolvida). Teste o simulador de menções ao vivo com a turma!",
  "Slide 13 (Simulador de Carreiras): Chame um aluno voluntário para clicar ou tocar na tela e descobrir qual trilha (Web, Mobile, Dados, DevOps) combina com seus interesses!",
  "Slide 14 (Dicas de Ouro): Passe orientações vitais: Prática diária, criar perfil no GitHub desde já, não ter receio de perguntar e fortalecer o networking.",
  "Slide 15 (Encerramento): Celebre a turma com a chuva de confetes! Abra o microfone para dúvidas gerais sobre cronograma, laboratórios e início das aulas."
];

// Audio FX sintetizado (Web Audio API)
let audioCtx = null;
function playSlideSound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.log("Audio não inicializado.");
  }
}

// Inicialização Principal
function initPresentation() {
  loadSavedPreferences();
  updateSlideView();
  buildQuickMenu();
  setupKeyboardAndTouch();
  updateSpeakerNotes();
  initConfettiCanvas();
  setupEvaluationSimulator();
}

// Atualizar visualização do slide ativo
function updateSlideView() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  // Atualiza barra de progresso
  const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
  const progressBar = document.getElementById('slideProgressBar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  // Atualiza contadores
  const currentNumEl = document.getElementById('currentSlideNum');
  const totalNumEl = document.getElementById('totalSlidesNum');
  if (currentNumEl) currentNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
  if (totalNumEl) totalNumEl.textContent = String(totalSlides).padStart(2, '0');

  // Atualiza notas
  updateSpeakerNotes();

  // Destaque no menu
  document.querySelectorAll('.grid-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentSlide);
  });

  // Efeito sonoro
  playSlideSound();

  // Dispara confetes em momentos especiais (Slide 1 e 15)
  if (currentSlide === 0 || currentSlide === 14) {
    triggerConfetti();
  }
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlideView();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlideView();
  }
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
    currentSlide = index;
    updateSlideView();
  }
}

// ==========================================================================
// TEMA CLARO E ESCURO
// ==========================================================================
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('senac_slide_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    if (theme === 'light') {
      icon.className = 'bi bi-moon-stars-fill text-primary';
    } else {
      icon.className = 'bi bi-sun-fill text-warning';
    }
  }
}

// ==========================================================================
// ACESSIBILIDADE DE FONTES (A+ / A-)
// ==========================================================================
function changeFontSize(delta) {
  currentFontSizeIndex = Math.max(0, Math.min(fontSizes.length - 1, currentFontSizeIndex + delta));
  const newSize = fontSizes[currentFontSizeIndex];
  document.documentElement.setAttribute('data-font-size', newSize);
  localStorage.setItem('senac_slide_font_size', newSize);
}

function resetFontSize() {
  currentFontSizeIndex = 1;
  document.documentElement.setAttribute('data-font-size', 'normal');
  localStorage.setItem('senac_slide_font_size', 'normal');
}

// Carregar preferências salvas
function loadSavedPreferences() {
  const savedTheme = localStorage.getItem('senac_slide_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const savedSize = localStorage.getItem('senac_slide_font_size') || 'normal';
  currentFontSizeIndex = fontSizes.indexOf(savedSize);
  if (currentFontSizeIndex === -1) currentFontSizeIndex = 1;
  document.documentElement.setAttribute('data-font-size', savedSize);
}

// Alternar Áudio
function toggleSound() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (icon) {
    icon.className = soundEnabled ? 'bi bi-volume-up-fill text-success' : 'bi bi-volume-mute-fill text-muted';
  }
  if (soundEnabled) playSlideSound();
}

// ==========================================================================
// TOQUES NA TELA (TOUCH & SWIPE GESTURES)
// ==========================================================================
function setupKeyboardAndTouch() {
  // Teclado
  document.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (isInput) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'n') {
      toggleSpeakerNotes();
    } else if (e.key.toLowerCase() === 'm') {
      const modalEl = document.getElementById('menuModal');
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else if (e.key.toLowerCase() === 't') {
      const modalEl = document.getElementById('curriculumModal');
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  });

  // Gestos de Toque (Swipe)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const viewport = document.querySelector('.slides-viewport');
  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // Garante que é movimento horizontal e não scroll vertical
    if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      if (diffX < 0) {
        nextSlide(); // Swipe para esquerda -> próximo
      } else {
        prevSlide(); // Swipe para direita -> anterior
      }
    }
  }

  // Botões de clique
  document.getElementById('btnNext')?.addEventListener('click', nextSlide);
  document.getElementById('btnPrev')?.addEventListener('click', prevSlide);
  document.getElementById('touchNextBtn')?.addEventListener('click', nextSlide);
  document.getElementById('touchPrevBtn')?.addEventListener('click', prevSlide);
  document.getElementById('btnThemeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('btnFullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('btnSoundToggle')?.addEventListener('click', toggleSound);
  document.getElementById('btnFontIncrease')?.addEventListener('click', () => changeFontSize(1));
  document.getElementById('btnFontDecrease')?.addEventListener('click', () => changeFontSize(-1));
  document.getElementById('btnNotesToggle')?.addEventListener('click', toggleSpeakerNotes);
  document.getElementById('btnCloseNotes')?.addEventListener('click', toggleSpeakerNotes);
}

// Tela Cheia
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Erro ao ativar tela cheia: ${err.message}`);
    });
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

// Notas do Apresentador
function toggleSpeakerNotes() {
  const drawer = document.getElementById('speakerNotesDrawer');
  if (drawer) drawer.classList.toggle('open');
}

function updateSpeakerNotes() {
  const textEl = document.getElementById('speakerNotesText');
  const titleEl = document.getElementById('speakerNotesTitle');
  if (textEl && speakerNotes[currentSlide]) {
    textEl.textContent = speakerNotes[currentSlide];
  }
  if (titleEl) {
    titleEl.textContent = `Notas do Apresentador — Slide ${currentSlide + 1}`;
  }
}

// Menu de Miniaturas
function buildQuickMenu() {
  const container = document.getElementById('slideMenuGrid');
  if (!container) return;

  container.innerHTML = '';
  slides.forEach((slide, index) => {
    const titleEl = slide.querySelector('h1, h2, h3, h4, .slide-title-main');
    const title = titleEl ? titleEl.innerText.replace(/[\n\r]+/g, ' ') : `Slide ${index + 1}`;
    
    const thumb = document.createElement('div');
    thumb.className = `grid-thumb ${index === currentSlide ? 'active' : ''}`;
    thumb.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="badge bg-primary text-uppercase" style="font-size: 0.75rem;">Slide ${index + 1}</span>
      </div>
      <div style="font-size: 0.95rem; font-weight: 700; line-height: 1.3;">${title}</div>
    `;
    thumb.addEventListener('click', () => {
      goToSlide(index);
      const modalEl = document.getElementById('menuModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    });
    container.appendChild(thumb);
  });
}

// Filtrar Matriz das 19 UCs
function filterCurriculumTable(customTerm = '') {
  const searchInput = document.getElementById('ucSearchInput');
  const term = customTerm || (searchInput ? searchInput.value : '');
  if (searchInput && customTerm) searchInput.value = customTerm;

  const rows = document.querySelectorAll('#curriculumTableBody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
  });
}

function openEixoDetail(eixoNome) {
  filterCurriculumTable(eixoNome);
  const modalEl = document.getElementById('curriculumModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// ==========================================================================
// SIMULADOR DE MENÇÕES SENAC (SLIDE 12)
// ==========================================================================
let indStates = { ind1: 'A', ind2: 'A', ind3: 'A' };

function setupEvaluationSimulator() {
  document.querySelectorAll('.eval-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ind = e.target.getAttribute('data-ind');
      const val = e.target.getAttribute('data-val');
      
      // Atualiza botões do grupo
      document.querySelectorAll(`.eval-btn[data-ind="${ind}"]`).forEach(b => {
        b.classList.remove('btn-success', 'btn-warning', 'btn-danger');
        b.classList.add('btn-outline-secondary');
      });

      e.target.classList.remove('btn-outline-secondary');
      if (val === 'A') e.target.classList.add('btn-success');
      else if (val === 'PA') e.target.classList.add('btn-warning');
      else if (val === 'NA') e.target.classList.add('btn-danger');

      indStates[ind] = val;
      calculateMention();
    });
  });
}

function calculateMention() {
  const resultBox = document.getElementById('evalFinalResult');
  const explanationBox = document.getElementById('evalExplanation');
  if (!resultBox || !explanationBox) return;

  const hasNA = Object.values(indStates).includes('NA');

  if (hasNA) {
    resultBox.className = 'eval-result-badge bg-danger text-white animate__animated animate__shakeX';
    resultBox.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i> ND — Não Desenvolvida';
    explanationBox.innerHTML = '<strong>Atenção às regras do Senac:</strong> Caso o aluno obtenha <strong>Não Atendido (NA)</strong> em qualquer indicador ao final da UC, a competência fica comprometida. O aluno terá direito a <strong>Recuperação Imediata</strong> com atividades dirigidas.';
  } else {
    resultBox.className = 'eval-result-badge bg-success text-white animate__animated animate__pulse';
    resultBox.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> D — Desenvolvida (Aprovado)';
    explanationBox.innerHTML = '<strong>Parabéns!</strong> Com todos os indicadores Atendidos (A) ou Parcialmente Atendidos (PA) e presença &ge; 75%, o estudante desenvolve a competência e segue avançando na formação!';
  }
}

// ==========================================================================
// SIMULADOR DE CARREIRAS (SLIDE 13)
// ==========================================================================
function selectTrilha(trilhaKey) {
  const cards = document.querySelectorAll('.sim-card');
  cards.forEach(card => card.classList.remove('selected'));

  const selectedCard = document.getElementById(`sim-${trilhaKey}`);
  if (selectedCard) selectedCard.classList.add('selected');

  const trilhaData = {
    web: {
      title: "Trilha Web Full Stack Developer",
      desc: "Você vai dominar a criação de portais e plataformas web de alta velocidade, criando tanto a interface intuitiva no navegador (Front-End) quanto o servidor seguro que processa os dados (Back-End).",
      ucs: ["UC13 - Front-end Web (108h)", "UC15 - Back-end Web (108h)", "UC7 - Banco Relacional (72h)", "UC9 - Git & CI/CD (36h)"],
      techs: ["HTML5 / CSS3", "JavaScript", "Bootstrap", "Node.js / Java / PHP", "APIs REST", "MySQL"]
    },
    mobile: {
      title: "Trilha Mobile App Developer",
      desc: "Você criará aplicativos para os smartphones que estão na mão de bilhões de pessoas: desenvolvimento nativo para Android, iOS (Apple) e soluções híbridas modernas.",
      ucs: ["UC6 - Android Nativo (60h)", "UC12 - iOS Nativo Swift (48h)", "UC18 - Mobile Híbrido (48h)", "UC5 - UX/UI Design (96h)"],
      techs: ["Kotlin", "Android Studio", "Swift & Xcode", "Flutter / React Native", "Design Mobile"]
    },
    data: {
      title: "Trilha Engenharia & Análise de Dados",
      desc: "Você aprenderá a arquitetar bancos de dados gigantescos, extrair padrões inteligentes com Python e criar relatórios executivos para tomada de decisão em grandes corporações.",
      ucs: ["UC7 - Banco de Dados Relacional (72h)", "UC14 - Banco NoSQL (36h)", "UC10 - Análise de Dados e Python (60h)"],
      techs: ["SQL Avançado", "MongoDB / JSON", "Python", "Pandas & NumPy", "Estatística Aplicada"]
    },
    quality: {
      title: "Trilha DevOps, Testes & Cibersegurança",
      desc: "Você será o especialista responsável por garantir que o software seja inviolável a ataques hackers, livre de falhas (bugs) e com entregas contínuas em nuvem.",
      ucs: ["UC16 - Segurança de Software (60h)", "UC17 - Testes de Software (36h)", "UC9 - Versionamento e Deploy (36h)", "UC3 - Embarcados (48h)"],
      techs: ["Git / GitHub", "Testes Automatizados", "LGPD & ISO 27000", "Cybersecurity", "Arduino / IoT"]
    }
  };

  const data = trilhaData[trilhaKey];
  if (!data) return;

  const resultContainer = document.getElementById('simResultBox');
  if (resultContainer) {
    resultContainer.innerHTML = `
      <div class="card glass-card border-warning p-4 mt-3" style="animation: slideUpFade 0.4s ease;">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h4 class="text-warning fw-bold mb-0"><i class="bi bi-stars me-2"></i>${data.title}</h4>
          <span class="badge bg-warning text-dark fw-bold px-3 py-2">Trilha Ativa</span>
        </div>
        <p class="slide-subtitle mb-3">${data.desc}</p>
        <div class="row g-3">
          <div class="col-md-7">
            <span class="d-block small mb-2 fw-bold text-uppercase" style="color: var(--text-muted);">Unidades Curriculares Integradas:</span>
            <div class="d-flex flex-wrap gap-2">
              ${data.ucs.map(uc => `<span class="badge bg-primary fs-6 p-2">${uc}</span>`).join('')}
            </div>
          </div>
          <div class="col-md-5">
            <span class="d-block small mb-2 fw-bold text-uppercase" style="color: var(--text-muted);">Tecnologias que você vai dominar:</span>
            <div class="d-flex flex-wrap gap-1">
              ${data.techs.map(t => `<span class="tech-pill">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    triggerConfetti();
  }
}

// ==========================================================================
// EFEITO DE CONFETES NATIVO (CANVAS LEVE SEM LIBS EXTERNAS)
// ==========================================================================
let confettiCanvas, confettiCtx;
let particles = [];

function initConfettiCanvas() {
  confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'confettiCanvas';
  document.body.appendChild(confettiCanvas);
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
}

function resizeConfetti() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}

function triggerConfetti() {
  if (!confettiCtx) return;
  const colors = ['#f7941d', '#004587', '#00d2ff', '#10b981', '#ffffff', '#ffaa40'];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }
  if (!confettiAnimationRunning) {
    confettiAnimationRunning = true;
    requestAnimationFrame(renderConfetti);
  }
}

let confettiAnimationRunning = false;
function renderConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35; // gravidade
    p.alpha -= 0.015;
    p.rotation += p.vRot;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.alpha);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    confettiCtx.restore();

    if (p.alpha <= 0 || p.y > window.innerHeight + 20) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0) {
    requestAnimationFrame(renderConfetti);
  } else {
    confettiAnimationRunning = false;
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initPresentation);
