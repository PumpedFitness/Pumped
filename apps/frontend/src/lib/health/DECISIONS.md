# Baseline — Entscheidungen und Spec-Diff

Stand: 2026-08-10. Bezug: *Baseline — Spezifikation der Geschäftslogik*, Stand
2026-08-10.

Dieses Dokument ist **normativ** und geht der Spec vor, wo beide etwas sagen. Es
enthält keine neuen Features, nur Auflösungen der Stellen, an denen die Spec
widersprüchlich, lückenhaft oder unterspezifiziert war. Jeder Punkt trägt die
Kennung aus dem Review (B1, C3, …), damit die Herkunft nachvollziehbar bleibt.

**Gegen das Original geprüft.** Alle Punkte sind gegen `~/IdeaProjects/OpenFit`
verifiziert (`OpenFit/Domain/*.swift`, `OpenFit/Data/**`, `spike/verify_estimator.py`).
Wo der Swift-Code die Frage bereits beantwortet, steht das dabei — drei Befunde
aus dem ersten Review sind dadurch hinfällig geworden und als **zurückgezogen**
markiert. Die Spec ist an diesen Stellen unvollständig, nicht der Code.

Ziel des Ports: `apps/frontend/src/lib/baseline/` — reine Rechenschicht hinter
der `dailySeries`/`sessions`-Schnittstelle, keine UI, keine DB-Anbindung.

---

## 1. `temp` und der Positiv-Filter — B1 zurückgezogen, D1 entschärft

**B1 war falsch.** Der Verdacht, `tempNightly` sei eine Abweichung und der
Positiv-Filter verwerfe systematisch die kalte Hälfte aller Nächte, hält dem
Original nicht stand. `DataTypes.swift:127` bildet `tempNightly` auf
`nightlyTemperatureCelsius` ab — eine **absolute Hauttemperatur in °C**. Die
Abweichungsfelder existieren daneben als eigene Kennungen und werden gar nicht
erst geführt:

```
FieldID:  tempNightly = 8            nightlyTemperatureCelsius        ← absolut, gespeichert
          tempBaseline = 9           baselineTemperatureCelsius       ← verworfen
          tempRelativeStddev30d = 10 relativeNightlyStddev30dCelsius  ← verworfen
```

Damit ist `value > 0` für `temp` korrekt, und §2.1 bleibt **unverändert**. Ein
`Metric.domain`-Konzept wird nicht eingeführt — es wäre totes Gerüst für einen
Fall, den es nicht gibt. Sollte je eine Abweichungsgröße dazukommen (die beiden
verworfenen Felder sind Kandidaten, sobald Fitbit kalibriert hat), greift die
Ausnahmeregel, die §2.1 bereits formuliert.

**Was von B1 bleibt, ist ein Darstellungsfehler.** §9 und `Metric.format`
setzen `temp` mit erzwungenem Vorzeichen (`%+.2f`). Auf einen Absolutwert
angewandt ergibt das `+33.12 °C` — das Vorzeichen gehört zu einer Abweichung,
nicht zu einer Temperatur. Das Beispiel `+0.31` in §9 ist entsprechend auch
kein `tempNightly`. Entscheidung: **`temp` wird ohne erzwungenes Vorzeichen
formatiert** (`%.2f`). Wo eine vorzeichenbehaftete Darstellung gewollt ist,
zeigt sie die Abweichung zur Baseline-Mitte — die liegt in `Contribution`
bereits vor und ist die Zahl, die der Nutzer lesen soll. Reine Darstellung,
gehört bei der Portierung nach i18n.

**`"NaN"` (D1) ist bereits an der Rohschicht gelöst.** `Decoding.swift:85` fängt
den String ab, bevor er in die Datenbank gelangt — mit der ausdrücklichen
Begründung, dass `Double("NaN")` in Swift `.nan` liefert statt `nil`. Die
Rechenschicht sieht also nie ein NaN. Zwei Konsequenzen für den Port:

- Die Ingest-Schicht muss diesen Guard mitnehmen; in JS hat `Number("NaN")`
  dasselbe Verhalten.
- Der Filter in §2.1 bekommt trotzdem ein `isFinite` vorgeschaltet. Es kostet
  nichts und macht die Rechenschicht unabhängig davon, ob der Guard oben
  irgendwann bricht:

```
admissible(value) -> bool:  isFinite(value) && value > 0
```

---

## 2. Determinismus bei Kollisionen (D2, C3)

**§2.1 Tagesduplikate — entfällt, das Schema schließt sie aus.** Meine erste
Fassung wollte über `rowid` disambiguieren. Das ist weder nötig noch möglich:

```sql
CREATE TABLE raw_daily (
  metric INTEGER NOT NULL, date INTEGER NOT NULL, field INTEGER NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY (metric, date, field)
) WITHOUT ROWID;
```

Der Primärschlüssel macht zwei Zeilen für dasselbe `(metric, date, field)`
unmöglich, und `WITHOUT ROWID` heißt: Es gibt keinen `rowid`, auf den man sich
beziehen könnte. Das `uniquingKeysWith` im Original ist defensiv und
unerreichbar. Für den Port genügt `ORDER BY date`.

**§7.2 `mainNightsByDate`.** Hier sind Kollisionen real — `raw_session` hat den
Schlüssel `(metric, start_ts)`, zwei Sessions können auf demselben Zivildatum
enden, und im Testkonto tun sie das (20260718). Die Rangfolge wird um eine
dritte Stufe ergänzt, `start_ts` ist als Teil des Schlüssels eindeutig und
schließt damit jeden Gleichstand:

```
1. isMain vor !isMain
2. mehr minutesAsleep
3. späterer startTs
```

**§7.3 Hypnogramm.** Nur eine Klarstellung: Das Original akkumuliert bereits
korrekt **pro abgebildeter Phase** (`overlap[stage, default: 0] += shared` mit
`stage` als gemappter `SleepStage`, `SleepAnalysis.swift:60`). Die Spec ließ
offen, ob pro Phase oder pro Stage-Instanz aggregiert wird, und der Unterschied
ist real — zwei getrennte DEEP-Abschnitte in einer Säule müssen sich addieren.
Verbindlich ist die Fassung des Originals:

```
overlap: Map<SleepStage, seconds>            // Schlüssel ist die Phase
für jede stage mit gültiger Abbildung:
    shared = min(to, stage.end) − max(from, stage.start)
    if shared > 0:  overlap[mapped(stage.kind)] += shared
```

Gleichstand wird wie in §10.7 vorgeschlagen aufgelöst: Vorrang in der
Reihenfolge `deep, rem, core, awake`.

---

## 3. Annotationen (D3, D4, B6)

**Nur verzerrende Typen schließen aus (D3).** `excludeAnnotated` behandelte alle
vier Typen gleich. Autonome Marker werden von Krankheit, Alkohol und
Zeitzonenwechsel messbar verschoben; eine Verletzung verschiebt sie nicht — sie
verschiebt das Training. Eine achtwöchige `injury`-Annotation würde die Historie
unter die Mindestmenge drücken, ohne dass ein Störsignal entfernt wird.

```
AnnotationType.distortsBaseline:
    sick = true    alcohol = true    travel = true    injury = false
```

**§4.1 Filterzeile wird:**

```
.filter(!params.excludeAnnotated || !annotations.any(a →
            a.type.distortsBaseline && a.covers(date)))
```

Die Fenster-vor-Filter-Reihenfolge aus §4.1/§10.2 bleibt unverändert.

**Zeitzone (D4).** `covers` rechnete in der *aktuellen* lokalen Zone, während
Nächte in der Zone der Messung datiert werden (§7.1) — ausgerechnet bei `travel`
laufen die auseinander, und die Abdeckung einer Annotation verschiebt sich
rückwirkend, wenn der Nutzer die Zone wechselt. Die Annotation bekommt deshalb
die Zone ihrer Entstehung mit:

```
Annotation { id, type, startTs, endTs?, tzOff, note? }

covers(date):
    zone  = offset(tzOff)
    start = CivilDate.from(startTs, zone)
    end   = endTs ? CivilDate.from(endTs, zone) : +∞
    return start <= date <= end
```

`tzOff` ist der UTC-Offset in Sekunden zum Zeitpunkt des Anlegens. Da das
Feature noch nicht gebaut ist, kostet die Spalte nichts.

**Offene Annotationen (B6).** Ein fehlendes `endTs` deckt weiterhin bis heute —
die Regel ist richtig, sie braucht nur eine Grenze, damit eine vergessene
Markierung nicht lautlos den Score löscht:

```
OPEN_ANNOTATION_MAX_DAYS = 14

covers(date):  ... end = endTs ? CivilDate.from(endTs, zone)
                             : CivilDate.adding(OPEN_ANNOTATION_MAX_DAYS, start)
```

Nach 14 Tagen endet eine offene Annotation von selbst. Die UI soll offene
Annotationen sichtbar halten und zum Abschließen auffordern; das ist
Darstellung, die Grenze hier ist die Absicherung.

---

## 4. Statistik (D5, C2, C5)

**MAD = 0 fällt auf SD zurück (D5).** Bei ganzzahlig gerasterten Metriken —
RHR in bpm ist der Regelfall, nicht der Grenzfall — genügt es, dass über die
Hälfte der 60 Werte identisch sind, damit MAD 0 wird. Die Metrik verschwände
lautlos aus der Normalisierung, obwohl sie streut.

**§4.3 `summarise` wird:**

```
summarise(values, central, spread) -> { center, spread }:
    if values.isEmpty:  return { 0, 0 }

    center = central == "mean" ? sum(values)/n : median(values)

    sd()  = n > 1 ? sqrt( Σ(v − center)² / (n − 1) ) : 0
    mad() = median( values.map(|v − center|) ) · MAD_TO_SIGMA

    dispersion = spread == "sd" ? sd() : mad()
    if spread == "mad" and dispersion == 0:  dispersion = sd()   // ← neu

    return { center, spread: dispersion }
```

Ist auch die SD 0, ist die Historie tatsächlich konstant und §4.2 gibt wie
gehabt `null` zurück. Das Rückgabefeld heißt `spread`, nicht `dispersion` — die
Spec benannte es unterschiedlich in Definition und Aufrufern (C2).

Unverändert bleiben: Stichproben-SD mit `n − 1`, Streuung um `center` (also bei
`central = median` um den Median), Mindestmenge vor Ausreißerverwurf, Grobpass
immer mit mean/sd, `count` nach dem Verwurf.

**Signaturen (C2).** §5.1 übergibt die innere Map, §4.1/§4.2 deklarieren
`series`. Verbindlich ist die innere Map:

```
history(values: Map<CivilDate, number>, metric, referenceDate, params, annotations)
stats  (values: Map<CivilDate, number>, metric, referenceDate, params, annotations)
```

**Summationsreihenfolge (C5).** `history` liefert absteigend nach Datum, und in
dieser Reihenfolge wird summiert. Damit ist der Golden-File-Vergleich auch für
Zwischenwerte bitgleich reproduzierbar. Toleranz in Tests: Score exakt (Integer),
Gleitkomma-Zwischenwerte relativ 1e-12.

---

## 5. Parameter, Modelle, Einstellungen (B2, B3, B4, D10, D11, D13)

**§5.1 `effective = copy(params)` ist eine tiefe Kopie (B2).** `logTransform`
muss geklont werden. In TypeScript teilt `{...params}` das `Set`, und
`effective.logTransform.add(hrv)` würde das `handoff`-Preset nach dem ersten
`rec`-Score dauerhaft verändern — inklusive aller später berechneten `z`- und
`slp`-Scores. Swift versteckt das hinter Value Semantics; hier ist es ein
stiller, persistenter Fehler.

```
effective = { ...params, logTransform: new Set(params.logTransform) }
```

**`custom` friert das Verhalten mit ein (B3).** `setWeight` übernahm die
Gewichte des aktuellen Modells, nicht seine beiden Flags. Wer im `slp`-Modell
einen Regler anfasste, verlor den Sleep-Debt-Abzug; wer es im `rec`-Modell tat,
die HRV-Log-Transformation. Der Score springt ohne sichtbare Ursache — genau
das, was das Einfrieren verhindern soll.

```
EstimatorSettings {
    modelID           = "rec"
    customWeights     = { hrv: .40, rhr: .25, sleep: .25, resp: .10 }
    customUsesLogHRV       = false        // ← neu
    customAppliesSleepDebt = false        // ← neu
    params            = handoff
}

setWeight(value, metric):
    if modelID != "custom":
        customWeights          = model.weights ?? customWeights
        customUsesLogHRV       = model.usesLogHRV
        customAppliesSleepDebt = model.appliesSleepDebt
        modelID = "custom"
    customWeights[metric] = max(0, value)
```

Das `custom`-Modell liest seine beiden Flags aus den Settings. Sobald `custom`
aktiv ist, sollen beide als Schalter sichtbar sein — sie sind dann Nutzerbesitz,
kein verstecktes Erbe.

**`usesLogHRV = false` heißt „erzwingt es nicht" (D13).** Mit dem
`robust`-Preset ist HRV auch im `z`-Modell log-transformiert, weil das Preset
`logTransform = {hrv}` mitbringt. Die Tabelle in §6 liest sich wie eine
Eigenschaft des Modells; sie ist eine Vereinigung mit den Parametern. Ein Satz
in §6 stellt das klar.

**Kein Gewicht gesetzt ist nicht „zu wenig Daten" (B4).** Vier Nullen sind über
`setWeight` erreichbar und führten zu `usableWeight = 0` und damit zum Label
„NOT ENOUGH DATA", obwohl die Datenlage tadellos ist. Statt den Regler zu
beschneiden — ein Slider, der nicht auf 0 geht, wirkt defekt — wird das Ergebnis
ehrlich:

```
ScoreResult.unavailableReason:  null | "insufficient_data" | "no_weights"

if totalWeight <= 0:   reason = "no_weights",        score = null
else if usableWeight <= 0:  reason = "insufficient_data",  score = null
```

Das Label „NOT ENOUGH DATA" gilt nur für `insufficient_data`. Für `no_weights`
zeigt die UI eine Aufforderung, mindestens eine Metrik zu gewichten. Die
Fallunterscheidung gehört in die Logik, weil sie aus den Gewichten folgt, nicht
aus der Darstellung.

**`droppedWeight` bekommt einen Anteil dazu (D11).** Bei den Presets summieren
die Gewichte auf 1.0, der Rohwert liest sich also als Anteil; bei `custom` sind
es Rohwerte beliebiger Summe. Damit die Anzeige nicht selbst teilen muss:

```
droppedWeight          = totalWeight − usableWeight        // unverändert
droppedWeightFraction  = totalWeight > 0 ? droppedWeight / totalWeight : 0
```

**`version` wird zu zwei Feldern (D10).** Ein Literal pro Preset kann nicht
leisten, was §3 verspricht: Ein modifiziertes `handoff` trägt weiterhin
`version: 1`, ein Recompute unterscheidet die beiden nicht.

```
logicVersion = 1                    // steigt, wenn sich der Algorithmus ändert
paramsFingerprint(params) -> string:
    "c=" + central + ";s=" + spread
  + ";log=" + [...logTransform].sortedBy(displayOrder).join(",")
  + ";ann=" + (excludeAnnotated ? 1 : 0)
  + ";w="   + window
  + ";out=" + (outlierReject ? 1 : 0)
```

Beides wandert mit jedem abgeleiteten Wert in die Datenbank. Der Fingerprint
ist eine kanonische Zeichenkette, kein Hash — lesbar im Debugger und ohne
Abhängigkeit. Die Feldnamen `version` in den Presets entfallen.

---

## 6. Stichtag (B5)

Die Spec definiert nirgends, woher `date` kommt — **das Original schon**, nur
außerhalb der Domänenschicht. `TodayViewModel.reload()` löst den Stichtag auf,
mit genau der Begründung, die ich im Review vermutet hatte: „Der Stichtag ist
der jüngste Tag, für den überhaupt etwas vorliegt — nicht ‚heute'. HRV und
Schlaf entstehen morgens; vor dem ersten Sync des Tages wäre ‚heute' schlicht
leer." Die Entscheidung besteht also darin, das aus dem ViewModel in die
Rechenschicht zu ziehen und zwei Lücken zu schließen.

```
REFERENCE_ANCHORS = [hrv, sleep, rhr]

resolveReferenceDate(series, now, tz) -> { date, daysStale }:
    today  = CivilDate.from(now, tz)
    latest = max über REFERENCE_ANCHORS von max(series[metric].keys)   // keine Daten → null
    date   = latest == null ? today : min(latest, today)
    return { date, daysStale: CivilDate.days(date, today) }
```

**Der Anker bleibt bei drei Metriken, nicht fünf.** Das Original wählt bewusst
`hrv`, `sleep`, `rhr` — die Größen, die jeden Morgen zuverlässig ankommen. Über
alle fünf zu maximieren wäre ein Rückschritt: Ein Tag, an dem nur `temp`
vorliegt, würde zum Stichtag, obwohl `temp` in keinem Modell ein Term ist —
Ergebnis wäre „NOT ENOUGH DATA" an einem Datum, das Daten hat. Meine erste
Fassung dieses Dokuments hatte genau diesen Fehler.

`ScoreResult` führt `referenceDate` und `daysStale` mit. Die Logik verschiebt
den Stichtag also auf den jüngsten Tag mit Daten, verschweigt aber nie, wie alt
er ist — ab wann daraus ein Hinweis wird („Stand: gestern", „letzte Messung vor
4 Tagen"), entscheidet die Darstellung. Kein Schwellwert in der Rechenschicht.

Gibt es überhaupt keine Daten, ist der Stichtag heute und das Ergebnis
`insufficient_data` — korrekt, statt auf einem erfundenen Datum zu rechnen.

`min(latest, today)` verhindert, dass ein Gerät mit falscher Uhr in die Zukunft
datiert und `history` (`date < referenceDate`) versehentlich die gesamte
Historie einschließt.

---

## 7. Kalenderarithmetik und Reihen (C1, D9, E)

**§8 `spanInDays` rechnete mit Epoch-Sekunden** — genau das, was §10.8 für
diese Funktion namentlich verbietet. Über eine DST-Grenze fehlt eine Stunde und
die Ganzzahldivision schneidet einen Tag ab.

```
spanInDays(metric):
    keys = series[metric].keys
    if keys.isEmpty:  return 0
    return CivilDate.days(min(keys), max(keys)) + 1
```

Damit hat `days()` aus §1.1 auch seinen Aufrufer.

**§8 `points` hängt am Stichtag, nicht am letzten Datenpunkt (D9).** `latest =
max(keys)` ließ Diagramm und Score auf verschiedenen Tagen enden.

```
points(metric, days, referenceDate) -> SeriesPoint[]:
    earliest = CivilDate.adding(−(days − 1), referenceDate)
    ...
```

`referenceDate` ist derselbe Wert wie im Score (§6 dieses Dokuments). `id`
bleibt die Position in der gezeichneten Reihe.

**`adding` und `days` sind nicht optional.** Die Optionalität in §1.1 ist ein
Swift-Artefakt (`Calendar.date(byAdding:)`). Die `?? date`- und
`if date == null`-Zweige in §5.3 und §7.4 sind toter Code und werden nicht
mitportiert.

---

## 8. Schlaf (C4, D6, D7, D8, N1–N3)

### 8.0 Die API liefert Zahlen als Strings (N1)

Der wichtigste Befund aus den echten Daten. Das `summary` des echten Kontos:

```json
"summary": { "minutesAsleep": "482", "minutesInSleepPeriod": "489",
             "minutesAwake": "7", "minutesToFallAsleep": "0",
             "minutesAfterWakeUp": "0", "stagesSummary": [ … ] }
```

**Alle Zahlen sind Strings.** Die Spec schreibt `minutesAsleep =
payload.summary.minutesAsleep`, als wäre es eine Zahl. Im Original fällt das
nicht auf, weil `JSONValue.double` den String konvertiert
(`Decoding.swift:93`). `spike/verify_estimator.py` fällt darüber **um** — es
stürzt auf dem echten Konto mit `unsupported operand type(s) for /: 'str' and
'int'` ab und läuft nur auf den synthetischen Daten, deren Seed `Int` schreibt.

Für einen TS-Port ist das die gefährlichste Stelle der ganzen Schicht, weil
JavaScript sie **fast** überall verdeckt:

| Ausdruck | mit `"482"` | Ergebnis |
|---|---|---|
| `minutesAsleep / 60` | `"482" / 60` | 8.03 — richtig, durch Koersion |
| `minutesInSleepPeriod > 0` | `"489" > 0` | `true` — richtig |
| `a.minutesAsleep > b.minutesAsleep` | `"482" > "89"` | **`false`** — falsch |

Die Tie-Break-Regel aus §7.2 vergleicht genau dieses Feld. Lexikografisch ist
`"482" < "89"`, also gewinnt die *kürzere* Nacht, sobald die Stellenzahl
differiert — und das tut sie hier ständig (Nickerchen mit 68 Minuten gegen
Nächte mit 482). Der Fehler wäre still und nur an falschen Schlafwerten
einzelner Tage sichtbar.

**Entscheidung:** Beim Parsen wird jedes Zahlenfeld durch dieselbe Koersion
geschickt, die auch §1 verwendet, und das Ergebnis ist eine `number` oder
`null` — nie ein String:

```
num(v):  v ist string ? parseFloat(v) : v
         isFinite(result) ? result : null
```

Gilt für `minutesAsleep`, `minutesInSleepPeriod`, `minutesAwake`,
`minutesToFallAsleep` und jedes später hinzukommende Feld. `minutesAsleep`
bleibt Pflichtfeld: `null` verwirft die Nacht.

### 8.1 Nickerchen tragen `mainSleep: true` (N2)

§7.2 begründet die Hauptnacht-Auswahl damit, dass „Nickerchen die Schlafdauer
der Nacht nicht verfälschen" dürfen, und verlässt sich dafür auf `mainSleep`.
**Das Feld leistet das nicht.** Aus den 20 Sessions des echten Kontos:

```
20260618   2.27 h  main=True   CLASSIC
20260720   1.07 h  main=True   CLASSIC
20260724   1.08 h  main=True   CLASSIC   (eine einzige Stage)
20260807   1.78 h  main=True   STAGES
20260718   1.13 h  main=None   CLASSIC   ← neben einer echten Nacht mit 5.20 h
```

An vier dieser Tage ist das Nickerchen die **einzige** Session, hat also keinen
Konkurrenten, den die Rangfolge schlagen könnte, und wird zur Schlafdauer des
Tages. Die Folge ist messbar:

| | Nächte | n | center | spread | Normalband |
|---|---|---|---|---|---|
| wie spezifiziert | 19 | 18 | 5.74 h | 2.65 h | 3.1–8.4 h |
| mit Mindestdauer 3 h | 15 | 14 | 6.94 h | 1.48 h | 5.5–8.4 h |

„Dein Normalbereich: 3,1 bis 8,4 Stunden" ist keine Aussage. Die Streuung ist
fast doppelt so groß wie sie sein müsste, und weil `spread` im Nenner des
z-Werts steht, dämpft sie jede echte Schlafabweichung.

**Entscheidung: Mindestdauer von 3 Stunden für die Hauptnacht.**

```
MAIN_SLEEP_MIN_HOURS = 3.0

mainNightsByDate(nights):
    Kandidaten mit hoursAsleep >= MAIN_SLEEP_MIN_HOURS
    danach Rangfolge wie §2 dieses Dokuments
```

Die Grenze liegt in einer echten Lücke der Daten — die Sessions verteilen sich
auf 1.07/1.08/1.13/1.78/2.27 h einerseits und 4.05 h aufwärts andererseits. Sie
ist damit nicht frei gewählt, sondern abgelesen.

**Zwei Dinge dazu ausdrücklich:** Erstens ist das eine **bewusste Abweichung vom
Original**, keine Portierungstreue — der Swift-Code kennt die Grenze nicht, die
Zahlen ändern sich. Zweitens fällt `n` dadurch auf exakt 14, also genau auf
`MINIMUM_SAMPLES`. Eine Nacht weniger und `sleep` verschwindet aus der
Normalisierung. Das ist kein Argument gegen die Grenze — mit 18 unbrauchbaren
Werten zu rechnen ist nicht besser als mit 14 brauchbaren —, aber es gehört in
die Release-Notizen, und der Fall „Konto knapp unter der Mindestmenge" ist
damit real und nicht mehr nur theoretisch.

### 8.2 CLASSIC-Nächte haben keine Phasen (N3)

Der Session-`type` unterscheidet `STAGES` und `CLASSIC`; die Spec kennt das Feld
nicht. Die Phasenbezeichnungen unterscheiden sich mit:

```
STAGES   →  AWAKE (109)  DEEP (64)  LIGHT (196)  REM (93)
CLASSIC  →  ASLEEP (13)  AWAKE (13)
```

`ASLEEP` steht in keiner Abbildung aus §7.3 und wird damit zu `unknown`, also
verworfen. Für eine CLASSIC-Nacht ergibt `minutes(in:)` folglich **0 für deep,
rem und core** — und diese Nullen wandern in den 30-Nächte-Median aus §7.4 und
ziehen ihn nach unten. Bei fünf CLASSIC-Nächten unter zwanzig ist das kein
Randeffekt.

**Entscheidung:** `ASLEEP` wird **nicht** auf `core` abgebildet — das würde
undifferenzierten Schlaf als Leichtschlaf ausgeben. Stattdessen fallen Nächte
ohne Phasendetail aus der Phasenstatistik heraus:

```
SleepNight.hasStageDetail =  stages.any(kind ∈ {AWAKE, LIGHT, DEEP, REM})

SleepAnalysis.median(stage, window):
    nur Nächte mit hasStageDetail berücksichtigen
```

Ihre Dauer zählt weiter (`hoursAsleep` kommt aus dem `summary`, nicht aus den
Phasen), nur ihre Phasenverteilung wird nicht behauptet. Das Hypnogramm einer
CLASSIC-Nacht ist ohnehin durchgehend `null` — die UI muss dafür einen Zustand
haben.

### 8.3 Die übrigen Punkte

**Eine Quelle für das Schlafdefizit (C4).** §5.3 summierte über
`series[sleep]` (positiv gefiltert), §7.4 über `nights[date].hoursAsleep`
(ungefiltert) — eine Nacht mit 0 h wäre im Screen ein Defizit von 7,6 h und im
Score eine 0. `sleepDebt` wird auf `debtNights` zurückgeführt:

```
debtNights(series, referenceDate) -> DebtNight[]:
    earliest = CivilDate.adding(−6, referenceDate)
    für offset in 0..<7:
        date = CivilDate.adding(offset, earliest)
        if date > referenceDate:  überspringen
        yield { id: offset, date, hoursAsleep: series[sleep][date] }   // null = Lücke

DebtNight.shortfallHours = hoursAsleep == null ? 0 : max(0, SLEEP_NEED_HOURS − hoursAsleep)
DebtNight.isRecorded     = hoursAsleep != null

sleepDebt(series, date) = Σ debtNights(series, date).shortfallHours
```

Beide lesen jetzt `series[sleep]`, also dieselbe gefilterte Reihe. Der Literal
`7.6` in §7.4 verweist auf `SLEEP_NEED_HOURS`. Tage ohne Aufzeichnung tragen
weiterhin nichts bei.

**`efficiency` erfindet keine 100 % (D6).** `minutesInSleepPeriod ??
minutesAsleep` ergab bei fehlendem Feld exakt 1.0 — eine erfundene Zahl an
genau der Stelle, an der §5.5 keine erfundenen Zahlen verlangt.

```
minutesInSleepPeriod = payload.summary.minutesInSleepPeriod    // fehlt → null
efficiency = minutesInSleepPeriod > 0 ? minutesAsleep / minutesInSleepPeriod : null
```

`hoursAsleep` bleibt von `minutesAsleep` abhängig, die Nacht wird also nicht
verworfen.

**`proportion` unterscheidet „keine Referenz" von „null" (D7).**

```
proportion = medianMinutes == null || medianMinutes <= 0
                 ? null
                 : min(1, minutes / (medianMinutes · 2))
```

Bei `null` zeichnet die UI keine Leiste statt einer leeren.

**`minutes(in stage)` bekommt einen Guard (D8).**

```
minutes(in stage) = Σ über stages mit passender Abbildung und end > start
                      von (end − start) / 60
```

Ergänzend festgehalten: `unknown`-Abschnitte zählen in keiner Phase mit, die
vier Phasenzeiten summieren sich also **nicht** auf die Sessiondauer. Eine
Darstellung, die sie auf 100 % stapelt, wäre falsch.


### 8.4 Der Schlafterm ist die Nachtnote, nicht die Dauer (Pumped-Abweichung)

**Nicht aus der Spec.** Der Handoff kennt genau einen Schlafterm, `sleep` =
Stunden im Schlaf. Tiefschlaf steht als `deep` daneben und ist in **keinem**
Modell gewichtet; REM und Effizienz kommen im Estimator gar nicht vor, obwohl
die Quelle alle drei liefert. Der Score urteilte damit über eine Nacht allein
nach ihrer Länge.

Pumped ersetzt den Term durch die **Nachtnote** aus §8.5 — in allen drei festen
Modellen, mit demselben Gewicht, das vorher die Dauer trug:

```
z:    hrv 0.40  rhr 0.25  sleepScore 0.25  resp 0.10
rec:  hrv 0.60  rhr 0.20  sleepScore 0.15  resp 0.05
slp:  hrv 0.25  rhr 0.15  sleepScore 0.50  resp 0.10   (+ Defizit-Abzug)
```

**Ersetzt, nicht ergänzt.** Dauer und Tiefschlaf gehen in die Note ein; als
eigene Terme daneben zählten sie zweimal. Beide wandern deshalb nach
`UNWEIGHTED_METRICS` und erscheinen als Beobachtung ohne Gewicht — gemessen und
sichtbar, aber nicht doppelt verrechnet.

**Als z-Wert gegen die eigene Baseline**, wie jeder andere Term. Die Alternative
wäre gewesen, die Note absolut einzurechnen (`z = (Note − 50) / 16`, die
Umkehrung der Score-Formel). Dagegen sprach die Einheitlichkeit: Jede Zeile der
Karte „What went into it" trägt die Überschrift „vs 60-day baseline", und ein
einzelner Term ohne Baseline und ohne Normalspanne machte sie zur Halbwahrheit.

Der Preis ist bekannt und in Kauf genommen: Wer **gleichbleibend** schlecht
schläft, landet bei z ≈ 0, und der Schlaf zieht seine Readiness nicht herunter.
Für die absolute Untergrenze ist der Defizit-Term zuständig, den `slp` führt.

Die Reihe ist **abgeleitet, nicht gespeichert** — `buildMetricSeries` rechnet
sie aus den Nächten, nachdem die Nachtkarte vollständig ist (jede Note braucht
die Phasenmediane der vorherigen Nächte). Ändert sich die Formel, ändern sich
rückwirkend alle Werte. Das ist gewollt: Eine Baseline, die zwei Rechnungen
mischt, wäre keine.

`sleepScore` bekommt **keine** `MetricId` — in der Rohschicht steht nichts davon,
und das Vokabular der gespeicherten Größen bleibt unberührt.

---

## 9. Totes und lebendes Beiwerk (E)

- **`correlation` (§4.5) bleibt — E war insoweit falsch.** Sie ist nicht tot,
  die Spec hat nur ihre Aufrufer verschwiegen: `TrendsViewModel.relationships`
  und der Metrik-Detailscreen. Die fehlende Paarungslogik wird nachgetragen,
  siehe §9.1.
- **`smallestWorthwhileChange` (§4.4)** bleibt und wird zur einzigen Quelle der
  0.5: `exceedsWorthwhileChange = z != null && |z| >= WORTHWHILE_Z` mit
  `WORTHWHILE_Z = 0.5` und `smallestWorthwhileChange(stats) = WORTHWHILE_Z ·
  stats.spread`. Vorher stand die Konstante an zwei Stellen.
- **`minutesAwake`, `minutesToFallAsleep` (§7.1)** werden weiter geparst,
  aktuell aber von nichts gelesen. Bewusst behalten — der Schlaf-Screen wird
  sie brauchen.
- **`Metric.lowerIsBetter`** entfällt, es ist `direction == −1`.

### 9.1 `relationships` — die fehlende Hälfte von §4.5

Die Spec definiert `correlation`, aber nicht, worüber korreliert wird. Aus dem
Original nachgetragen und damit Teil der Rechenschicht:

```
CORRELATION_MIN_PAIRS = MINIMUM_SAMPLES      // 14, nicht die 3 aus §4.5

relationships(series, metric, range, referenceDate) -> Relationship[]:
    last  = referenceDate
    first = CivilDate.adding(−(range − 1), last)
    own   = series[metric].filter(first <= date <= last)

    für other in Metric.displayOrder, other != metric:
        theirs = series[other]
        pairs  = own.sortedBy(date ASC)                    // ← Reihenfolge festgelegt
                    .filter(theirs.has(date))
                    .map(date → { x: own[date], y: theirs[date] })
        r = pairs.length >= CORRELATION_MIN_PAIRS ? correlation(pairs) : null
        yield { metric: other, r, count: pairs.length }

    sortiert nach |r| absteigend, r == null ans Ende
```

Drei Dinge, die nicht offensichtlich sind und deshalb hier stehen:

- **Nur Tage, an denen beide gemessen haben.** Ein fehlender Wert bekommt keinen
  Partner untergeschoben.
- **Zwei verschiedene Mindestmengen.** `correlation` selbst gibt unter 3 Paaren
  `null` zurück; der Aufrufer verlangt 14. Die 14 ist die maßgebliche Schwelle,
  die 3 nur die mathematische Untergrenze.
- **Sortierung:** `|r|` absteigend, `null` zuletzt. Nicht `abs(r ?? −1)` mit
  vorgeschaltetem Default — das macht aus „unbekannt" eine 1 und stellt die
  Zeile ohne Zahl an die Spitze.

Die Paarreihenfolge wird auf **Datum aufsteigend** festgeschrieben. Das Original
iteriert ein Dictionary, die Summationsreihenfolge in `correlation` ist damit
nicht reproduzierbar (siehe C5).

Der Stichtag ist hier **enthalten** — wie bei `SeriesSummary` (§8 der Spec) geht
es um die Verteilung, nicht um eine Referenz, gegen die bewertet wird.

---

## 10. §5.2 `observation` (D12)

Geltungsbereich wird festgeschrieben: `observation` gilt **nur für Metriken, die
nicht in den Gewichten des aktiven Modells vorkommen** — heute ausschließlich
`temp`. Sie verwendet dieselben `effective` Parameter wie `score`, inklusive
`usesLogHRV`. Die Ausnahme aus §5.2 entfällt: Sie ist für `temp` ohnehin
wirkungslos und würde nur dann greifen, wenn `observation` für `hrv` aufgerufen
würde — wo sie der Contribution-Zeile desselben Screens widerspräche.

`weight = 0` bleibt. `Contribution.contributes` bleibt `z != null`; für eine
Observation ist die Aussage „hat einen z-Wert", nicht „geht in den Score ein".

---

## 11. Prüfung (A1, A2, C5, F)

### 11.1 Welche Datei das Golden-File ist — §11 der Spec zeigt auf die falsche

Die Spec verlangt einen Export „mit echten 67 Tagen — inklusive der
RMSSD-Nullen, der `"NaN"`-Temperaturen und der Lücken, die synthetische Daten
nicht haben". **Diese Datei gibt es nicht.** Auf den Simulatoren liegen drei
Datenbanken, und die 67-Tage-Datei ist gerade die synthetische:

| Container | Umfang | Was es ist |
|---|---|---|
| `7AD1B28A…` | 0 Zeilen | nur Schema, Migration `v1-raw`, nie synchronisiert |
| `8FE23202…` | 270 daily / 67 sessions | **`PreviewSeed`** — `-seedPreview` |
| `E3B3588F…` | 159 daily / 20 sessions | **das echte Konto** |

`PreviewSeed.swift` ist eindeutig: `days = 67`, `today = 20260809`,
`SplitMix(seed: 20260809)`, `hrvAverage = hrvDeep · 1.18`, und die
Hauttemperatur „hat mit Absicht nur zwei Werte". Genau das steht in der
Datenbank. Die Payloads bestätigen es — dem Seed fehlen `createTime`,
`externalId` und die Bruchteilsekunden, die das echte Konto trägt.

Der Seed hat damit **keine** der Eigenschaften, für die §11 ihn haben will: 67
von 67 Tagen bei jeder Metrik, keine Lücke, kein einziger nicht-positiver Wert,
kein `"NaN"`. Gegen ihn zu verifizieren würde keinen einzigen Fall aus §10
prüfen.

**Entscheidung: beide Dateien, mit verschiedenen Rollen.**

- **`recent20`** (echtes Konto) ist das Golden-File. Es trägt die 40 RMSSD-Nullen
  auf 43 Tagen aus §2.1, die Lücken (38 RHR- und 24 Resp-Tage auf 58
  Kalendertagen), die Kollision am 20260718, die Nickerchen aus §8.1, die
  CLASSIC-Nächte aus §8.2 und die String-Zahlen aus §8.0.
- **`golden67`** (Seed) ist die zweite Fixture und deckt das ab, was das echte
  Konto nicht kann: Mit 67 Tagen **bindet das 60-Tage-Fenster** (`n = 60` bei
  allen vier Metriken). Mein Review hatte behauptet, das Fenster binde bei
  43–67 Tagen nie — das war für den Seed falsch.

Beide gehören ins Repo. Der Seed ist reproduzierbar (fester SplitMix-Seed), das
echte Konto muss als Datei mit.

### 11.2 Was bereits verifiziert ist

Gegen `spike/verify_estimator.py` und eine unabhängige Vollimplementierung der
Spec (alle fünf Metriken, Positiv-Filter, HRV-Merge, drei Modelle,
Stichtagsauflösung) geprüft:

```
golden67, Modell rec:   hrv z=+1.2675  rhr z=−0.1156  sleep z=−1.2840
                        resp z=−1.1345   Σw·z=+0.48808   S = 58
```

Beide Seiten liefern **dieselben Zahlen bis auf die letzte gedruckte Stelle**.
Der Kern der Formel — Fensterung, Stichtagsausschluss, Stichproben-SD,
Renormalisierung, Richtungsumkehr, Klemmung — ist damit dritt-bestätigt.

Weiter bestätigt am echten Konto:

- **§10.1 stimmt zahlenmäßig.** Ohne Positiv-Filter läge die HRV-Baseline bei
  rund 5 statt 78,6 ms; die Spec sagt „10 statt 80". Größenordnung und Aussage
  halten.
- **Der HRV-Rückfall ist nicht optional.** Von 43 Tiefschlafwerten sind 40 eine
  0. Ohne den Rückfall auf `hrvAverage` bleiben drei Werte, `hrv` fiele unter
  die Mindestmenge und damit als schwerstgewichtete Metrik komplett aus dem
  Score — im `rec`-Modell 60 % der Gewichtung.
- **`temp` hat 3 Werte, Baseline `n = 2`.** In beiden Datensätzen bleibt die
  Observation ohne Baseline. Der `temp`-Pfad ist praktisch ungetestet und lässt
  sich nur synthetisch prüfen.

### 11.3 Der Umfang des Python-Skripts

Damit niemand mehr davon erwartet, als es leistet: Es rechnet **nur** das
`rec`-Modell mit `handoff`-Parametern, kennt weder `temp` noch Annotationen noch
Ausreißerverwurf, verwendet ausschließlich `hrvDeepSleep` ohne den Rückfall auf
`hrvAverage`, filtert nicht-positive Werte nur beiläufig über den Log-Guard —
und stürzt auf dem echten Konto ab (§8.0). Als dritte Meinung zum Kern der
Formel ist es gültig, als Abdeckung nicht. Der Swift-Code ist die Referenz, das
Skript die Gegenprobe.

### 11.4 Fallliste

**Die Kennzahlen im Fließtext sind illustrativ, nicht normativ (A2).** „40 von
43 Tagen" (§2.1), „20 Nächte auf 57 Tagen" (§5.3) und „67 Tage" (§11) können
nicht aus demselben Export stammen. Sie taugen als Begründung, nicht als
Erwartungswert.

**Ergänzungen zur Fallliste in §11:**

| Fall | Erwartung |
|---|---|
| `"NaN"` erreicht die Rechenschicht | fällt über `isFinite` heraus, Nachbartage unberührt |
| `outlierReject = true` | Grobpass mean/sd auch bei `robust`; `count` sinkt, Mindestmenge greift vorher |
| MAD = 0 bei streuender Historie | Rückfall auf SD, Metrik zählt weiter |
| Historie konstant, `spread = mad` | `stats == null` (SD ebenfalls 0) |
| Alle Gewichte 0 | `score == null`, `unavailableReason == "no_weights"`, **nicht** „NOT ENOUGH DATA" |
| `setWeight` im `slp`-Modell | `custom` behält `appliesSleepDebt == true` |
| `setWeight` im `rec`-Modell | `custom` behält `usesLogHRV == true` |
| Zwei Scores nacheinander, `handoff` dann `rec` | `handoff.logTransform` bleibt leer (tiefe Kopie) |
| `injury`-Annotation, `excludeAnnotated` | Historie **unverändert** |
| `sick`-Annotation, `excludeAnnotated` | genau diese Tage fehlen, kein Nachrücken |
| Offene Annotation, 30 Tage alt | deckt nur 14 Tage ab |
| Stichtag ohne Daten, gestern mit Daten | `referenceDate == gestern`, `daysStale == 1`, Score vorhanden |
| Gerät datiert in die Zukunft | `referenceDate == heute`, Historie nicht überdehnt |
| `spanInDays` über eine DST-Grenze | Kalendertage, keine Stunde verloren |
| Nacht mit 0 h Schlaf | in Score und Schlaf-Screen identisch behandelt |
| Stage mit `end < start` | trägt 0 Minuten bei, kein Abzug |
| Zwei DEEP-Abschnitte in einer Hypnogramm-Säule | addieren sich, DEEP kann gewinnen |
| Historie > 60 Tage mit Annotationen | Fenster greift vor dem Annotationsfilter (§10.2) |
| `relationships` mit 13 gemeinsamen Tagen | `r == null`, `count == 13`, Zeile ans Ende sortiert |
| `relationships`, eine Reihe konstant | `r == null`, nicht 0 |
| `relationships` zweimal aufgerufen | bitgleiches `r` (Paare nach Datum sortiert) |
| `minutesAsleep` als String `"482"` | wird zu `482`, nirgends ein String im Ergebnis |
| Tie-Break `"482"` gegen `"89"` | die **längere** Nacht gewinnt, nicht die lexikografisch größere |
| Session mit 1.07 h als einzige des Tages | zählt nicht als Nacht (Mindestdauer 3 h) |
| 20260718: 1.13 h ohne `mainSleep` neben 5.20 h | 5.20 h gewinnt |
| CLASSIC-Nacht mit `ASLEEP`-Phasen | Dauer zählt, Phasenmedian ignoriert die Nacht |
| Seed-Fixture, 67 Tage | `n == 60` bei allen vier Metriken — das Fenster bindet |
| Echtes Konto, Modell `rec` | HRV zählt mit `n = 42` (Rückfall auf `hrvAverage` greift) |

Der letzte Fall braucht eine **synthetische** Fixture: Mit 43–67 realen Tagen
bindet das 60-Tage-Fenster nie, §10.2 bliebe durch den Golden-File ungeprüft.

---

## 12. Die Quellengrenze — was der Port vom Adapter erbt

Google Health ist nicht die einzige denkbare Quelle, und das Original hat die
Grenze bereits gezogen: `HealthSource` (Protokoll), `SourceID`,
`SourceDescriptor`, `RawBatch`, `SourceRegistry`. Die Regel dort lautet, dass
alles Quellenspezifische — „Anmeldung, Endpunkte, Feldnamen, Paginierung,
Zeitformate" — hinter der Grenze bleibt und oberhalb nur noch `MetricID`,
`FieldID` und `RawBatch` bekannt sind. Diese Aufteilung wird übernommen.

Drei Festlegungen daraus, die für die Rechenschicht gelten:

- **`MetricID`/`FieldID` sind das neutrale Vokabular.** Sie werden nicht neu
  vergeben (§1.3 der Spec). Eine zweite Quelle bildet auf dieselben Kennungen
  ab, statt eigene mitzubringen.
- **Eine Quelle mit weniger Metriken ist kein Fehlerfall.** `HealthSource.metrics`
  sagt, was sie liefern kann; der Rest fehlt schlicht. Die Rechenschicht ist
  darauf schon eingerichtet — fehlende Metriken fallen aus der Normalisierung
  (§5.1), nicht mit Null hinein. Eine Quelle ohne Atemfrequenz ergibt also einen
  gültigen Score aus drei Termen.
- **Genau eine Quelle ist aktiv, ein Wechsel räumt die Rohschicht.** Alle
  schreiben in dieselben Tabellen und teilen sich den Primärschlüssel; zwei
  aktive Quellen überschrieben einander still. Diese Regel wird mitportiert.

### 12.1 Wo die Grenze heute leckt: `raw_session.payload`

Für Tageswerte hält die Grenze — `raw_daily.value` ist ein `REAL`, das Format
der Quelle ist beim Schreiben verschwunden. **Für Schlaf hält sie nicht.**
`raw_session.payload` ist der unveränderte Vendor-JSON, und
`SleepNight.init(row:)` liest ihn in der Domänenschicht direkt aus:

```
payload.summary.minutesAsleep          ← Google-Feldname, Wert als String
payload.interval.endTime               ← Google-Struktur
payload.metadata.mainSleep             ← Google-Struktur
payload.stages[].type ∈ {AWAKE, LIGHT, DEEP, REM}   ← Google-Vokabular
                        + ASLEEP bei CLASSIC        ← unbehandelt (§8.2)
```

Damit kennt die Domäne das Antwortformat einer bestimmten Quelle — genau das,
was der Adapter verhindern soll. Eine zweite Quelle (HealthKit, Oura, Garmin,
ein CSV-Import) hätte eine andere Schlafstruktur, und `parseSleepNight` müsste
pro Quelle verzweigen. Es ist auch kein theoretisches Problem: Die drei Befunde
aus §8.0, §8.2 und die Zeitzonenlogik aus §7.1 sind allesamt Google-Eigenheiten,
die heute in der Rechenschicht sitzen.

**Entscheidung: Der Adapter normalisiert Schlafsessions vor dem Schreiben.**

```
SleepSessionRow {
    metric, startTs, endTs, tzOff              // wie bisher
    normalized: {                              // neutrales Schema, vom Adapter erzeugt
        minutesAsleep:        number           // bereits Zahl, nie String
        minutesInSleepPeriod: number | null    // null, wenn die Quelle es nicht kennt
        minutesAwake:         number | null
        minutesToFallAsleep:  number | null
        isMain:               bool | null
        hasStageDetail:       bool
        stages: [{ kind: "deep"|"rem"|"core"|"awake", startTs, endTs }]
    }
    sourcePayload: string | null               // Vendor-JSON, nur für Herkunft/Debug
}
```

Was dadurch wohin wandert:

| Befund | heute | künftig |
|---|---|---|
| §8.0 Zahlen als Strings | Domäne | **Adapter** — Google-Eigenheit |
| §8.2 `ASLEEP` / CLASSIC | unbehandelt | **Adapter** — bildet auf `core` ab oder setzt `hasStageDetail = false` |
| Phasenvokabular `LIGHT → core` | Domäne | **Adapter** |
| §7.1 Zivildatum aus `tzOff` | Domäne | **Domäne** — Kalenderregel, nicht Quellenformat |
| §8.1 Mindestdauer 3 h | — | **Domäne** — Produktregel, gilt für jede Quelle |
| §7.2 Hauptnacht-Auswahl | Domäne | **Domäne** |

Die Trennlinie ist: *Wie heißt das Feld und in welchem Typ kommt es* gehört zum
Adapter, *was bedeutet der Wert für die Auswertung* gehört zur Domäne.

`sourcePayload` bleibt erhalten, weil die Herkunftsanzeige (`Metric.origin`,
`HealthSource.facts`) davon lebt — aber die Rechenschicht rührt ihn nicht mehr
an. Nebenbei löst das einen zweiten Geruch: `Metric.origin.note` behauptet heute
in der Domäne Google-Spezifika („the API returns 0 for nights it never
computed"), obwohl `HealthSource.facts(for:fields:)` genau dafür da ist. Der
Text gehört zur Quelle.

### 12.2 Der Zuschnitt in Pumped

```
apps/frontend/src/lib/health/
  civilDate.ts        Kalenderarithmetik, Stichtagstyp
  metrics.ts          Metric, Reihenfolge, Richtung
  ids.ts              MetricId / FieldId — das neutrale Vokabular
  sources/            ADAPTERSCHICHT
    types.ts            HealthSource, RawBatch, Descriptor, State, Fact
    registry.ts         genau eine aktive Quelle, Besitz der Rohschicht
    google/             GOOGLE-ADAPTER
      config.ts           Endpunkte, Scopes, Redirect-Schema
      oauth.ts            PKCE, Consent im Systembrowser, Token-Erneuerung
      tokenStore.ts       Refresh in der Keychain, Access im Speicher
      client.ts           Paginierung, Filter, 401-/429-Behandlung
      catalog.ts          Metrik → Endpunkt/Feldnamen
      json.ts             Strings→Zahlen, "NaN", "7200s", Zivildaten
      normalizeSleep.ts   Google-Nacht → neutrales Schema
      ingest.ts           Datenpunkte → RawBatch
      googleHealthSource.ts
  stats/              HEALTH STATS
    series.ts           Reihen bauen, Stichtag, Punkte, Spanne, Zusammenhänge
  algorithms/         HEALTH ALGORITHMS
    annotations.ts, params.ts, models.ts, settings.ts,
    baseline.ts, estimator.ts, sleep.ts, sleepDebt.ts, sleepAnalysis.ts
```

Die Domäne kennt keine Endpunkte, keine Feldnamen und kein OAuth; der Adapter
kennt keine Baseline. Nur `sources/google/{oauth,tokenStore,googleHealthSource}`
fassen native Module an — alles andere läuft in einem nackten JS-Prozess, was
§11 ohnehin verlangt: Golden-File rein, Zahlen raus.

### 12.3 Stand der Prüfung

Die portierte Schicht ist gegen beide Fixtures gefahren und gegen
`spike/verify_estimator.py` sowie eine unabhängige Python-Vollreferenz
verglichen.

**Seed (67 Tage) — drei Implementierungen, identische Zahlen:**

```
[rec] S=58   hrv z=+1.2675  rhr z=−0.1156  sleep z=−1.2840  resp z=−1.1345
[z]   S=51   [slp] S=28     n=60 bei allen vier (das Fenster bindet)
```

**Echtes Konto (Stichtag 20260810):** `hrv:43  rhr:38  sleep:15  resp:24  temp:3`,
HRV zählt mit `n=42` — der Rückfall auf `hrvAverage` greift, sonst blieben drei
Werte. `temp` bleibt mit `n=2` ohne Baseline.

Die Abweichungen zur Python-Referenz gehen **restlos** auf die Mindestdauer aus
§8.1 zurück:

| | ohne Grenze | mit 3-h-Grenze |
|---|---|---|
| Nächte / `n` | 19 / 18 | 15 / 14 |
| Schlaf-Normalband | 3,1–8,4 h | 5,5–8,4 h |
| `[rec]` | 63 | 64 |
| `[slp]` | 46 | **58** |

Die 12 Punkte im Sleep-Modell sind kein Rundungseffekt: Im Defizitfenster lag
ein Nickerchen von 1,78 h (20260807). Als Nacht gelesen sind das 5,82 h Defizit
und mit `SLEEP_DEBT_FACTOR` 12,2 Punkte Abzug — für ein Nickerchen, das der
Nutzer zusätzlich zu seiner Nachtruhe gemacht hat. Genau dieser Fall ist der
Grund für die Grenze.

---

## 13. Unverändert übernommen

Zur Klarstellung, was das Review **nicht** angetastet hat: die fünf Metriken und
ihre Reihenfolge, der Positiv-Filter aus §2.1 **einschließlich `temp`** (siehe
§1), der Vorrang des Tiefschlaf-RMSSD vor dem Nachtmittel,
`MINIMUM_SAMPLES = 14`, `MAD_TO_SIGMA = 1.4826`, Fenster vor
Annotationsfilter, Stichtag nicht in der Historie, Mindestmenge vor
Ausreißerverwurf, Grobpass immer mean/sd, Stichproben-SD mit `n − 1`, Streuung
um `center`, Ausfall statt Null bei fehlender Baseline, `SCALE = 16`,
`SLEEP_NEED_HOURS = 7.6`, `SLEEP_DEBT_FACTOR = 2.1`, Klemmung auf 1…99, die
Label-Schwellen, alle Modellgewichte, Vorgabemodell `rec`, das Zivildatum der
Nacht aus der Zone der Messung, „eine Nacht pro Tag", Median statt Mittelwert
für die Phasenreferenz, sieben Kalendertage für das Defizit, `SeriesSummary`
inklusive Stichtag, sowie *runden, dann klemmen* — §10.11 ist korrekt, der
Unterschied zwischen Swift-`rounded()` und `Math.round` tritt nur bei exakt
`.5` mit negativem Wert auf und verschwindet in der Klemmung.
