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
    <div class="glossary">
      <section class="gl-group">
      <h3 class="gl-letter">A</h3>
      <dl>
        <div><dt>Annuität</dt> <dd>Konstante jährliche Zahlung aus Zins und Tilgung bei einem Annuitätendarlehen.</dd></div>
        <div><dt>AöR (Anstalt öffentlichen Rechts)</dt> <dd>Rechtsform öffentlicher Trägerschaft ohne Mitglieder, im Kontext der Vergesellschaftung als mögliche Trägerin des überführten Bestands diskutiert.</dd></div>
        <div><dt>Art. 15 GG vs. Art. 14 GG</dt> <dd><span class="src">Art. 14 Abs. 3 GG</span> regelt die Enteignung im Einzelfall gegen Entschädigung. Art. 15 GG erlaubt die Vergesellschaftung ganzer Wirtschaftszweige in Gemeineigentum; er wurde seit 1949 nie angewendet, daher ungeklärt, ob die Entschädigung dem vollen Verkehrswert entsprechen muss oder geringer ausfallen darf.</dd></div>
        <div><dt>Ausgangsmiete</dt> <dd>Ø Nettokaltmiete im übernommenen Bestand im ersten Modelljahr, in €/m² Wohnfläche und Monat.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">B</h3>
      <dl>
        <div><dt>Baukosten Neubau</dt> <dd>Kosten für die Errichtung einer neuen Wohnung je m² Wohnfläche. Bestimmt im Modus „Neubau", wie viele Wohnungen aus dem reinvestierten Überschuss entstehen (Baukosten × Ø Wohnungsgröße je Wohnung).</dd></div>
        <div><dt>Bestandseffekt</dt> <dd>Was bis zum Ende des Betrachtungszeitraums erreicht ist: der Anteil der Sozialwohnungen am übernommenen Bestand und, im Modus „Neubau", die Zahl neu gebauter Wohnungen.</dd></div>
        <div><dt>Betrachtungszeitraum</dt> <dd>Zahl der Jahre, über die das Modell Mieteinnahmen, Kosten und Schulden fortschreibt. Nettoergebnis, Bestandseffekt und Nettoposition beziehen sich auf das Ende dieses Zeitraums.</dd></div>
        <div><dt>Bewirtschaftungskosten</dt> <dd>Laufende, nicht auf Mieter umlegbare Kosten der Immobilienverwaltung: Instandhaltung, Verwaltung, Mietausfallwagnis (<span class="src">ImmoWertV Anlage 3</span>).</dd></div>
        <div><dt>Break-even</dt> <dd>Erstes Jahr, in dem der kumulierte Cashflow (bzw. NOI abzüglich Kaufpreis) positiv wird.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">C</h3>
      <dl>
        <div><dt>Cashflow</dt> <dd>NOI abzüglich Schuldendienst (und abzüglich der Kosten einer Umwandlung nach festem Zeitplan) in einem Jahr. Der kumulierte Cashflow summiert die Jahreswerte seit Übernahme, beginnend mit den Einmalkosten in Jahr 0.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">E</h3>
      <dl>
        <div><dt>Einmalige Kosten</dt> <dd>Kosten, die einmalig bei der Übernahme in Jahr 0 anfallen: Transaktion, Aufbau der Trägerorganisation, Rechtsverfahren. Im Modell zusätzlich zu Integrationskosten und Sanierungsstau.</dd></div>
        <div><dt>Entschädigungsquote</dt> <dd>Anteil des vollen Verkehrswerts, der tatsächlich als Entschädigung gezahlt wird (100 % = voller Verkehrswert, sog. Kaufpreisfaktor). Ein Wert unter 100 % ist <span class="src">laut Expertenkommission</span> rechtlich umstritten, wird aber mehrheitlich für zulässig gehalten.</dd></div>
        <div><dt>Ertragswertverfahren</dt> <dd>Wertermittlungsmethode für vermietete Objekte: kapitalisierter Reinertrag (Miete abzüglich Bewirtschaftungskosten), abgezinst mit dem Liegenschaftszins. Maßgeblich für Bestände mit Mieterschutz und regulierten Mieten.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">F</h3>
      <dl>
        <div><dt>Finanzierungsmodus (Kredit / Eigenmittel)</dt> <dd>Kredit: Der Kaufpreis wird über ein Annuitätendarlehen finanziert und mit Zins und Tilgung aus den Mieteinnahmen bedient. Eigenmittel: Das Land zahlt den Kaufpreis aus dem Haushalt; es fällt kein Schuldendienst an, der Kaufpreis wird im Nettoergebnis als Ausgabe abgezogen.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">G</h3>
      <dl>
        <div><dt>Grundpfandrecht</dt> <dd>Dingliches Sicherungsrecht an einem Grundstück zugunsten eines Gläubigers (Hypothek, Grundschuld); Grundlage der Kreditvergabe im Immobiliengeschäft.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">H</h3>
      <dl>
        <div><dt>Haushaltseinkommen</dt> <dd>Im Modell eine Vergleichslinie: die Ausgangsmiete, fortgeschrieben mit der Wachstumsrate der Haushaltseinkommen. Liegt die Modellmiete unter dieser Linie, sinkt der Anteil des Einkommens, der für Miete ausgegeben wird.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">I</h3>
      <dl>
        <div><dt>Integrationskosten</dt> <dd>Einmalige Kosten der Zusammenführung vieler getrennter Bestände in eine Anstalt (IT, Verwaltung, Recht), Jahr 0, als % des Kaufpreises. Von <span class="src">IW Köln 2026</span> als im DWE-Modell fehlend kritisiert. Kein wohnungswirtschaftsspezifischer Wert bekannt; 2 % ist eine grobe Analogie zur allgemeinen M&amp;A-Literatur (typ. niedriger einstelliger Prozentbereich), keine belastbare Schätzung.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">K</h3>
      <dl>
        <div><dt>Kappungsgrenze</dt> <dd>Gesetzliche Obergrenze für Mieterhöhungen bei bestehenden Mietverhältnissen innerhalb eines Dreijahreszeitraums (<span class="src">§ 558 BGB</span>), in angespannten Wohnungsmärkten abgesenkt.</dd></div>
        <div><dt>Kosteninflation</dt> <dd>Jährliche Steigerung der Bewirtschaftungskosten. Im Modell unabhängig von der Mietsteigerung: Steigen die Kosten schneller als die Miete, schrumpft das NOI.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">L</h3>
      <dl>
        <div><dt>Landeseigene Wohnungsgesellschaften (kommunale WoGes.)</dt> <dd>Wohnungsunternehmen im Eigentum des Landes Berlin. Ihre Ø Nettokaltmiete dient im Modell als Vergleichslinie für ein Mietniveau in öffentlicher Hand.</dd></div>
        <div><dt>Liegenschaftszins</dt> <dd>Amtlicher Kapitalisierungszinssatz des Gutachterausschusses zur Ermittlung des Ertragswerts vermieteter Immobilien.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">M</h3>
      <dl>
        <div><dt>Mieterersparnis</dt> <dd>Kumulierte Differenz zwischen der Miete ohne Umwandlung und der gezahlten Sozialmiete, multipliziert mit der Zahl der umgewandelten Wohnungen.</dd></div>
        <div><dt>Mietsteigerung</dt> <dd>Jährliche prozentuale Erhöhung der Miete im übernommenen Bestand, ausgehend von der Ausgangsmiete.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">N</h3>
      <dl>
        <div><dt>Nettoergebnis</dt> <dd>Kumulierter Cashflow am Ende des Betrachtungszeitraums, einschließlich der Einmalkosten. Im Modus Eigenmittel ist der aus dem Haushalt gezahlte Kaufpreis abgezogen.</dd></div>
        <div><dt>Nettokaltmiete (NKM) / Bestandsmiete vs. Neuvertragsmiete</dt> <dd>Nettokaltmiete ist die Miete ohne Betriebskosten. Bestandsmiete meint die in laufenden, oft älteren Mietverhältnissen tatsächlich gezahlte Miete; Neuvertragsmiete die bei Neuabschluss verlangte, meist deutlich höhere Miete. Das Modell rechnet mit Bestandsmieten, da die übernommenen Wohnungen bereits vermietet sind.</dd></div>
        <div><dt>Nettoposition</dt> <dd>Vermögenswert des Bestands (Verkehrswert × Bestandsgröße) abzüglich Restschuld, zuzüglich kumuliertem Cashflow aus dem laufenden Betrieb. Zeigt die Gesamtvermögensposition des Landes, nicht nur den laufenden Cashflow.</dd></div>
        <div><dt>NOI (Nettobetriebsergebnis)</dt> <dd>Mieteinnahmen abzüglich laufender Bewirtschaftungskosten, vor Schuldendienst.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">R</h3>
      <dl>
        <div><dt>Reinvestitionsquote</dt> <dd>Anteil des positiven Cashflows nach Schuldendienst, der in Neubau fließt, statt als Rücklage zu verbleiben. Ist unter „Die Sozialwohnungen" ein Anteil „Aus Überschuss" gesetzt, geht dieser zuerst in die Umwandlung; die Reinvestitionsquote bezieht sich auf den Rest.</dd></div>
        <div><dt>Restschuld</dt> <dd>Zu einem Zeitpunkt noch nicht getilgter Anteil der ursprünglichen Kreditsumme.</dd></div>
        <div><dt>Risikoprämie</dt> <dd>Zinsaufschlag ab dem Zeitpunkt der Ankündigung einer Vergesellschaftung, den Kreditgeber laut <span class="src">IW Köln/Empirica (2026)</span> wegen erhöhter wahrgenommener Risiken verlangen könnten (Kapitalflucht-These). Im Modell sofort ab Jahr 1 wirksam, unabhängig von der späteren Zinsbindung.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">S</h3>
      <dl>
        <div><dt>Sanierungsstau</dt> <dd>Einmaliger Nachholbedarf bei Übernahme (<span class="src">These Bernt/Holm</span>: private Konzerne unterinvestieren). Default grob hergeleitet aus Berliner Sanierungsbedarf-Schätzungen für Bestandsbauten (Größenordnung 20.000–30.000 €/Whg. bei Teilmodernisierung; energetische Vollsanierung nach <span class="src">IW-Consult-Kostensätzen</span> 660–1.600 €/m² liegt deutlich höher, 40.000+ €/Whg.). Illustrativ, keine belastbare Einzelschätzung je Bestand.</dd></div>
        <div><dt>Schuldendienst</dt> <dd>Jährliche Zahlung an die Kreditgeber aus Zinsen und Tilgung; beim Annuitätendarlehen gleich der Annuität.</dd></div>
        <div><dt>Sondervotum / Mehrheitsvotum</dt> <dd>Stimmt eine Kommission nicht einstimmig ab, hält der Abschlussbericht die Position der Mehrheit (Mehrheitsvotum) und die der überstimmten Minderheit (Sondervotum) getrennt fest. Bei der Expertenkommission Vergesellschaftung vertraten 3 von 13 Mitgliedern ein Sondervotum zur Entschädigung: Verkehrswert als zwingender Ausgangspunkt, nur enger Spielraum für Abschläge — nicht schlicht „voller Verkehrswert".</dd></div>
        <div><dt>Sozialbindung / Belegungsbindung</dt> <dd>Vertragliche oder gesetzliche Verpflichtung, eine Wohnung für einen bestimmten Zeitraum zu gedeckelter Sozialmiete an berechtigte Haushalte zu vermieten.</dd></div>
        <div><dt>Sozialmiete</dt> <dd>Gedeckelte Miete in Wohnungen mit Sozialbindung. Im Modell steigt sie mit derselben Rate wie die Ausgangsmiete und liegt nie über ihr.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">T</h3>
      <dl>
        <div><dt>Tilgungsdauer</dt> <dd>Gesamtlaufzeit, über die der Kredit vollständig zurückgezahlt wird. Nicht zu verwechseln mit der Zinsbindung, die nur einen Teilzeitraum davon mit fest vereinbartem Zins abdeckt.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">U</h3>
      <dl>
        <div><dt>Umwandlungskosten</dt> <dd>Einmalige Kosten je m² Wohnfläche, wenn eine Wohnung in eine Sozialwohnung umgewandelt wird; × Ø Wohnungsgröße ergibt die Kosten je Wohnung. Standardwert 0: Im öffentlichen Eigentum ist die Umwandlung eine Entscheidung über die Miete, ihre Kosten sind die entgangenen Mieteinnahmen, die das Modell über die Sozialmiete bereits erfasst. Ein Wert über 0 bildet zusätzliche Kosten ab, etwa für Verwaltung oder Modernisierung.</dd></div>
        <div><dt>Umwandlungstempo</dt> <dd>Legt fest, wie schnell Wohnungen in Sozialwohnungen umgewandelt werden; die drei Regler wirken zusammen, bis der gesamte übernommene Bestand umgewandelt ist, und gelten unabhängig vom Reinvestitionsmodus; Neubauwohnungen bleiben bei der Modellmiete. „Sofort umgewandelt": Anteil des Bestands, der ab Jahr 1 die Sozialmiete trägt. „Fester Zeitplan": weiterer Anteil des Gesamtbestands pro Jahr, unabhängig vom Cashflow; die Kosten mindern den Cashflow des jeweiligen Jahres. Bei 3,3 %/Jahr ist der gesamte Bestand nach rund 30 Jahren umgewandelt. Voreinstellung 3,2 %/Jahr: Bernt/Holm (2023) rechnen damit, dass nach einer Vergesellschaftung 63 % der Neuvermietungen an WBS-Inhaber*innen gehen, wie bei den landeseigenen Unternehmen; bei 5 % Fluktuation sind das jährlich 6.999 von rund 222.000 Wohnungen. „Aus Überschuss": Anteil des jährlichen Überschusses, der weitere Umwandlungen trägt, gerechnet mit entgangener Miete und Umwandlungskosten je Wohnung; 0 % schaltet ihn ab.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">V</h3>
      <dl>
        <div><dt>Verbraucherpreisindex (CPI)</dt> <dd>Maß für die durchschnittliche Preisentwicklung der Waren und Dienstleistungen, die private Haushalte kaufen. Im Modell eine Vergleichslinie: die Ausgangsmiete, fortgeschrieben mit der Inflationsrate. <span class="src">IW Köln/Empirica (2026)</span> gehen davon aus, dass Bestandsmieten wie der CPI wachsen.</dd></div>
        <div><dt>Vergleichswertverfahren</dt> <dd>Wertermittlungsmethode auf Basis tatsächlich erzielter Kaufpreise vergleichbarer, in der Regel unvermieteter Objekte. Liegt den höheren Marktpreisangaben für Eigentumswohnungen zugrunde.</dd></div>
        <div><dt>Verkehrswert</dt> <dd>Der im gewöhnlichen Geschäftsverkehr nach den rechtlichen Gegebenheiten und tatsächlichen Eigenschaften eines Grundstücks zu erzielende Preis (<span class="src">§ 194 BauGB</span>), ohne Rücksicht auf ungewöhnliche oder persönliche Verhältnisse.</dd></div>
      </dl>
      </section>
      <section class="gl-group">
      <h3 class="gl-letter">Z</h3>
      <dl>
        <div><dt>Zinsaufschlag (Anschlussfinanzierung)</dt> <dd>Erhöhung des Zinssatzes nach Ende der Zinsbindung, wenn die Restschuld zu neuen Konditionen weiterfinanziert wird. Im Modell wird die Annuität für die restliche Tilgungsdauer mit dem erhöhten Zins neu berechnet.</dd></div>
        <div><dt>Zinsbindung</dt> <dd>Zeitraum, für den ein Kreditzins fest vereinbart ist; danach Anschlussfinanzierung zu dann geltenden Konditionen.</dd></div>
        <div><dt>Zinssatz</dt> <dd>Jährlicher Preis für den Kredit, in Prozent der noch offenen Kreditsumme (Restschuld). Im Modell gilt er bis zum Ende der Zinsbindung, zuzüglich einer etwaigen Risikoprämie.</dd></div>
        <div><dt>Zuschussbedarf</dt> <dd>Der Betrag, den der Landeshaushalt jährlich zuschießen müsste, wenn die Mieteinnahmen abzüglich Bewirtschaftungskosten den Schuldendienst nicht decken — also der jährliche Fehlbetrag bei negativem Cashflow.</dd></div>
      </dl>
      </section>
    </div>`
};
