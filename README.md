# IA na Educação — site da palestra

Experiência web estática em português do Brasil para a palestra **“A inteligência artificial na educação”**, com foco em aprendizagem, preparo docente, profissões e mercado de trabalho.

## Conteúdo

- cronologia da IA e da tecnologia educacional;
- checagem interativa do mito sobre o Vale do Silício;
- evidências, políticas internacionais e lacuna de preparo docente;
- explorador com 20 grupos profissionais;
- aplicações em medicina, farmacologia e agricultura;
- oficina de redesenho de tarefas, com salvamento local e exportação;
- catálogo pesquisável e filtrável de 71 ferramentas de IA;
- roteiro da palestra de 90 minutos e plano institucional de 90 dias;
- visualizador de 49 slides com teclado, miniaturas, progresso e tela cheia;
- fontes primárias e ressalvas metodológicas.

## Estrutura

- `index.html` — conteúdo e estrutura semântica;
- `styles.css` — identidade visual responsiva e acessível;
- `app.js` — interações sem dependências externas;
- `data/ai-tools.json` — fonte única do catálogo;
- `assets/slides/slide-N.png` — imagens renderizadas da apresentação;
- `assets/slides/manifest.json` — total e padrão dos slides;
- `assets/ia-na-educacao-profissoes-e-mercado.pptx` — apresentação editável para download.

## Executar localmente

Sirva a pasta por HTTP para que o navegador possa carregar o JSON do catálogo. Por exemplo:

```powershell
python -m http.server 4173 --directory site
```

Abra `http://localhost:4173`.

## Publicação

O projeto não exige etapa de compilação, framework ou variáveis de ambiente. A raiz pública é a própria pasta `site`.

## Atualização editorial

Conteúdo e links verificados em 20 de julho de 2026. Planos e capacidades de ferramentas podem mudar; confirme sempre a página oficial antes de contratar ou tratar dados sensíveis.
