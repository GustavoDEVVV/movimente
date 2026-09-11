# Movimente

Uma plataforma web de mini-jogos controlados por movimento. Sem teclado, sem controle — a webcam e o seu corpo são a interface. Cada jogo usa uma parte diferente do corpo (pernas, mãos, e mais no futuro) pra provar que dá pra fazer detecção de movimento em tempo real 100% no navegador, sem nenhum servidor rodando IA por trás.

**🔗 [Acessar o site](https://movimente-ruddy.vercel.app/)** — *(Link do Projeto web)*

---

## Índice

- Sobre o projeto
- Jogos disponíveis
- Tecnologias
- Como funciona (arquitetura)
- Sistema de identidade visual
- Estrutura de pastas
- Rodando localmente
- Deploy
- Progresso e recordes
- Requisitos do navegador
- Roadmap
- Origem do projeto
- Licença

---

## Sobre o projeto

O Movimente nasceu de uma pergunta simples: dava pra "correr parado" na frente da câmera e ver um corredor de verdade respondendo na tela? A resposta virou um jogo em Python, depois virou uma plataforma inteira, agora reescrita em React e rodando direto no navegador — nenhuma linha de detecção de movimento passa por um servidor, tudo é processado localmente, no seu próprio dispositivo, via WebAssembly.

A ideia central: cada jogo mapeia um movimento do corpo (levantar o joelho, abrir e fechar a mão) pra uma ação dentro do jogo, usando modelos de visão computacional já treinados pelo Google (MediaPipe), sem precisar treinar nenhum modelo do zero.

## Jogos disponíveis

### Corrida 20m

Corra no lugar levantando os joelhos alternadamente. Cada passada detectada empurra o corredor pra frente numa pista desenhada em perspectiva (efeito de profundidade feito só com geometria 2D, sem engine 3D). Cronômetro dispara na primeira passada e trava na chegada. Seu melhor tempo fica salvo entre sessões.

**Detecção:** MediaPipe **Pose Landmarker** (33 pontos do corpo). A lógica compara a altura dos dois joelhos entre si (não cada joelho com o próprio quadril, pra evitar falso positivo quando o quadril balança ao levantar uma perna), com três camadas de proteção contra ruído:

- **Histerese** — limiares diferentes pra "confirmar perna levantada" e "confirmar perna baixa", evitando oscilação perto do limite
- **Cooldown** — intervalo mínimo entre uma passada e outra
- **Confirmação por frames** — só aceita uma mudança de estado depois que ela se repete por alguns frames seguidos

### Flap Hand (Com bolinha)

Abra e feche a mão pra fazer um personagem "bater asas" e desviar de obstáculos — mecânica clássica de Flappy Bird, controlada por gesto.

**Detecção:** MediaPipe **Gesture Recognizer**, que já vem treinado pra classificar gestos comuns (`Open_Palm`, `Closed_Fist`) com um score de confiança — em vez de calcular manualmente distância entre dedos. A transição de mão aberta → fechada dispara o "flap"; física simples de gravidade + colisão por retângulos, tudo desenhado em `<canvas>`.

## Tecnologias

| Ferramenta | Função no projeto |
| --- | --- |
| React + Vite | Base da aplicação e bundler |
| React Router | Navegação entre Home e páginas de jogo |
| MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) | Pose Landmarker e Gesture Recognizer, rodando via WebAssembly direto no navegador |
| GSAP (+ ScrollTrigger, SplitText, DrawSVGPlugin) | Animações de entrada, scroll reveal e micro-interações |
| Canvas API (nativa) | Renderização de ambos os jogos (pista, personagens, física) |
| `localStorage` (nativo) | Persistência de recordes e último jogo jogado |
| Vercel | Hospedagem e deploy contínuo |

Nenhum backend, banco de dados ou chave de API — o projeto é 100% estático e client-side.

## Arquitetura

```
Webcam (getUserMedia)
        │
        ▼
MediaPipe Tasks Vision (WASM, roda no navegador)
        │
        ▼
Hook customizado (useContadorPassadas / useDeteccaoMao)
   → transforma landmarks/gestos brutos em eventos de jogo
        │
        ▼
Loop de jogo (requestAnimationFrame)
   → atualiza física/estado → desenha no <canvas>
        │
        ▼
localStorage (via utils/save.js)
   → grava recorde + último jogo, lido pela Home
```

Cada jogo é isolado em sua própria página (`pages/Corrida.jsx`, `pages/FlapHand.jsx`), mas segue o mesmo padrão estrutural:

1. Carrega o modelo do MediaPipe (assíncrono, com proteção contra dupla execução do Strict Mode do React)
2. Pede permissão de câmera via `getUserMedia`
3. Roda um loop com `requestAnimationFrame`: detecta → atualiza estado do jogo → desenha
4. Ao término, grava o resultado no `localStorage`

## Sistema de identidade visual

Tokens de design centralizados em `src/index.css` via CSS custom properties:

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#0a0c10` | Fundo principal (dark mode) |
| `--amber` | `#d9a441` | Cor de destaque / CTA |
| `--motion` | `#5fe8d0` | Cor secundária — remete ao overlay de esqueleto do MediaPipe |
| `--text` / `--text-muted` | `#f2ede2` / `#8b8f9a` | Texto principal e secundário |

**Tipografia:** Syne (títulos), DM Sans (corpo), Space Mono (dados/HUD — tempo, recorde, contadores).

O motivo visual recorrente é o **esqueleto de pontos conectados** (nós + linhas), usado no ícone/favicon e animado no hero da Home com `DrawSVGPlugin` — uma referência direta e literal à tecnologia por trás do produto.

## Estrutura de pastas

```
movimente/
├── public/
│   ├── favicon.svg / favicon.ico
│   └── apple-touch-icon.png
├── src/
│   ├── assets/
│   ├── components/              
│   │   ├── Carousel/            
│   │   ├── GameCard/           
│   │   └── ModeloCarregando/    
│   ├── games/                   
│   │   ├── corrida/
│   │   │   ├── config.js              
│   │   │   └── useContadorPassadas.js 
│   │   └── flapHand/
│   │       ├── config.js              
│   │       └── useDeteccaoMao.js       
│   ├── pages/                    
│   │   ├── Home.jsx / Home.css   
│   │   ├── Corrida.jsx           
│   │   └── FlapHand.jsx        
│   ├── utils/
│   │   ├── save.js            
│   │   ├── gsapSetup.js         
│   │   └── animations.js        
│   ├── App.jsx                 
│   ├── main.jsx                 
│   └── index.css                
├── vercel.json                  
├── index.html
└── package.json
```

## Rodando localmente

```bash
git clone https://github.com/seu-usuario/movimente.git
cd movimente
npm install
npm run dev
```

Acessa `http://localhost:5173`. Autoriza o acesso à câmera quando o navegador pedir (em `localhost`, funciona mesmo sem HTTPS).

**Build de produção:**

```bash
npm run build
npm run preview   # testa o build localmente antes de subir
```

## Deploy

Hospedado na **Vercel**, com deploy automático a cada push na branch principal.

Ponto de atenção obrigatório: como o roteamento é feito no cliente (React Router), é necessário um arquivo `vercel.json` na raiz redirecionando qualquer rota pro `index.html` — sem isso, acessar `/corrida` ou `/flap-hand` diretamente pela URL (fora da Home) resulta em 404:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Progresso e recordes

Tudo salvo via `localStorage`, sem conta de usuário nem backend:

- Cada jogo grava seu próprio recorde (`movimente-corrida-recorde`, `movimente-flaphand-recorde`)
- Um registro separado (`movimente-ultimo-jogo`) guarda qual foi o último jogo jogado e quando, exibido na seção "Continue de onde parou" da Home
- Tudo isolado por navegador/dispositivo — trocar de navegador ou limpar dados do site reseta o progresso

## Requisitos do navegador

- **HTTPS obrigatório** em produção — navegadores só liberam acesso à câmera (`getUserMedia`) em conexões seguras (a Vercel já entrega isso por padrão)
- Navegador com suporte a **WebAssembly** e, idealmente, aceleração por **GPU** (o `delegate: 'GPU'` configurado no MediaPipe cai para CPU automaticamente se não disponível, só um pouco mais lento)
- Permissão de câmera concedida manualmente por sessão/domínio

## Roadmap

- [ ]  Novo jogo usando cabeça/pescoço como controle
- [ ]  Modo dois jogadores lado a lado
- [ ]  Ranking com histórico de partidas (não só o recorde atual)
- [ ]  Sons de feedback (largada, chegada, colisão)
- [ ]  Suporte a mais distâncias/variações na Corrida

## Origem do projeto

O Movimente é a evolução de um projeto anterior, 100% em **Python + OpenCV + MediaPipe**, que já implementava a Corrida 100m rodando numa janela de desktop. Depois de compartilhar o progresso publicamente e receber sugestões pra expandir a ideia pra outras partes do corpo, o projeto foi reconstruído do zero como uma plataforma web em React — trazendo a mesma lógica de detecção (agora traduzida pra JavaScript/MediaPipe.js) para uma experiência acessível por link, sem precisar instalar nada.

## Licença

Este projeto está sob a licença MIT — sinta-se livre para usar, estudar e adaptar o código.

---
