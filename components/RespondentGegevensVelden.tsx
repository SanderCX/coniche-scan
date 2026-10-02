/**
 * De 4 velden van het intakeformulier (naam, rol/functie, team, notities),
 * losgetrokken zodat "Mijn gegevens" → "Gegevens bekijken/wijzigen"
 * (CLAUDE.md sectie 3) hetzelfde formulier hergebruikt in plaats van een
 * nieuwe versie te bouwen. Geen eigen `<form>`/submit-knop hier: de
 * intakepagina en de Mijn-gegevens-modal hebben elk hun eigen omringende
 * formulier (met/zonder toestemmingsvakje, ander opslaggedrag).
 */
export function RespondentGegevensVelden({
  naam,
  functie,
  team,
  notities,
}: {
  naam: string | null;
  functie: string;
  team: string;
  notities: string;
}) {
  return (
    <>
      <div className="field">
        <label>Naam</label>
        <input type="text" name="naam" required defaultValue={naam ?? ""} />
      </div>
      <div className="field">
        <label>Rol / functie</label>
        <input type="text" name="functie" required defaultValue={functie} />
      </div>
      <div className="field">
        <label>
          Team <span className="font-normal text-ink-s">(optioneel)</span>
        </label>
        <input type="text" name="team" defaultValue={team} />
      </div>
      <div className="field">
        <label>
          Notities <span className="font-normal text-ink-s">(optioneel)</span>
        </label>
        <textarea name="notities" rows={3} defaultValue={notities} />
      </div>
    </>
  );
}
