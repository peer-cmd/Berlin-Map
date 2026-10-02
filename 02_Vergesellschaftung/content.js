// Shared HTML fragments for [data-include] elements (see include.js).
// Kept in a script so the pages also work when opened directly from disk
// (file://), where fetch() of a local file is blocked.
window.SITE_INCLUDES = {
"timeline": `
    <dl class="timeline">
      <dt>2021</dt><dd>Volksentscheid „Deutsche Wohnen &amp; Co enteignen": 56,4 % Zustimmung. Der Beschluss ist rechtlich nicht bindend; er ist ein politischer Auftrag an den Senat.</dd>
      <dt>2021–2023</dt><dd>Die Expertenkommission „Vergesellschaftung" tagt und prüft Rechtsfragen und Kostenrahmen.</dd>
      <dt>2023</dt><dd>Abschlussbericht der Kommission. Das Mehrheitsvotum hält die Vergesellschaftung für verfassungsrechtlich möglich, auch mit einer Entschädigung unterhalb des Verkehrswerts. Ein Sondervotum (3 von 13 Mitgliedern) sieht den Verkehrswert als zwingenden Ausgangspunkt mit nur engem Spielraum für Abschläge.</dd>
      <dt>2024</dt><dd>Der Berliner Rechnungshof veröffentlicht am 20.02.2024 einen Beratungsbericht mit vier Kostenszenarien für den Landeshaushalt: 8, 11, 29 und 36 Mrd. €.</dd>
      <dt>2026</dt><dd>Gutachten von IW Köln/Empirica im Auftrag Berliner Banken, die Gegenposition.</dd>
    </dl>`,
"glossary": `
    <dl class="glossary">
      <dt>Art. 15 GG vs. Art. 14 GG</dt><dd>Art. 14 Abs. 3 GG regelt die Enteignung im Einzelfall gegen Entschädigung. Art. 15 GG erlaubt die Vergesellschaftung ganzer Wirtschaftszweige in Gemeineigentum; er wurde seit 1949 nie angewendet, daher ungeklärt, ob die Entschädigung dem vollen Verkehrswert entsprechen muss oder geringer ausfallen darf.</dd>
      <dt>Sondervotum / Mehrheitsvotum</dt><dd>Stimmt eine Kommission nicht einstimmig ab, hält der Abschlussbericht die Position der Mehrheit (Mehrheitsvotum) und die der überstimmten Minderheit (Sondervotum) getrennt fest. Bei der Expertenkommission Vergesellschaftung vertraten 3 von 13 Mitgliedern ein Sondervotum zur Entschädigung: Verkehrswert als zwingender Ausgangspunkt, nur enger Spielraum für Abschläge — nicht schlicht „voller Verkehrswert".</dd>
      <dt>Verkehrswert</dt><dd>Der im gewöhnlichen Geschäftsverkehr nach den rechtlichen Gegebenheiten und tatsächlichen Eigenschaften eines Grundstücks zu erzielende Preis (§ 194 BauGB), ohne Rücksicht auf ungewöhnliche oder persönliche Verhältnisse.</dd>
      <dt>Ertragswertverfahren</dt><dd>Wertermittlungsmethode für vermietete Objekte: kapitalisierter Reinertrag (Miete abzüglich Bewirtschaftungskosten), abgezinst mit dem Liegenschaftszins. Maßgeblich für Bestände mit Mieterschutz und regulierten Mieten.</dd>
      <dt>Vergleichswertverfahren</dt><dd>Wertermittlungsmethode auf Basis tatsächlich erzielter Kaufpreise vergleichbarer, in der Regel unvermieteter Objekte. Liegt den höheren Marktpreisangaben für Eigentumswohnungen zugrunde.</dd>
      <dt>Liegenschaftszins</dt><dd>Amtlicher Kapitalisierungszinssatz des Gutachterausschusses zur Ermittlung des Ertragswerts vermieteter Immobilien.</dd>
      <dt>Entschädigungsquote</dt><dd>Anteil des vollen Verkehrswerts, der tatsächlich als Entschädigung gezahlt wird (100 % = voller Verkehrswert, sog. Kaufpreisfaktor). Ein Wert unter 100 % ist laut Expertenkommission rechtlich umstritten, wird aber mehrheitlich für zulässig gehalten.</dd>
      <dt>Annuität</dt><dd>Konstante jährliche Zahlung aus Zins und Tilgung bei einem Annuitätendarlehen.</dd>
      <dt>Tilgungsdauer</dt><dd>Gesamtlaufzeit, über die der Kredit vollständig zurückgezahlt wird. Nicht zu verwechseln mit der Zinsbindung, die nur einen Teilzeitraum davon mit fest vereinbartem Zins abdeckt.</dd>
      <dt>Restschuld</dt><dd>Zu einem Zeitpunkt noch nicht getilgter Anteil der ursprünglichen Kreditsumme.</dd>
      <dt>Zinsbindung</dt><dd>Zeitraum, für den ein Kreditzins fest vereinbart ist; danach Anschlussfinanzierung zu dann geltenden Konditionen.</dd>
      <dt>Risikoprämie</dt><dd>Zinsaufschlag ab dem Zeitpunkt der Ankündigung einer Vergesellschaftung, den Kreditgeber laut IW Köln/Empirica (2026) wegen erhöhter wahrgenommener Risiken verlangen könnten (Kapitalflucht-These). Im Modell sofort ab Jahr 1 wirksam, unabhängig von der späteren Zinsbindung.</dd>
      <dt>NOI (Nettobetriebsergebnis)</dt><dd>Mieteinnahmen abzüglich laufender Bewirtschaftungskosten, vor Schuldendienst.</dd>
      <dt>Bewirtschaftungskosten</dt><dd>Laufende, nicht auf Mieter umlegbare Kosten der Immobilienverwaltung: Instandhaltung, Verwaltung, Mietausfallwagnis (ImmoWertV Anlage 3).</dd>
      <dt>Nettokaltmiete (NKM) / Bestandsmiete vs. Neuvertragsmiete</dt><dd>Nettokaltmiete ist die Miete ohne Betriebskosten. Bestandsmiete meint die in laufenden, oft älteren Mietverhältnissen tatsächlich gezahlte Miete; Neuvertragsmiete die bei Neuabschluss verlangte, meist deutlich höhere Miete. Das Modell rechnet mit Bestandsmieten, da die übernommenen Wohnungen bereits vermietet sind.</dd>
      <dt>Zuschussbedarf</dt><dd>Der Betrag, den der Landeshaushalt jährlich zuschießen müsste, wenn die Mieteinnahmen abzüglich Bewirtschaftungskosten den Schuldendienst nicht decken — also der jährliche Fehlbetrag bei negativem Cashflow.</dd>
      <dt>Reinvestitionsquote</dt><dd>Anteil des positiven Cashflows nach Schuldendienst, der in Neubau oder Umwandlung fließt, statt als Rücklage zu verbleiben.</dd>
      <dt>Sozialbindung / Belegungsbindung</dt><dd>Vertragliche oder gesetzliche Verpflichtung, eine Wohnung für einen bestimmten Zeitraum zu gedeckelter Sozialmiete an berechtigte Haushalte zu vermieten.</dd>
      <dt>Kappungsgrenze</dt><dd>Gesetzliche Obergrenze für Mieterhöhungen bei bestehenden Mietverhältnissen innerhalb eines Dreijahreszeitraums (§ 558 BGB), in angespannten Wohnungsmärkten abgesenkt.</dd>
      <dt>Grundpfandrecht</dt><dd>Dingliches Sicherungsrecht an einem Grundstück zugunsten eines Gläubigers (Hypothek, Grundschuld); Grundlage der Kreditvergabe im Immobiliengeschäft.</dd>
      <dt>AöR (Anstalt öffentlichen Rechts)</dt><dd>Rechtsform öffentlicher Trägerschaft ohne Mitglieder, im Kontext der Vergesellschaftung als mögliche Trägerin des überführten Bestands diskutiert.</dd>
      <dt>Break-even</dt><dd>Erstes Jahr, in dem der kumulierte Cashflow (bzw. NOI abzüglich Kaufpreis) positiv wird.</dd>
      <dt>Nettoposition</dt><dd>Vermögenswert des Bestands (Verkehrswert × Bestandsgröße) abzüglich Restschuld, zuzüglich kumuliertem Cashflow aus dem laufenden Betrieb. Zeigt die Gesamtvermögensposition des Landes, nicht nur den laufenden Cashflow.</dd>
      <dt>Integrationskosten</dt><dd>Einmalige Kosten der Zusammenführung vieler getrennter Bestände in eine Anstalt (IT, Verwaltung, Recht), Jahr 0, als % des Kaufpreises. Von IW Köln 2026 als im DWE-Modell fehlend kritisiert. Kein wohnungswirtschaftsspezifischer Wert bekannt; 2 % ist eine grobe Analogie zur allgemeinen M&amp;A-Literatur (typ. niedriger einstelliger Prozentbereich), keine belastbare Schätzung.</dd>
      <dt>Sanierungsstau</dt><dd>Einmaliger Nachholbedarf bei Übernahme (These Bernt/Holm: private Konzerne unterinvestieren). Default grob hergeleitet aus Berliner Sanierungsbedarf-Schätzungen für Bestandsbauten (Größenordnung 20.000–30.000 €/Whg. bei Teilmodernisierung; energetische Vollsanierung nach IW-Consult-Kostensätzen 660–1.600 €/m² liegt deutlich höher, 40.000+ €/Whg.). Illustrativ, keine belastbare Einzelschätzung je Bestand.</dd>
    </dl>`
};
