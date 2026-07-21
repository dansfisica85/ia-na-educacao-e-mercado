(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const normalize = (value = "") => value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

  // Navegação e entrada progressiva
  const menuButton = $(".menu-toggle");
  const navigation = $(".primary-nav");
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    navigation.classList.toggle("open", !open);
  });
  $$(".primary-nav a").forEach(link => link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    $$(".reveal").forEach(item => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -35px" });
    $$(".reveal").forEach(item => observer.observe(item));
  }

  // Enquete do mito
  const mythPoll = $("#myth-poll");
  const mythResult = $("#myth-result");
  mythPoll?.addEventListener("submit", event => {
    event.preventDefault();
    const answer = new FormData(mythPoll).get("mito");
    if (!answer) {
      mythPoll.querySelector("input")?.focus();
      return;
    }
    mythResult.removeAttribute("inert");
    mythResult.classList.add("revealed");
    const title = $("h3", mythResult);
    if (answer === "b") title.textContent = "Boa leitura: um caso real virou uma generalização falsa.";
    else title.textContent = "A nuance importa: a resposta mais precisa é B.";
    mythResult.focus({ preventScroll: true });
    mythResult.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });

  // Diagnóstico de prontidão
  const readinessForm = $("#readiness-form");
  const readinessScore = $("#readiness-score");
  const readinessLabel = $("#readiness-label");
  const readinessNext = $("#readiness-next");
  const readinessStages = [
    { max: 3, label: "Estágio: explorar com segurança", next: "Próximo passo: escolha um problema concreto e forme um pequeno grupo responsável." },
    { max: 7, label: "Estágio: preparar o terreno", next: "Próximo passo: alinhe formação, política provisória e uma métrica de aprendizagem." },
    { max: 11, label: "Estágio: pilotar com evidência", next: "Próximo passo: compare antes e depois, audite amostras e documente incidentes." },
    { max: 15, label: "Estágio: consolidar e governar", next: "Próximo passo: escale somente o que provou valor, equidade e segurança." }
  ];
  const updateReadiness = () => {
    const sliders = $$("input[type='range']", readinessForm);
    const score = sliders.reduce((sum, slider) => sum + Number(slider.value), 0);
    sliders.forEach(slider => { slider.nextElementSibling.value = slider.value; });
    const stage = readinessStages.find(item => score <= item.max) || readinessStages.at(-1);
    readinessScore.textContent = `${score}/15`;
    readinessLabel.textContent = stage.label;
    readinessNext.textContent = stage.next;
  };
  readinessForm?.addEventListener("input", updateReadiness);
  updateReadiness();

  // Explorador de profissões
  const professions = [
    { name: "Professor(a) e designer instrucional", ai: "Planejamento inicial, adaptação por nível, exemplos, rubricas, feedback formativo e acessibilidade.", human: "Intenção pedagógica, diagnóstico da turma, vínculo, motivação, inclusão e avaliação autêntica.", risk: "Alucinação, dependência cognitiva, viés cultural, dados de menores e avaliação automática sem contexto." },
    { name: "Médico(a) e profissional de enfermagem", ai: "Resumo de prontuário, documentação, triagem de imagens, alertas e busca de evidências.", human: "Anamnese, exame, decisão clínica, empatia, comunicação de risco e consentimento.", risk: "Falso positivo ou negativo, viés populacional, privacidade e automação acrítica." },
    { name: "Farmacêutico(a) e pesquisador(a) biomédico(a)", ai: "Revisão de literatura, priorização de alvos, desenho molecular, análise de ensaios e farmacovigilância.", human: "Hipótese plausível, validação laboratorial e clínica, segurança e interpretação causal.", risk: "Referências inventadas, dados frágeis, uso dual e confundir previsão com eficácia." },
    { name: "Advogado(a), juiz(a) e compliance", ai: "Pesquisa inicial, comparação de contratos, organização de provas, cronologias e minutas.", human: "Estratégia, interpretação, devido processo, negociação, proporcionalidade e responsabilidade.", risk: "Jurisprudência inventada, sigilo, viés, norma desatualizada e decisão automatizada sobre direitos." },
    { name: "Contador(a) e auditor(a)", ai: "Conciliação, classificação, detecção de anomalias, leitura de documentos e relatórios preliminares.", human: "Materialidade, ceticismo, controles, explicação ao cliente e assinatura responsável.", risk: "Fraude não detectada, falsa precisão, trilha incompleta e exposição de dados financeiros." },
    { name: "Analista financeiro(a) e gestor(a) de risco", ai: "Cenários, extração de dados, síntese de resultados, monitoramento e testes de sensibilidade.", human: "Premissas, contexto macroeconômico, dever fiduciário, apetite de risco e decisão sob incerteza.", risk: "Dados defasados, recomendações sem adequação e excesso de confiança." },
    { name: "Marketing e comunicação", ai: "Pesquisa de público, variações de texto, personalização, calendário, SEO e testes criativos.", human: "Posicionamento, verdade da marca, sensibilidade cultural, intenção e relacionamento.", risk: "Conteúdo genérico, manipulação, discriminação, copyright e desinformação." },
    { name: "Jornalista e produtor(a) de conteúdo", ai: "Transcrição, tradução, pesquisa preliminar, análise de documentos e formatos derivados.", human: "Apuração, checagem, proteção de fontes, interesse público e responsabilidade editorial.", risk: "Fontes inventadas, deepfakes, difamação e perda de cadeia de custódia." },
    { name: "Designer e profissional audiovisual", ai: "Ideação, moodboards, protótipos, variações, restauração, legendas e pré-visualização.", human: "Direção criativa, gosto, narrativa, originalidade, consentimento e negociação.", risk: "Direitos autorais e de imagem, apropriação de estilo, estereótipos e autenticidade." },
    { name: "Desenvolvedor(a) de software e dados", ai: "Rascunho de código, testes, documentação, refatoração, consultas e depuração.", human: "Arquitetura, modelagem do problema, revisão, segurança, observabilidade e decisão de produto.", risk: "Vulnerabilidades, licenças, código plausível porém errado e vazamento de segredos." },
    { name: "Analista de cibersegurança", ai: "Correlação de alertas, consulta de logs, inteligência de ameaças, simulação e resposta inicial.", human: "Priorização, raciocínio adversarial, contenção, comunicação e decisão de risco.", risk: "Uso dual, falsos alertas, envenenamento de dados e agentes com privilégios excessivos." },
    { name: "Engenheiro(a) industrial e manutenção", ai: "Projeto generativo, manutenção preditiva, inspeção visual, simulação e instruções em campo.", human: "Tolerâncias, segurança, experiência tácita, validação física e autorização operacional.", risk: "Sensor defeituoso, gêmeo digital divergente e recomendação fora do contexto." },
    { name: "Arquitetura, engenharia civil e obras", ai: "Estudos preliminares, compatibilização, estimativa, cronograma, visualização e conflitos.", human: "Uso do espaço, normas locais, visita técnica, impacto ambiental e responsabilidade técnica.", risk: "Norma desatualizada, erro geométrico e imagem bonita confundida com projeto executável." },
    { name: "Agronomia e produção agrícola", ai: "Previsão, reconhecimento de pragas, irrigação, aplicação localizada e gestão de insumos.", human: "Leitura de microclima e solo, manejo integrado, decisão econômica e conhecimento local.", risk: "Sensores incompletos, recomendação inadequada ao bioma, dependência de plataforma e conectividade." },
    { name: "RH e recrutamento", ai: "Descrição de vaga, busca, triagem assistida, competências e aprendizagem personalizada.", human: "Entrevista, potencial, contexto de carreira, inclusão, negociação e cultura.", risk: "Discriminação histórica, exclusão por proxy, opacidade, vigilância e falta de contestação." },
    { name: "Gestão de projetos e produto", ai: "Síntese de requisitos, atas, backlog, cenários, riscos, documentação e protótipos.", human: "Prioridade, valor, trade-offs, escuta, alinhamento e decisão em ambiente ambíguo.", risk: "Falsa precisão, automatizar requisito ruim, ignorar dissenso e expor informação estratégica." },
    { name: "Vendas e atendimento ao cliente", ai: "Resumo de conta, personalização, previsão, preparação de reunião e respostas recorrentes.", human: "Escuta, confiança, negociação, leitura emocional, exceção e recuperação de relacionamento.", risk: "Perfilamento invasivo, promessa errada, contato artificial excessivo e uso indevido de dados." },
    { name: "Logística e cadeia de suprimentos", ai: "Previsão de demanda, rotas, estoque, documentos, cenários e alerta de interrupção.", human: "Resiliência, decisão multicritério, negociação, conhecimento operacional e resposta à crise.", risk: "Falha em evento raro, otimização que sacrifica segurança e baixa qualidade de dados." },
    { name: "Serviço público e assistência social", ai: "Busca normativa, resumo de casos, tradução, triagem administrativa e comunicação acessível.", human: "Direitos, contexto social, empatia, discricionariedade responsável e prestação de contas.", risk: "Vigilância, discriminação, negação automatizada, dados sensíveis e ausência de devido processo." },
    { name: "Pesquisa científica", ai: "Busca e classificação de literatura, código, exploração de hipóteses e desenho preliminar.", human: "Pergunta relevante, método, inferência causal, reprodução, revisão por pares e integridade.", risk: "Citações falsas, p-hacking acelerado, dados sintéticos inadequados e resultados irreprodutíveis." }
  ];
  const professionSelect = $("#profession-select");
  const professionOutput = $("#profession-output");
  let professionIndex = 0;
  professions.forEach((profession, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = profession.name;
    professionSelect?.append(option);
  });
  const renderProfession = index => {
    professionIndex = (index + professions.length) % professions.length;
    const profession = professions[professionIndex];
    professionSelect.value = String(professionIndex);
    $("#profession-count").textContent = `${professionIndex + 1} de ${professions.length}`;
    professionOutput.innerHTML = `
      <article><span>01</span><h4>IA potencializa</h4><p>${escapeHTML(profession.ai)}</p></article>
      <article><span>02</span><h4>Humano crítico</h4><p>${escapeHTML(profession.human)}</p></article>
      <article><span>03</span><h4>Risco e cuidado</h4><p>${escapeHTML(profession.risk)}</p></article>`;
  };
  professionSelect?.addEventListener("change", () => renderProfession(Number(professionSelect.value)));
  $("#profession-prev")?.addEventListener("click", () => renderProfession(professionIndex - 1));
  $("#profession-next")?.addEventListener("click", () => renderProfession(professionIndex + 1));
  renderProfession(0);

  // Oficina com persistência local
  const workshopForm = $("#workshop-form");
  const saveStatus = $("#save-status");
  const workshopKey = "ia-educacao-oficina-v1";
  let saveTimer;
  const serializeWorkshop = () => Object.fromEntries(new FormData(workshopForm).entries());
  const saveWorkshop = () => {
    try {
      localStorage.setItem(workshopKey, JSON.stringify(serializeWorkshop()));
      saveStatus.textContent = `Rascunho salvo neste navegador às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`;
    } catch {
      saveStatus.textContent = "O navegador bloqueou o salvamento local; use “Exportar roteiro” para preservar o texto.";
    }
  };
  try {
    const saved = JSON.parse(localStorage.getItem(workshopKey) || "null");
    if (saved) Object.entries(saved).forEach(([name, value]) => {
      const field = workshopForm.elements.namedItem(name);
      if (field) field.value = value;
    });
  } catch { localStorage.removeItem(workshopKey); }
  workshopForm?.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWorkshop, 350);
  });
  workshopForm?.addEventListener("reset", () => {
    setTimeout(() => {
      localStorage.removeItem(workshopKey);
      saveStatus.textContent = "Rascunho limpo. O próximo texto será salvo somente neste navegador.";
    });
  });
  $("#export-workshop")?.addEventListener("click", () => {
    const data = serializeWorkshop();
    const labels = { entrega: "ENTREGA OU PROBLEMA", qualidade: "CRITÉRIO DE QUALIDADE", acelerar: "01 — ACELERAR", copilotar: "02 — COPILOTAR", humano: "03 — PRESERVAR HUMANO", evidencias: "EVIDÊNCIAS E SEGURANÇA", experimento: "EXPERIMENTO DA PRÓXIMA SEMANA" };
    const text = ["OFICINA — REDESENHO DE TAREFA COM IA", `Exportado em ${new Date().toLocaleString("pt-BR")}`, "", ...Object.entries(labels).flatMap(([key, label]) => [label, data[key] || "(não preenchido)", ""]), "Princípio: IA apoia; uma pessoa identificável responde pelo resultado."].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "oficina-redesenho-tarefa-ia.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  $("#print-workshop")?.addEventListener("click", () => window.print());

  // Catálogo de ferramentas
  const catalogState = { data: null, theme: "todos", access: "todos", query: "", visible: 12 };
  const toolGrid = $("#tool-grid");
  const themeFilter = $("#theme-filter");
  const accessFilter = $("#access-filter");
  const searchInput = $("#tool-search");
  const loadMore = $("#load-more");
  const isFree = access => /gratuit|freemium|free|basic/i.test(access);

  const filteredTools = () => catalogState.data.ferramentas.filter(tool => {
    const themeMatch = catalogState.theme === "todos" || tool.tema === catalogState.theme;
    const accessMatch = catalogState.access === "todos" || (catalogState.access === "gratuito" ? isFree(tool.acesso) : !isFree(tool.acesso));
    const haystack = normalize([tool.nome, tool.descricao, tool.acesso, ...(tool.profissoes_uso_principal || [])].join(" "));
    return themeMatch && accessMatch && haystack.includes(normalize(catalogState.query));
  });
  const renderCatalog = () => {
    if (!catalogState.data) return;
    const tools = filteredTools();
    const visible = tools.slice(0, catalogState.visible);
    const themes = Object.fromEntries(catalogState.data.temas.map(theme => [theme.id, theme]));
    $("#catalog-count").textContent = `${tools.length} ${tools.length === 1 ? "ferramenta" : "ferramentas"}`;
    const activeTheme = themes[catalogState.theme];
    $("#catalog-theme-description").textContent = activeTheme ? activeTheme.descricao : "Explore o catálogo completo por tema, atividade ou profissão.";
    toolGrid.innerHTML = visible.length ? visible.map(tool => `
      <article class="tool-card">
        <div class="tool-card-head"><h3>${escapeHTML(tool.nome)}</h3><span class="tool-number">#${String(tool.id).padStart(2, "0")}</span></div>
        <span class="tool-theme">${escapeHTML(themes[tool.tema]?.nome || tool.tema)}</span>
        <p>${escapeHTML(tool.descricao)}</p>
        <div class="tool-details">
          <p><b>Para quem</b>${escapeHTML((tool.profissoes_uso_principal || []).join(" • "))}</p>
          <p><b>Acesso</b>${escapeHTML(tool.acesso)}</p>
          <p><b>Use com responsabilidade</b>${escapeHTML(tool.responsabilidade)}</p>
          <div class="tool-links"><a href="${escapeHTML(tool.url)}" target="_blank" rel="noopener">Acessar ↗</a><a class="secondary" href="${escapeHTML(tool.fonte_oficial)}" target="_blank" rel="noopener">Fonte oficial</a></div>
        </div>
      </article>`).join("") : '<div class="empty-state"><b>Nenhuma ferramenta encontrada.</b><p>Tente outro termo ou limpe os filtros.</p></div>';
    loadMore.hidden = visible.length >= tools.length;
    $$("#theme-chips button").forEach(button => button.classList.toggle("active", button.dataset.theme === catalogState.theme));
  };
  const setTheme = theme => {
    catalogState.theme = theme;
    catalogState.visible = 12;
    themeFilter.value = theme;
    renderCatalog();
  };
  fetch("data/ai-tools.json")
    .then(response => {
      if (!response.ok) throw new Error("Catálogo indisponível");
      return response.json();
    })
    .then(data => {
      catalogState.data = data;
      $("#catalog-total").textContent = data.metadados.total_ferramentas;
      data.temas.forEach(theme => {
        const option = document.createElement("option");
        option.value = theme.id;
        option.textContent = theme.nome;
        themeFilter.append(option);
      });
      const allChip = document.createElement("button");
      allChip.type = "button";
      allChip.dataset.theme = "todos";
      allChip.textContent = "Todos";
      allChip.className = "active";
      $("#theme-chips").append(allChip);
      data.temas.forEach(theme => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.dataset.theme = theme.id;
        chip.textContent = theme.nome;
        $("#theme-chips").append(chip);
      });
      $("#theme-chips").addEventListener("click", event => {
        const button = event.target.closest("button[data-theme]");
        if (button) setTheme(button.dataset.theme);
      });
      renderCatalog();
    })
    .catch(error => {
      toolGrid.innerHTML = `<div class="empty-state"><b>Não foi possível abrir o catálogo.</b><p>${escapeHTML(error.message)}. Recarregue a página.</p></div>`;
      loadMore.hidden = true;
    });
  themeFilter?.addEventListener("change", () => setTheme(themeFilter.value));
  accessFilter?.addEventListener("change", () => { catalogState.access = accessFilter.value; catalogState.visible = 12; renderCatalog(); });
  searchInput?.addEventListener("input", () => { catalogState.query = searchInput.value.trim(); catalogState.visible = 12; renderCatalog(); });
  loadMore?.addEventListener("click", () => { catalogState.visible += 12; renderCatalog(); });
  $("#clear-filters")?.addEventListener("click", () => {
    catalogState.theme = "todos"; catalogState.access = "todos"; catalogState.query = ""; catalogState.visible = 12;
    themeFilter.value = "todos"; accessFilter.value = "todos"; searchInput.value = ""; renderCatalog();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      event.preventDefault(); searchInput?.focus();
    }
  });

  // Abas dos planos
  const planTabs = $$(".implementation-tabs [role='tab']");
  const selectPlanTab = tab => {
    planTabs.forEach(item => item.setAttribute("aria-selected", String(item === tab)));
    $$(".implementation-panel").forEach(panel => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
  };
  planTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectPlanTab(tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + planTabs.length) % planTabs.length;
      planTabs[next].focus(); selectPlanTab(planTabs[next]);
    });
  });

  // Visualizador da apresentação
  const viewer = $("#slide-viewer");
  const slideImage = $("#slide-image");
  const slidePlaceholder = $("#slide-placeholder");
  const thumbnails = $("#slide-thumbnails");
  let slideTotal = 49;
  let currentSlide = 1;
  const slidePath = number => `assets/slides/slide-${number}.png`;
  const rebuildThumbnails = () => {
    thumbnails.innerHTML = "";
    for (let number = 1; number <= slideTotal; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.slide = String(number);
      button.setAttribute("aria-label", `Ir para o slide ${number}`);
      const image = document.createElement("img");
      image.loading = "lazy";
      image.src = slidePath(number);
      image.alt = "";
      image.addEventListener("error", () => {
        const fallback = document.createElement("span");
        fallback.className = "thumb-fallback";
        fallback.textContent = String(number).padStart(2, "0");
        image.replaceWith(fallback);
      }, { once: true });
      button.append(image);
      button.addEventListener("click", () => showSlide(number));
      thumbnails.append(button);
    }
  };
  const showSlide = number => {
    currentSlide = Math.min(slideTotal, Math.max(1, number));
    slidePlaceholder.hidden = true;
    slideImage.hidden = false;
    slideImage.src = slidePath(currentSlide);
    slideImage.alt = `Slide ${currentSlide} de ${slideTotal} da apresentação`;
    $("#slide-position").textContent = `Slide ${currentSlide} de ${slideTotal}`;
    $("#slide-progress").style.width = `${(currentSlide / slideTotal) * 100}%`;
    $$("button", thumbnails).forEach(button => button.classList.toggle("active", Number(button.dataset.slide) === currentSlide));
    thumbnails.querySelector("button.active")?.scrollIntoView({ block: "nearest" });
  };
  slideImage?.addEventListener("error", () => {
    slideImage.hidden = true;
    slidePlaceholder.hidden = false;
    $("span", slidePlaceholder).textContent = String(currentSlide).padStart(2, "0");
  });
  $("#slide-prev")?.addEventListener("click", () => showSlide(currentSlide - 1));
  $("#slide-next")?.addEventListener("click", () => showSlide(currentSlide + 1));
  $("#toggle-thumbnails")?.addEventListener("click", event => {
    thumbnails.hidden = !thumbnails.hidden;
    event.currentTarget.setAttribute("aria-pressed", String(!thumbnails.hidden));
  });
  $("#fullscreen-viewer")?.addEventListener("click", () => {
    if (!document.fullscreenElement) viewer.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  viewer?.addEventListener("keydown", event => {
    const actions = { ArrowRight: () => showSlide(currentSlide + 1), PageDown: () => showSlide(currentSlide + 1), ArrowLeft: () => showSlide(currentSlide - 1), PageUp: () => showSlide(currentSlide - 1), Home: () => showSlide(1), End: () => showSlide(slideTotal) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  });
  fetch("assets/slides/manifest.json")
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(manifest => { if (Number(manifest.total) > 0) slideTotal = Number(manifest.total); rebuildThumbnails(); showSlide(1); })
    .catch(() => { rebuildThumbnails(); showSlide(1); });
})();
