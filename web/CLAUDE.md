# Site Elite Motors — código-fonte

Baseado no template NovaChain (Vibehub): React + Vite + Tailwind, fundo WebGL (NexusEngine),
cards "skeuo", layout holodex. Cor de destaque: dourado `accent` (#d4a843) no tailwind.config.js.

- `npm run dev` (nesta pasta) abre em localhost:5173 servindo a raiz do repo (inventory.json, fotos).
- `npm run build` gera `../index.html` e `../assets/` — é isso que o GitHub Pages publica.
  Sempre rodar o build e commitar `index.html` + `assets/` depois de editar.
- Textos PT/ES ficam em `src/i18n.jsx`. Seções em `src/sections/`.
- Estoque: `../inventory.json`, gerado por `../scripts/sync-inventory.js` (robô diário no GitHub Actions).
- Métricas: `src/lib/track.js` grava no Firebase nas mesmas coleções que o `../dashboard.html` lê.
- Regra: nunca inventar preço, condição ou prometer aprovação de crédito nos textos.
