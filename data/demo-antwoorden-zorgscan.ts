// Vaste demo-dataset voor de "Voorbeeld-output"-preview (scherm 3) van de
// Zorgscan. Zelfde opzet als data/demo-antwoorden.ts: bewust een spreiding
// over rood/oranje/groen, zodat radar, staafdiagram en top 3-lijsten er in
// de preview representatief uitzien (niet de vlakke "alles 2" van de
// proefinvulling waar de content op gebaseerd is).
const perBouwblok: Record<string, number[]> = {
  "zorg-organisatiestrategie": [4, 4, 3, 4],
  "zorg-klantcontact-visie-strategie": [3, 3, 4, 3],
  "zorg-structuur-sturing": [2, 3, 2, 3],
  "zorg-systemen-tools": [2, 2, 1, 2],
  "zorg-performance-management": [3, 4, 4, 4],
  "zorg-workforce-management": [2, 3, 3, 2],
  "zorg-learning-development": [3, 3, 2, 3],
  "zorg-employee-engagement": [4, 5, 4, 4],
  "zorg-leiderschap": [3, 4, 3, 4],
  "zorg-kennismanagement": [2, 1, 2, 2],
  "zorg-leren-uit-klantcontact": [2, 2, 3, 2],
  "zorg-kanaalmanagement": [3, 3, 3, 4],
  "zorg-financial-control": [2, 3, 2, 2],
  "zorg-positionering-klantcontact": [3, 4, 4, 3],
  "zorg-cultuur": [4, 4, 5, 4],
};

export const demoAntwoordenZorgscan: Record<string, number> = Object.fromEntries(
  Object.entries(perBouwblok).flatMap(([bouwblokId, scores]) =>
    scores.map((score, i) => [`${bouwblokId}-v${i + 1}`, score])
  )
);
