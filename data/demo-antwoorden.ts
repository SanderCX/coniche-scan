// Vaste demo-dataset voor de "Voorbeeld-output"-preview (scherm 3). Bewust een
// spreiding over rood/oranje/groen, zodat radar, staafdiagram en top 3-lijsten
// er in de preview representatief uitzien.
const perBouwblok: Record<string, number[]> = {
  "bb1": [4, 4, 3, 4],
  "bb2": [3, 3, 4, 3],
  "bb3": [2, 3, 2, 3],
  "bb4": [2, 2, 1, 2],
  "bb5": [3, 4, 4, 4],
  "bb6": [2, 3, 3, 2],
  "bb7": [3, 3, 2, 3],
  "bb8": [4, 5, 4, 4],
  "bb9": [3, 4, 3, 4],
  "bb10": [2, 1, 2, 2],
  "bb11": [2, 2, 3, 2],
  "bb12": [3, 3, 3, 4],
  "bb13": [2, 3, 2, 2],
  "bb14": [3, 4, 4, 3],
  "bb15": [4, 4, 5, 4],
};

export const demoAntwoorden: Record<string, number> = Object.fromEntries(
  Object.entries(perBouwblok).flatMap(([bouwblokId, scores]) =>
    scores.map((score, i) => [`${bouwblokId}-v${i + 1}`, score])
  )
);

export const demoRespondentNaam = "Voorbeeldrespondent";
