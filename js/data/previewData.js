// Vaste mock-resultaatsets voor scherm 3 (Voorbeeld-output preview), los van
// het antwoorden-model — CLAUDE.md sectie 5.3 staat dit expliciet toe
// ("isPreview: true of een aparte mock-dataset"). Bouwblokscores zijn direct
// ingevuld i.p.v. afgeleid uit 60/40 losse antwoorden.

export const previewBouwblokScores = {
  "klantcontact-volwassenheid": {
    bb1: 3.5,
    bb2: 2.7,
    bb3: 2.8,
    bb11: 2.3,
    bb13: 1.8,
    bb14: 2.5,
    bb4: 2.2,
    bb6: 2.8,
    bb10: 2.6,
    bb12: 2.6,
    bb5: 2.8,
    bb7: 2.9,
    bb8: 2.4,
    bb9: 3.5,
    bb15: 3.5,
  },
  // Geverifieerde voorbeeldset uit CLAUDE.md sectie 3 (2 groen, 5 oranje, 1 rood).
  "ai-volwassenheid": {
    ad1: 3.8,
    ad2: 3.6,
    ad3: 3.4,
    ad4: 3.2,
    ad5: 3.0,
    ad6: 2.8,
    ad7: 2.6,
    ad8: 2.4,
  },
};

export const previewRespondentNaam = "Voorbeeldrapport";
