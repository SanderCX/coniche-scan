// Vaste demo-dataset voor de "Voorbeeld-output"-preview van de AI-Volwassen-
// heidsscan. De 8 domeinscores zijn bewust gekozen als 3,8/3,6/3,4/3,2/3,0/
// 2,8/2,6/2,4 — exact de reeks uit CLAUDE.md sectie 3 waarmee de classificatie-
// grenzen zijn bevestigd (2 groen, 5 oranje, 1 rood).
const perDomein: Record<string, number[]> = {
  ai1: [4, 4, 4, 4, 3], // 19/5 = 3.8
  ai2: [4, 4, 4, 3, 3], // 18/5 = 3.6
  ai3: [3, 4, 3, 4, 3], // 17/5 = 3.4
  ai4: [3, 3, 3, 3, 4], // 16/5 = 3.2
  ai5: [3, 3, 3, 3, 3], // 15/5 = 3.0
  ai6: [3, 3, 3, 3, 2], // 14/5 = 2.8
  ai7: [3, 3, 3, 2, 2], // 13/5 = 2.6
  ai8: [3, 2, 3, 2, 2], // 12/5 = 2.4
};

export const demoAntwoordenAiScan: Record<string, number> = Object.fromEntries(
  Object.entries(perDomein).flatMap(([domeinId, scores]) =>
    scores.map((score, i) => [`${domeinId}-v${i + 1}`, score])
  )
);
