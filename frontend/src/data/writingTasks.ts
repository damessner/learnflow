export interface Section {
  key: string
  label: string
  placeholder: string
  minWords: number
}

export interface PreWritingQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface WordBank {
  starters: string[]
  vocabulary: string[]
  connectors: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  grade: number
  subject: string
  typeLabel: string
  sections: Section[]
  starters: Record<string, string[]>
  draft1Socratic: Array<{ section: string; question: string; hint: string }>
  draft2Socratic: Array<{ section: string; question: string; hint: string }>
  commonSpellingErrors: { wrong: string[]; correct: string[] }
  exemplarText: string
  preWritingQuestions: PreWritingQuestion[]
  wordBank: WordBank
}

export const CURRICULUM_TASKS: Task[] = [
  // ==================== DEUTSCH ====================
  {
    id: 'de-1-brief',
    title: 'Persönlicher Brief: Postkarte aus den Ferien',
    description: 'Schreibe einen Brief an einen Freund/eine Freundin über deinen Urlaub. Berichte von deinen spannendsten Ferienerlebnissen!',
    grade: 1,
    subject: 'de',
    typeLabel: 'Brief',
    sections: [
      { key: 'intro', label: 'Anrede, Ort & Einleitung', placeholder: 'z.B.: Telfs, am 28. Mai. Lieber Lukas, ich hoffe, es geht dir gut...', minWords: 15 },
      { key: 'body', label: 'Hauptteil (Ferienerlebnisse)', placeholder: 'Berichte, was du unternommen hast, wie das Wetter war und was dir am besten gefällt...', minWords: 40 },
      { key: 'conclusion', label: 'Schluss & Abschiedsgruß', placeholder: 'z.B.: Ich freue mich schon, dich bald wiederzusehen. Viele Grüße, dein/eine...', minWords: 15 }
    ],
    starters: {
      intro: ['Liebe / Lieber...', 'Ich hoffe, es geht dir gut.', 'Ich schreibe dir heute aus...', 'Viele Grüße aus meinem Urlaub in...'],
      body: ['Am ersten Tag haben wir...', 'Das Wetter ist wirklich...', 'Ein besonderes Highlight war...', 'Es gibt hier so viel zu tun, zum Beispiel...'],
      conclusion: ['Ich wünsche dir noch schöne Ferientage.', 'Schreib mir bald zurück!', 'Herzliche Grüße', 'Bis bald, dein/deine...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Hast du den Brief mit einer passenden Anrede und dem Ausstellungsort begonnen?', hint: 'Bei einem Brief gehört rechts oben der Ort und das Datum hin (z.B. "Telfs, am 28. Mai"). Dann folgt die persönliche Anrede.' },
      { section: 'body', question: 'Könntest du deine Erlebnisse noch lebendiger beschreiben? Welche Geräusche oder Gerüche gab es?', hint: 'Benutze anschauliche Adjektive wie "sonnig", "aufregend", "wunderschön" oder "stürmisch", um deine Ferien lebendig darzustellen.' },
      { section: 'conclusion', question: 'Gibt es eine abschließende Frage an deinen Freund und einen netten Abschiedsgruß?', hint: 'Du könntest fragen: "Wie verbringst du deine Ferien?" und danach "Viele Grüße" schreiben.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Hast du Sätze, die immer mit "Und dann..." oder "Ich..." beginnen? Versuche, diese Satzanfänge abzuwechseln.', hint: 'Satzanfänge wie "Später", "Danach", "Am Nachmittag" oder "Glücklicherweise" machen deinen Brief viel spannender.' }
    ],
    commonSpellingErrors: {
      wrong: ['urlaub', 'nämlich', 'bisschen', 'daß', 'vollkommen'],
      correct: ['Urlaub', 'nämlich', 'bisschen', 'dass', 'vollkommen']
    },
    exemplarText: `Telfs, am 28. Mai.\n\nLieber Lukas,\nich hoffe, es geht dir gut. Ich schreibe dir heute aus meinem Urlaub in Italien!\n\nDas Wetter ist wirklich sonnig und warm. Am ersten Tag haben wir eine riesige Sandburg gebaut. Ein besonderes Highlight war das Eisessen am Abend. Es gibt hier so viel zu tun!\n\nIch wünsche dir schöne Ferientage. Schreib mir bald zurück!\n\nHerzliche Grüße\ndein Felix`,
    preWritingQuestions: [
      {
        question: 'Wo stehen im Brief Ort und Datum?',
        options: ['Ganz oben rechts über der Anrede', 'Ganz unten unter dem Namen', 'Mitten im Hauptteil'],
        correctIndex: 0,
        explanation: 'Ort und Datum gehören bei einem persönlichen Brief immer an den Anfang, rechts oben platziert.'
      },
      {
        question: 'Welches Wort im Hauptteil beschreibt das Wetter?',
        options: ['sonnig', 'kalt', 'windig'],
        correctIndex: 0,
        explanation: 'Im Hauptteil schreibt Felix: "Das Wetter ist wirklich sonnig und warm."'
      },
      {
        question: 'Welcher Satzanfang wird im Hauptteil verwendet, um den ersten Urlaubstag einzuleiten?',
        options: ['Am ersten Tag...', 'Lieber Lukas...', 'Ich hoffe...'],
        correctIndex: 0,
        explanation: 'Felix leitet seinen Bericht mit "Am ersten Tag..." ein, um den zeitlichen Ablauf zu verdeutlichen.'
      },
      {
        question: 'Welches Wort verbindet den Hauptteil mit der Uhrzeit der Aktivitäten?',
        options: ['am Abend', 'Italien', 'Urlaub'],
        correctIndex: 0,
        explanation: '"am Abend" ist ein zeitlicher Connector, der zeigt, wann die Aktivität stattfand.'
      }
    ],
    wordBank: {
      starters: ['Liebe', 'Lieber', 'Ich schreibe', 'Am ersten Tag', 'Herzliche Grüße'],
      vocabulary: ['Urlaub', 'Sandburg', 'Highlight', 'sonnig', 'warm'],
      connectors: ['und', 'weil', 'dann', 'am Abend', 'heute']
    }
  },
  {
    id: 'de-1-erzaehlung',
    title: 'Erlebniserzählung: Ein stürmisches Abenteuer',
    description: 'Erzähle von einem Ausflug, bei dem du überraschend in ein schweres Gewitter geraten bist. Baue einen spannenden Höhepunkt auf!',
    grade: 1,
    subject: 'de',
    typeLabel: 'Erlebniserzählung',
    sections: [
      { key: 'intro', label: 'Einleitung (Wer, Wann, Wo)', placeholder: 'Wer war dabei? Wann ging es los? Wohin habt ihr euren Ausflug gemacht?', minWords: 20 },
      { key: 'body', label: 'Hauptteil (Spannungsaufbau & Höhepunkt)', placeholder: 'Wie veränderte sich der Himmel? Welches Geräusch hat dich erschreckt? Wo habt ihr Schutz gesucht?', minWords: 50 },
      { key: 'conclusion', label: 'Schluss (Rettung & Heimkehr)', placeholder: 'Wie ging das Abenteuer aus? Wie hast du dich gefühlt, als du wieder im Warmen warst?', minWords: 20 }
    ],
    starters: {
      intro: ['An einem sonnigen Samstagvormittag...', 'Wir packten unsere Rucksäcke für eine Wanderung nach...', 'Zusammen mit meiner Familie brach ich auf, um...'],
      body: ['Plötzlich verdunkelte sich der Himmel...', 'Ein heftiger Windstoß fegte über...', 'Der erste Donner grollte laut in den Bergen...', 'Vor Angst fing mein Herz an zu klopfen...'],
      conclusion: ['Zum Glück sahen wir eine kleine Hütte...', 'Als wir endlich müde, aber sicher zu Hause ankamen...', 'Dieses Erlebnis werde ich so schnell nicht vergessen.']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Ist die Einleitung spannend genug, um den Ausflug lebendig zu starten?', hint: 'Nenne die Beteiligten und das Ausflugsziel klar, um die Ausgangslage zu klären.' },
      { section: 'body', question: 'Gibt es einen klaren Höhepunkt im Hauptteil, bei dem die Gefahr am größten war?', hint: 'Nutze kurze Sätze, um die Hektik beim Aufziehen des Sturms darzustellen.' },
      { section: 'conclusion', question: 'Wird am Ende beschrieben, wie sich deine Gefühle nach dem Sturm beruhigt haben?', hint: 'Schreibe über das Gefühl der Erleichterung, als du wieder in Sicherheit warst.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Hast du Verben der Bewegung treffend eingesetzt? (z.B. rennen, stürmen, flüchten)', hint: 'Statt "Wir gingen schnell" schreibe lieber "Wir stürmten los" oder "Wir flüchteten unter ein Vordach".' }
    ],
    commonSpellingErrors: {
      wrong: ['gewitter', 'plötzlich', 'angst', 'wieder', 'flüchten'],
      correct: ['Gewitter', 'plötzlich', 'Angst', 'wieder', 'flüchten']
    },
    exemplarText: `An einem sonnigen Samstagvormittag packten wir unsere Rucksäcke für eine Wanderung auf die Hohe Munde. Zusammen mit meiner Familie und unserem Hund Bello brach ich fröhlich auf.\n\nPlötzlich verdunkelte sich der Himmel bedrohlich. Ein heftiger Windstoß fegte über den Pfad. Der erste Donner grollte laut in den Bergen. Vor Angst fing mein Herz an wie wild zu klopfen. Regen prasselte auf uns nieder, während wir hastig nach Schutz suchten.\n\nZum Glück sahen wir eine kleine Hütte am Wegesrand. Als wir endlich müde, aber sicher wieder zu Hause ankamen, tranken wir heißen Kakao. Dieses Erlebnis werde ich so schnell nicht vergessen.`,
    preWritingQuestions: [
      {
        question: 'Wie wird die Einleitung zeitlich eingeleitet?',
        options: ['An einem sonnigen Samstagvormittag...', 'Plötzlich...', 'Als wir ankamen...'],
        correctIndex: 0,
        explanation: 'Die Einleitung beginnt mit "An einem sonnigen Samstagvormittag...", was die Zeit und Stimmung setzt.'
      },
      {
        question: 'Welches Wort im Hauptteil signalisiert, dass sich die Situation schlagartig ändert?',
        options: ['Plötzlich', 'Fröhlich', 'Sicher'],
        correctIndex: 0,
        explanation: '"Plötzlich" leitet den plötzlichen Umschwung des Wetters und den Beginn des Hauptteils ein.'
      },
      {
        question: 'Welches Verb der Bewegung wird im Hauptteil verwendet, um Eile zu zeigen?',
        options: ['suchten', 'brach auf', 'packten'],
        correctIndex: 0,
        explanation: '"suchten" bzw. die Phrase "hastig nach Schutz suchen" verdeutlicht die Eile.'
      },
      {
        question: 'Welcher Connector leitet die glückliche Wendung im Schlussteil ein?',
        options: ['Zum Glück', 'Regen', 'Hund'],
        correctIndex: 0,
        explanation: '"Zum Glück" ist ein Connector, der die Erleichterung und Wendung zum Guten einleitet.'
      }
    ],
    wordBank: {
      starters: ['An einem', 'Zusammen mit', 'Plötzlich', 'Zum Glück', 'Als wir endlich'],
      vocabulary: ['Gewitter', 'Windstoß', 'Donner', 'Hütte', 'Abenteuer'],
      connectors: ['während', 'als', 'und', 'weil', 'dann']
    }
  },
  {
    id: 'de-2-beschreibung',
    title: 'Gegenstandsbeschreibung: Ein verlorener Gegenstand',
    description: 'Beschreibe ein Fundstück oder einen Gegenstand so präzise, dass jemand ihn allein anhand deines Textes sofort zeichnen oder erkennen könnte.',
    grade: 2,
    subject: 'de',
    typeLabel: 'Beschreibung',
    sections: [
      { key: 'intro', label: 'Einleitung (Name & Gesamteindruck)', placeholder: 'Um welchen Gegenstand handelt es sich? Welche Größe und Gesamtform hat er?', minWords: 15 },
      { key: 'body', label: 'Hauptteil (Farbe, Material & Details)', placeholder: 'Beschreibe das Material, farbliche Besonderheiten, Muster und Abnutzungsspuren von oben nach unten...', minWords: 45 },
      { key: 'conclusion', label: 'Schluss (Verwendungszweck & Wert)', placeholder: 'Wofür wird der Gegenstand benutzt? Welchen Nutzen oder Wert hat er für dich?', minWords: 15 }
    ],
    starters: {
      intro: ['Bei dem zu beschreibenden Gegenstand handelt es sich um...', 'Der Gegenstand ist ungefähr so groß wie...', 'Auf den ersten Blick wirkt das objekt...'],
      body: ['Die Oberfläche fühlt sich... an.', 'Hergestellt ist das Gehäuse aus...', 'An der linken Seite befindet sich ein kleiner...', 'Bei genauerem Hinsehen bemerkt man leichte Kratzer auf...'],
      conclusion: ['Dieser Gegenstand dient hauptsächlich dazu,...', 'Für den Besitzer hat dieses Fundstück einen hohen...', 'Zusammenfassend lässt sich sagen, dass...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Gehst du bei deiner Beschreibung systematisch vor (z.B. von oben nach unten oder außen nach innen)?', hint: 'Ein ungeordnetes Beschreiben verwirrt den Leser. Wähle eine logische Reihenfolge für die Details.' },
      { section: 'body', question: 'Hast du auch auf Abnutzungsspuren oder Beschädigungen hingewiesen?', hint: 'Dinge wie Kratzer, Dellen oder Verfärbungen machen die Beschreibung einzigartig und präzise.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Benutzt du präzise Materialbegriffe? (Holz, Kunststoff, Aluminium)', hint: 'Statt "Es ist aus festem Stoff" schreibe lieber "Es besteht aus reißfestem Nylon" oder "marmoriertem Kunststoff".' }
    ],
    commonSpellingErrors: {
      wrong: ['große', 'plastik', 'oberfläche', 'kratzer', 'metallisch'],
      correct: ['Größe', 'Plastik', 'Oberfläche', 'Kratzer', 'metallisch']
    },
    exemplarText: `Bei dem zu beschreibenden Gegenstand handelt es sich um eine auffällige Sporttrinkflasche. Der Gegenstand hat eine zylindrische Gesamtform und ist ungefähr 25 Zentimeter hoch.\n\nDie Oberfläche fühlt sich glatt an. Hergestellt ist das Gehäuse aus mattem, rotem Aluminium. An der linken Seite befindet sich ein schwarzer Tragegriff aus festem Kunststoff. Bei genauerem Hinsehen bemerkt man leichte, silberne Kratzer auf dem Flaschenboden, die vom Abstellen stammen.\n\nDieser Gegenstand dient hauptsächlich dazu, Getränke beim Sport kühl zu halten. Für den Besitzer hat diese Flasche einen hohen praktischen Wert.`,
    preWritingQuestions: [
      {
        question: 'Welches Strukturmerkmal wird in der Einleitung genannt?',
        options: ['Die Gesamtform und die Höhe', 'Kratzer am Boden', 'Der Nutzen beim Sport'],
        correctIndex: 0,
        explanation: 'Die Einleitung benennt die zylindrische Gesamtform und die Höhe von ca. 25 cm, um den Gesamteindruck zu schildern.'
      },
      {
        question: 'Welches Material wird für das Hauptgehäuse der Trinkflasche beschrieben?',
        options: ['Aluminium', 'Glas', 'Holz'],
        correctIndex: 0,
        explanation: 'Das Hauptgehäuse besteht laut Text aus mattem, rotem Aluminium.'
      },
      {
        question: 'Welcher Satzanfang wird verwendet, um auf kleine Beschädigungen hinzuweisen?',
        options: ['Bei genauerem Hinsehen...', 'Bei dem Gegenstand...', 'Die Oberfläche...'],
        correctIndex: 0,
        explanation: '"Bei genauerem Hinsehen..." leitet die Beschreibung der feinen Kratzer am Flaschenboden ein.'
      },
      {
        question: 'Welcher Begriff verbindet die Beschreibung im Hauptteil mit der Abnutzung?',
        options: ['auf dem Flaschenboden', 'zylindrische', 'Sporttrinkflasche'],
        correctIndex: 0,
        explanation: '"auf dem Flaschenboden" ist eine präzise Ortsangabe, die zeigt, wo sich die Abnutzung befindet.'
      }
    ],
    wordBank: {
      starters: ['Bei dem zu', 'Der Gegenstand', 'Die Oberfläche', 'Hergestellt ist', 'Dieser Gegenstand'],
      vocabulary: ['zylindrisch', 'Aluminium', 'Kunststoff', 'Kratzer', 'Tragegriff'],
      connectors: ['und', 'weil', 'an der', 'bei', 'aus']
    }
  },
  {
    id: 'de-3-bericht',
    title: 'Bericht: Verkehrsunfall auf der Schulstraße',
    description: 'Verfasse einen sachlichen Zeitungsbericht über einen Fahrradunfall vor der Schule. Verwende keine Gefühlsäußerungen!',
    grade: 3,
    subject: 'de',
    typeLabel: 'Bericht',
    sections: [
      { key: 'intro', label: 'Einleitung (Die W-Fragen)', placeholder: 'Schlagzeile. Wann, Wo, Wer, Was ist passiert? Fasse den Kern des Geschehens kurz zusammen.', minWords: 25 },
      { key: 'body', label: 'Hauptteil (Genauer Unfallhergang & Folgen)', placeholder: 'Wie kam es zum Zusammenstoß? Wer hat die Rettung gerufen? Welche Verletzungen gab es?', minWords: 50 },
      { key: 'conclusion', label: 'Schluss (Aktueller Zustand & Zeugenaufruf)', placeholder: 'Wie ist der aktuelle Zustand der Beteiligten? Sucht die Polizei noch nach Zeugen?', minWords: 20 }
    ],
    starters: {
      intro: ['Schulstraße: Schüler kollidiert mit PKW...', 'Am gestrigen Mittwochmorgen ereignete sich gegen 07:45 Uhr...', 'Vor der Mittelschule Telfs kam es zu einem folgenschweren Zusammenstoß...'],
      body: ['Laut Zeugenaussagen übersah der 12-jährige Fahrradfahrer...', 'Der PKW-Lenker versuchte noch, durch ein Ausweichmanöver...', 'Ersthelfer kümmerten sich umgehend um...', 'Die verständigte Rettung transportierte den Verletzten in...'],
      conclusion: ['Wie das Krankenhaus am Nachmittag mitteilte,...', 'Die Polizeiinspektion bittet Zeugen, sich unter der Nummer... zu melden.', 'Es entstand ein Sachschaden in Höhe von circa...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Sind alle W-Fragen (Wer, Was, Wann, Wo) im ersten Absatz direkt beantwortet?', hint: 'Der Leser muss nach der Einleitung sofort wissen, wer beteiligt war und wo es passierte.' },
      { section: 'body', question: 'Schreibst du streng sachlich? Hast du Vermutungen oder Emotionen weggelassen?', hint: 'Im Bericht haben Wörter wie "schrecklich", "leider" oder "der böse Autofahrer" nichts verloren. Bleibe objektiv.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Steht der Bericht durchgehend in der Vergangenheitsform (Präteritum)?', hint: 'Berichte werden im Präteritum geschrieben (z.B. "kollidierte", "wich aus", "traf ein").' }
    ],
    commonSpellingErrors: {
      wrong: ['unfal', 'polizey', 'gestern', 'fahrrad', 'verletztung'],
      correct: ['Unfall', 'Polizei', 'gestern', 'Fahrrad', 'Verletzung']
    },
    exemplarText: `Schulstraße: Schüler kollidiert mit PKW. Am gestrigen Mittwochmorgen ereignete sich gegen 07:45 Uhr vor der Mittelschule Telfs ein Zusammenstoß zwischen einem 12-jährigen Radfahrer und einem Auto.\n\nLaut Zeugenaussagen übersah der Fahrradfahrer das herannahende Fahrzeug, als er die Straße überqueren wollte. Der PKW-Lenker versuchte noch, durch ein Ausweichmanöver einen Aufprall zu verhindern, was jedoch misslang. Ersthelfer kümmerten sich umgehend um den gestürzten Schüler. Die verständigte Rettung transportierte den Verletzten in das Krankenhaus Innsbruck.\n\nWie das Krankenhaus mitteilte, erlitt der Schüler nur leichte Prellungen. Die Polizeiinspektion Telfs sucht Zeugen des Unfalls.`,
    preWritingQuestions: [
      {
        question: 'Welche Informationen liefert die Einleitung des Unfallberichts?',
        options: ['Schadenshöhe und Spitalaufenthalt', 'Schlagzeile und die W-Fragen (Wer, Was, Wann, Wo)', 'Die genauen Namen der Ärzte'],
        correctIndex: 1,
        explanation: 'Die Einleitung klärt sofort die W-Fragen: Am Mittwoch gegen 7:45 Uhr kollidierte ein Schüler vor der MS Telfs mit einem Auto.'
      },
      {
        question: 'Wie wird die Fahrtrichtung oder das Fahrzeug im Hauptteil beschrieben?',
        options: ['herannahendes Fahrzeug', 'schnelles Rennauto', 'rotes Cabriolet'],
        correctIndex: 0,
        explanation: 'Der Text beschreibt das Auto sachlich als "herannahendes Fahrzeug".'
      },
      {
        question: 'Welche Phrase wird zur Kennzeichnung von Beobachterberichten benutzt?',
        options: ['Laut Zeugenaussagen...', 'Gott sei Dank...', 'Ich glaube, dass...'],
        correctIndex: 0,
        explanation: '"Laut Zeugenaussagen..." leitet sachliche, beobachtete Informationen des Unfallhergangs ein.'
      },
      {
        question: 'Welche Konjunktion leitet im Hauptteil den Nebensatz zur Zeit ein, als der Unfall geschah?',
        options: ['als', 'wie', 'weil'],
        correctIndex: 0,
        explanation: '"als" verbindet den Hauptsatz mit dem Nebensatz: "...als er die Straße überqueren wollte."'
      }
    ],
    wordBank: {
      starters: ['Am gestrigen', 'Laut Zeugenaussagen', 'Ersthelfer', 'Wie das', 'Die Polizeiinspektion'],
      vocabulary: ['Zusammenstoß', 'Radfahrer', 'Ausweichmanöver', 'Polizeiinspektion', 'Ersthelfer'],
      connectors: ['als', 'jedoch', 'und', 'wie', 'während']
    }
  },
  {
    id: 'de-4-erorterung',
    title: 'Argumentative Erörterung: Handys im Unterricht?',
    description: 'Sollen Smartphones im Unterricht erlaubt sein? Erörtere das Thema mit logischen Pro- und Contra-Argumenten.',
    grade: 4,
    subject: 'de',
    typeLabel: 'Erörterung',
    sections: [
      { key: 'intro', label: 'Einleitung (Hinführung zum Thema)', placeholder: 'Warum ist das Thema heutzutage wichtig? Stelle die Streitfrage klar dar.', minWords: 25 },
      { key: 'body', label: 'Hauptteil (Pro- & Contra-Argumente)', placeholder: 'Nenne Argumente für Handys (z.B. Recherche) und Gegenargumente (z.B. Ablenkung) mit Beispielen.', minWords: 65 },
      { key: 'conclusion', label: 'Schluss (Synthese & Eigene Meinung)', placeholder: 'Fasse die Argumente zusammen und ziehe ein persönliches, begründetes Fazit.', minWords: 25 }
    ],
    starters: {
      intro: ['Heutzutage besitzt fast jeder Jugendliche...', 'In den Medien wird heftig darüber debattiert, ob...', 'Die Frage, ob Handys im Unterricht nützlich sind, beschäftigt viele...'],
      body: ['Ein wichtiges Argument für die Nutzung ist...', 'Gegner weisen jedoch darauf hin, dass...', 'Ein anschauliches Beispiel hierfür ist...', 'Darüber hinaus darf man nicht vergessen, dass...'],
      conclusion: ['Abwägend lässt sich sagen, dass...', 'Meiner persönlichen Meinung nach...', 'Zusammenfassend komme ich zu dem Schluss, dass...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Hast du deine Argumente nach der 3B-Regel aufgebaut (Behauptung, Begründung, Beispiel)?', hint: 'Eine bloße Behauptung reicht nicht. Du musst sie begründen und mit einem konkreten Beispiel (z.B. "Recherche im Geographie-Unterricht") belegen.' },
      { section: 'body', question: 'Sind Pro- und Contra-Argumente ausgewogen gewichtet?', hint: 'Stelle sicher, dass du beide Seiten der Medaille beleuchtest, bevor du ein Urteil fällst.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Verwendest du Überleitungswörter, um Argumente logisch zu verknüpfen?', hint: 'Nutze Konjunktionen wie "Einerseits / Andererseits", "Demgegenüber steht", "Folglich" oder "Zusätzlich ist zu erwähnen".' }
    ],
    commonSpellingErrors: {
      wrong: ['kucken', 'argumentiren', 'internet', 'vorteil', 'deswegen'],
      correct: ['gucken', 'argumentieren', 'Internet', 'Vorteil', 'deswegen']
    },
    exemplarText: `Heutzutage besitzt fast jeder Jugendliche ein eigenes Smartphone. In den Medien und an Schulen wird daher heftig darüber debattiert, ob Handys im Unterricht erlaubt sein sollten oder nicht.\n\nEin wichtiges Argument für die Nutzung ist die Möglichkeit der schnellen Recherche im Internet. Schüler können gezielt Fachbegriffe nachschlagen. Gegner weisen jedoch darauf hin, dass Handys eine enorme Ablenkung darstellen, da Schüler heimlich spielen. Ein anschauliches Beispiel hierfür ist das Versenden von Kurznachrichten während des Unterrichts, was die Aufmerksamkeit beeinträchtigt.\n\nAbwägend lässt sich sagen, dass Smartphones nützliche Lernwerkzeuge sind, wenn klare Regeln herrschen. Meiner persönlichen Meinung nach sollten sie nur für gezielte Aufgaben genutzt werden.`,
    preWritingQuestions: [
      {
        question: 'Wie führt die Einleitung in das Thema ein?',
        options: ['Sie nennt den aktuellen Hintergrund (Handysbesitz) und die Streitfrage', 'Sie gibt sofort die eigene Meinung wieder', 'Sie listet die Nachteile auf'],
        correctIndex: 0,
        explanation: 'Die Einleitung schildert die Allgegenwart der Handys und formuliert die Streitfrage, ob sie im Unterricht erlaubt sein sollen.'
      },
      {
        question: 'Welches Argument für Handys wird im Hauptteil aufgeführt?',
        options: ['Das Spielen von Videospielen', 'Die Möglichkeit der schnellen Internetrecherche', 'Dass man damit telefonieren kann'],
        correctIndex: 1,
        explanation: 'Im Hauptteil wird die Nutzung als Werkzeug zur schnellen Recherche als wichtiges Argument genannt.'
      },
      {
        question: 'Welcher Überleitungsausdruck verknüpft das Contra-Argument im Hauptteil?',
        options: ['Gegner weisen jedoch darauf hin...', 'Ein wichtiges Argument...', 'Meiner Meinung nach...'],
        correctIndex: 0,
        explanation: '"Gegner weisen jedoch darauf hin..." ist ein strukturierender Satzanfang für Gegenargumente.'
      },
      {
        question: 'Welches Wort wird im Schlussteil verwendet, um das persönliche Urteil einzuleiten?',
        options: ['Meiner persönlichen Meinung nach', 'Heutzutage', 'Gegner'],
        correctIndex: 0,
        explanation: '"Meiner persönlichen Meinung nach" leitet das eigene begründete Fazit ein.'
      }
    ],
    wordBank: {
      starters: ['Heutzutage', 'Ein wichtiges', 'Gegner weisen', 'Ein anschauliches', 'Meiner persönlichen'],
      vocabulary: ['Smartphone', 'Recherche', 'Ablenkung', 'Lernwerkzeug', 'Aufmerksamkeit'],
      connectors: ['daher', 'jedoch', 'da', 'wenn', 'nach']
    }
  },

  // ==================== ENGLISH ====================
  {
    id: 'en-1-unit1',
    title: 'About Myself and My Classroom (Unit 1)',
    description: 'Write a text introducing yourself and describing your English classroom to a new pen pal.',
    grade: 1,
    subject: 'en',
    typeLabel: 'School Description',
    sections: [
      { key: 'intro', label: 'Greeting and About Me (Intro)', placeholder: 'Dear pen pal, my name is... and I am...', minWords: 12 },
      { key: 'body', label: 'My English Classroom (Details)', placeholder: 'What does your classroom look like? Describe the colors and size.', minWords: 30 },
      { key: 'conclusion', label: 'Saying Goodbye (Closing)', placeholder: 'Ask your pen pal a question and say goodbye.', minWords: 12 }
    ],
    starters: {
      intro: ['Hello! My name is...', 'I am eleven years old and...', 'I live in a small town called...'],
      body: ['My classroom is big and has...', 'The walls are painted...', 'In the room, we have...'],
      conclusion: ['What is your classroom like?', 'Write back soon!', 'Best wishes,']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you state your name, age, and home town?', hint: 'Start with a friendly greeting like "Dear friend," or "Hello,".' },
      { section: 'body', question: 'Did you describe the color and items of the room?', hint: 'Mention at least two classroom objects like tables, windows, or the blackboard.' },
      { section: 'conclusion', question: 'Did you ask your pen pal to write back?', hint: 'Ask a simple question like "How is your school?".' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using singular and plural nouns correctly?', hint: 'Check nouns like: table -> tables, chair -> chairs.' }
    ],
    commonSpellingErrors: {
      wrong: ['hello', 'twelve', 'clssroom', 'numbers', 'alphabet'],
      correct: ['hello', 'twelve', 'classroom', 'numbers', 'alphabet']
    },
    exemplarText: `Hello! My name is Felix and I am eleven years old. I live in a small town called Telfs.\n\nMy classroom is big and has green walls. In the room, we have a green blackboard, twelve brown tables, and twenty chairs. There are two windows.\n\nWhat is your classroom like? Please write back soon!\n\nBest wishes,\nFelix`,
    preWritingQuestions: [
      {
        question: 'What information does the greeting paragraph include?',
        options: ['Name, age, and home town', 'Color of the teacher’s desk', 'The food at lunchtime'],
        correctIndex: 0,
        explanation: 'The introduction introduces Felix, his age (eleven), and where he lives (Telfs).'
      },
      {
        question: 'Which adjective describes the classroom walls in the exemplar text?',
        options: ['blue', 'green', 'yellow'],
        correctIndex: 1,
        explanation: 'The exemplar states: "My classroom is big and has green walls."'
      },
      {
        question: 'Which starter is used to list items in the room?',
        options: ['In the room, we have...', 'Hello!', 'Write back soon!'],
        correctIndex: 0,
        explanation: '"In the room, we have..." helps introduce the items inside the classroom.'
      },
      {
        question: 'Which connector links the tables and the chairs in the body section?',
        options: ['and', 'but', 'because'],
        correctIndex: 0,
        explanation: '"and" is used as a connector to join two list items: "...twelve brown tables, and twenty chairs."'
      }
    ],
    wordBank: {
      starters: ['Hello', 'I live in', 'My classroom', 'In the room', 'Best wishes'],
      vocabulary: ['classroom', 'blackboard', 'tables', 'chairs', 'windows'],
      connectors: ['and', 'but', 'because', 'also', 'soon']
    }
  },
  {
    id: 'en-1-unit2',
    title: 'My Pencil Case (Unit 2)',
    description: 'Describe your pencil case and explain where your school things are located inside it.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Object Description',
    sections: [
      { key: 'intro', label: 'My Pencil Case (Intro)', placeholder: 'What color is your pencil case? Is it big or small?', minWords: 10 },
      { key: 'body', label: 'School Things inside it (Details)', placeholder: 'What objects are inside? Use there is/are and prepositions of place.', minWords: 30 },
      { key: 'conclusion', label: 'My Favourite School Thing (Closing)', placeholder: 'What is your favorite tool and why?', minWords: 10 }
    ],
    starters: {
      intro: ['My pencil case is...', 'It has a funny shape and is...', 'I bought it at...'],
      body: ['Inside the pencil case, there is...', 'There are also two...', 'My pens are under the...', 'Next to my rubber, I have...'],
      conclusion: ['My absolute favourite tool is my...', 'I like it because it is...', 'I use it every day for...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you describe the shape and color of your pencil case?', hint: 'Tell us if it is round, square, red, blue, or patterned.' },
      { section: 'body', question: 'Did you list at least three different school items?', hint: 'List things like pencils, rulers, rubbers, or highlighters.' },
      { section: 'conclusion', question: 'Why is that item your favorite?', hint: 'Explain if it writes beautifully, has a cool color, or was a gift.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you use prepositions of place (in, on, under, behind, next to) correctly?', hint: 'Check if you wrote where the items are (e.g. "in the pencil case").' }
    ],
    commonSpellingErrors: {
      wrong: ['pensil', 'ruler', 'rubbers', 'there', 'preposition'],
      correct: ['pencil', 'ruler', 'rubbers', 'there', 'preposition']
    },
    exemplarText: `My pencil case is small and bright blue. It has a funny round shape.\n\nInside the pencil case, there is a yellow pencil and a blue pen. There are also two small rubbers. Next to my ruler, I have a green pencil sharpener.\n\nMy absolute favourite tool is my green pen. I like it because it writes beautifully.`,
    preWritingQuestions: [
      {
        question: 'How is the size and color of the pencil case described in the intro?',
        options: ['Small and bright blue', 'Big and black', 'Round and red'],
        correctIndex: 0,
        explanation: 'The text starts: "My pencil case is small and bright blue."'
      },
      {
        question: 'Which items are described using "there is" (singular)?',
        options: ['rubbers', 'a yellow pencil and a blue pen', 'pens'],
        correctIndex: 1,
        explanation: 'The text uses "there is" for the singular items: "there is a yellow pencil..."'
      },
      {
        question: 'What preposition of place is used to locate the sharpener?',
        options: ['Next to', 'Under', 'In front of'],
        correctIndex: 0,
        explanation: 'The author writes: "Next to my ruler, I have..."'
      },
      {
        question: 'Which connector explains the reason why the green pen is the favorite?',
        options: ['because', 'and', 'but'],
        correctIndex: 0,
        explanation: 'Felix uses "because" to state the reason: "I like it because it writes beautifully."'
      }
    ],
    wordBank: {
      starters: ['My pencil', 'Inside the', 'There are', 'Next to', 'My absolute'],
      vocabulary: ['pencil', 'rubbers', 'ruler', 'sharpener', 'favourite'],
      connectors: ['and', 'because', 'also', 'too', 'under']
    }
  },
  {
    id: 'en-1-unit3',
    title: 'Describing a Pirate (Unit 3)',
    description: 'Create and describe a funny pirate character. Detail their face, body, and what they have got.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Creative Description',
    sections: [
      { key: 'intro', label: 'Meet the Pirate (Intro)', placeholder: 'What is the pirate’s name? What does he look like?', minWords: 15 },
      { key: 'body', label: 'Body Parts & Clothes (Details)', placeholder: 'Describe his face, hair, and body. What has he got?', minWords: 35 },
      { key: 'conclusion', label: 'The Pirate’s Animal (Closing)', placeholder: 'Does he have a pet parrot or monkey?', minWords: 15 }
    ],
    starters: {
      intro: ['Meet Captain Jack, a famous...', 'This is a scary pirate named...', 'He has got a big hat and...'],
      body: ['Captain Jack has got long black...', 'He has got only one eye and a...', 'His nose is very big and he...', 'On his left leg, he has got...'],
      conclusion: ['On his shoulder, there is...', 'The parrot always says...', 'Together they search for treasure in...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you choose a funny name for your pirate?', hint: 'Give them a title like Captain Redbeard or Silvertooth.' },
      { section: 'body', question: 'Did you describe at least three body parts?', hint: 'Mention eyes, ears, hair, nose, arms, legs, or teeth.' },
      { section: 'conclusion', question: 'What makes their animal companion special?', hint: 'Does the animal help them find gold? Does it wear a small hat?' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check your use of "have got" / "has got".', hint: 'Use "he has got" for singular and "they have got" for plural. Don’t write "he have got".' }
    ],
    commonSpellingErrors: {
      wrong: ['pirate', 'sholder', 'teeths', 'have', 'treasure'],
      correct: ['pirate', 'shoulder', 'teeth', 'have', 'treasure']
    },
    exemplarText: `Meet Captain Jack, a famous pirate. He has got a big black hat and boots.\n\nCaptain Jack has got long black hair and a red beard. He has got only one brown eye. His nose is very big and he has got white teeth. On his left leg, he has got a wooden peg.\n\nOn his shoulder, there is a colorful pet parrot. Together they search for gold.`,
    preWritingQuestions: [
      {
        question: 'What is the name of the pirate in the draft?',
        options: ['Captain Jack', 'Sherlock Groans', 'Barnaby'],
        correctIndex: 0,
        explanation: 'The introduction introduces: "Meet Captain Jack..."'
      },
      {
        question: 'Which body part is described as "wooden"?',
        options: ['nose', 'peg/leg', 'teeth'],
        correctIndex: 1,
        explanation: 'The text describes: "On his left leg, he has got a wooden peg."'
      },
      {
        question: 'Which verb form is used to describe the pirate’s hair and eye?',
        options: ['has got', 'is having', 'have got'],
        correctIndex: 0,
        explanation: '"has got" is the correct singular form used for Captain Jack.'
      },
      {
        question: 'What word connects the pirate and the parrot in their search?',
        options: ['Together', 'Search', 'Gold'],
        correctIndex: 0,
        explanation: '"Together" functions as a connector indicating cooperation between the two.'
      }
    ],
    wordBank: {
      starters: ['Meet Captain', 'He has got', 'His nose', 'On his left', 'Together they'],
      vocabulary: ['pirate', 'beard', 'teeth', 'wooden', 'shoulder'],
      connectors: ['and', 'but', 'on', 'together', 'with']
    }
  },
  {
    id: 'en-1-unit4',
    title: 'My Diary: A Week of Emotions (Unit 4)',
    description: 'Write a diary entry about your school week. Mention different days, times, and how you feel.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Diary Entry',
    sections: [
      { key: 'intro', label: 'Diary Entry Start (Intro)', placeholder: 'State the day, time, and how your week began.', minWords: 15 },
      { key: 'body', label: 'School Days and Feelings (Details)', placeholder: 'Describe what you do on different days and your feelings.', minWords: 35 },
      { key: 'conclusion', label: 'The Weekend (Closing)', placeholder: 'What are your weekend plans and how do you feel about them?', minWords: 15 }
    ],
    starters: {
      intro: ['Dear Diary, today is Monday and...', 'It is 8 o’clock in the morning...', 'My school week is starting and I am...'],
      body: ['On Tuesdays, I have music class and I feel...', 'At noon on Wednesday, we are usually...', 'On Thursdays, I am sometimes tired because...', 'Friday afternoon is great because...'],
      conclusion: ['Finally, the weekend is here and...', 'I am very happy because on Saturday I...', 'Sunday is a quiet day for me to...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you set the scene with the day and time?', hint: 'Start with "Today is Tuesday..." and specify the time.' },
      { section: 'body', question: 'Did you include at least three different feelings?', hint: 'Use words like happy, tired, excited, bored, nervous, or angry.' },
      { section: 'conclusion', question: 'Do you have weekend plans?', hint: 'Explain what you are doing on Saturday or Sunday.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check the capitalization of weekdays!', hint: 'Remember: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday always start with capital letters.' }
    ],
    commonSpellingErrors: {
      wrong: ['monday', 'wendsday', 'diary', 'feelings', 'tired'],
      correct: ['Monday', 'Wednesday', 'diary', 'feelings', 'tired']
    },
    exemplarText: `Dear Diary, today is Monday and it is 8 o'clock in the morning. I am ready for school!\n\nOn Tuesdays, I have music class and I feel very happy. On Wednesdays, I have maths, but I am sometimes bored. On Thursdays, we do sports and I feel excited. Friday afternoon is great because school finishes.\n\nFinally, the weekend is here. On Saturday I am visiting my grandma, and I am very excited!`,
    preWritingQuestions: [
      {
        question: 'Which day of the week starts the diary entry?',
        options: ['Monday', 'Tuesday', 'Friday'],
        correctIndex: 0,
        explanation: 'The text begins: "Dear Diary, today is Monday..."'
      },
      {
        question: 'How does the writer feel on Wednesdays?',
        options: ['happy', 'bored', 'excited'],
        correctIndex: 1,
        explanation: 'The writer states: "On Wednesdays, I have maths, but I am sometimes bored."'
      },
      {
        question: 'What links the sentence about Friday to the reason why it is great?',
        options: ['because', 'but', 'finally'],
        correctIndex: 0,
        explanation: '"because" connects the feeling to the cause: "Friday afternoon is great because school finishes."'
      },
      {
        question: 'Which word connects the weekdays in the body section showing contrast?',
        options: ['but', 'and', 'because'],
        correctIndex: 0,
        explanation: '"but" shows contrast between maths and being bored: "...I have maths, but I am sometimes bored."'
      }
    ],
    wordBank: {
      starters: ['Dear Diary', 'On Tuesdays', 'On Thursdays', 'Friday afternoon', 'Finally'],
      vocabulary: ['Monday', 'Wednesday', 'excited', 'bored', 'tired'],
      connectors: ['and', 'but', 'because', 'on', 'finally']
    }
  },
  {
    id: 'en-1-unit5',
    title: 'My Talents: What I Can and Can’t Do (Unit 5)',
    description: 'Describe your talents, what activities you can do well, and what you cannot do yet.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Personal Description',
    sections: [
      { key: 'intro', label: 'Talent Introduction (Intro)', placeholder: 'What is your main interest? Music, sports, or art?', minWords: 12 },
      { key: 'body', label: 'My Skills (Details)', placeholder: 'Describe what you can do and what you can’t.', minWords: 35 },
      { key: 'conclusion', label: 'My Future Skill (Closing)', placeholder: 'What skill do you want to learn next?', minWords: 12 }
    ],
    starters: {
      intro: ['I enjoy sports and music very much...', 'I am a very active person and...', 'In my free time, I like to try...'],
      body: ['I can play the guitar, but I can’t...', 'My friends say I can run very...', 'I can speak English, but I can’t write...', 'My brother can paint pictures, but I can’t...'],
      conclusion: ['In the future, I want to learn how to...', 'I think learning to swim is...', 'I hope I can practice this summer!']
    },
    draft1Socratic: [
      { section: 'intro', question: 'What is your general interest?', hint: 'State if you prefer outdoor sports, playing instruments, or drawing.' },
      { section: 'body', question: 'Did you write down at least two things you can do and two things you cannot do?', hint: 'Make sure to compare can vs. can’t.' },
      { section: 'conclusion', question: 'What would you love to learn?', hint: 'Name a dream skill, like skiing, cooking, or coding.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check the spelling of "can’t" with the apostrophe.', hint: 'Remember to use "can’t" (or "cannot") instead of "cant".' }
    ],
    commonSpellingErrors: {
      wrong: ['guitar', 'instrument', 'movement', 'running', 'cant'],
      correct: ['guitar', 'instrument', 'movement', 'running', "can't"]
    },
    exemplarText: `I enjoy sports and music very much. I am a very active student.\n\nI can play the guitar, but I can't play the piano. I can run very fast and jump high, but I can't swim. My friends say I can speak English well.\n\nIn the future, I want to learn how to swim. I hope I can practice this summer!`,
    preWritingQuestions: [
      {
        question: 'What are the main interests introduced in the draft?',
        options: ['sports and music', 'books and films', 'eating and sleeping'],
        correctIndex: 0,
        explanation: 'The introduction says: "I enjoy sports and music very much."'
      },
      {
        question: 'Which instrument can the writer NOT play?',
        options: ['guitar', 'piano', 'violin'],
        correctIndex: 1,
        explanation: 'The writer states: "...but I can’t play the piano."'
      },
      {
        question: 'What connector connects the positive skill to the negative skill in the body?',
        options: ['but', 'and', 'because'],
        correctIndex: 0,
        explanation: '"but" connects contrast skills: "I can play the guitar, but I can’t..."'
      },
      {
        question: 'Which future-oriented starter begins the final paragraph?',
        options: ['In the future...', 'I enjoy...', 'My friends say...'],
        correctIndex: 0,
        explanation: '"In the future..." is used to introduce skills they want to learn later.'
      }
    ],
    wordBank: {
      starters: ['I enjoy', 'I can play', 'My friends say', 'In the future', 'I hope'],
      vocabulary: ['sports', 'guitar', 'piano', 'active', 'future'],
      connectors: ['but', 'and', 'well', 'how to', 'this']
    }
  },
  {
    id: 'en-1-unit6',
    title: 'Detective Story: The Case of the Lost Dog (Unit 6)',
    description: 'Help Chief Detective Sherlock Groans find the missing puppy! Describe the clues, search the neighborhood, and solve the mystery using the Present Simple.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Creative Story',
    sections: [
      { key: 'intro', label: 'The Mystery Begins (Introduction)', placeholder: 'Who is missing? What does the puppy look like?', minWords: 15 },
      { key: 'body', label: 'Searching for Clues (The Investigation)', placeholder: 'Where do you look? What clues do you find? Who do you ask?', minWords: 35 },
      { key: 'conclusion', label: 'Case Closed (The Rescue)', placeholder: 'How do you find the dog? Where is he and how do you feel?', minWords: 15 }
    ],
    starters: {
      intro: ['Chief Detective Sherlock Groans gets a phone call from...', 'A little puppy named Barnaby is missing from...', 'The puppy is small, with dark brown fur and...'],
      body: ['First, the detective looks under...', 'Then, he walks along the school street and finds...', 'He asks the neighbors, and they say...', 'Suddenly, he spots paw prints on the...'],
      conclusion: ['Finally, they hear a quiet bark coming from...', 'Barnaby is safe and happy because...', 'Sherlock Groans smiles and says...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you describe the puppy’s appearance (color, size, ears) so the reader can visualize him?', hint: 'Give Barnaby distinct details: is he brown, does he have floppy ears, is he wearing a collar?' },
      { section: 'body', question: 'Where does the detective search? Name at least two locations.', hint: 'Search the classroom, the park, or behind the bushes. Use prepositions like "behind", "under", "next to"!' },
      { section: 'conclusion', question: 'Is there a happy ending? How do the puppy’s owners thank the detective?', hint: 'Describe the reunion! A warm hug or a yummy dog treat is a great ending.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check your action verbs! Are they descriptive?', hint: 'Instead of saying "he goes", use "he walks", "he climbs", "he rushes", or "he runs".' },
      { section: 'body', question: 'Are you using the Present Simple correctly for third person (he/she/it)?', hint: 'Remember the "s" for verbs! "He searches", "she helps", "it barks".' }
    ],
    commonSpellingErrors: {
      wrong: ['detectiv', 'puppie', 'serch', 'finds', 'neigbor'],
      correct: ['detective', 'puppy', 'search', 'finds', 'neighbor']
    },
    exemplarText: `Chief Detective Sherlock Groans gets a phone call from a sad girl. A little puppy named Barnaby is missing from the garden. The puppy is small, with dark brown fur and floppy ears.\n\nFirst, the detective looks under a big park bench. Then, he walks along the school street and finds a red dog collar. Suddenly, he spots paw prints on the wet grass and follows them.\n\nFinally, they hear a quiet bark coming from a large box. Barnaby is safe and happy!`,
    preWritingQuestions: [
      {
        question: 'Who is missing in the story?',
        options: ['A dog named Barnaby', 'A detective named Groans', 'A cat named Kitty'],
        correctIndex: 0,
        explanation: 'The story states: "A little puppy named Barnaby is missing..."'
      },
      {
        question: 'Which item does the detective find on the school street?',
        options: ['A bone', 'A red dog collar', 'A map'],
        correctIndex: 1,
        explanation: 'In the body section: "...he walks along the school street and finds a red dog collar."'
      },
      {
        question: 'What time-sequencing word opens the search in the body paragraph?',
        options: ['First', 'Then', 'Suddenly'],
        correctIndex: 0,
        explanation: '"First" is used to establish the start of the action sequence.'
      },
      {
        question: 'Which word connects the discovery of the prints to the sudden action?',
        options: ['Suddenly', 'Finally', 'Under'],
        correctIndex: 0,
        explanation: '"Suddenly" is a connector used to introduce an unexpected development.'
      }
    ],
    wordBank: {
      starters: ['Chief Detective', 'First, the', 'Then, he', 'Suddenly, he', 'Finally, they'],
      vocabulary: ['puppy', 'detective', 'collar', 'prints', 'missing'],
      connectors: ['first', 'then', 'suddenly', 'finally', 'under']
    }
  },
  {
    id: 'en-1-unit7',
    title: 'Email: A Healthy Meal Plan (Unit 7)',
    description: 'Write an email to your friend describing your eating habits and what food you think is healthy or unhealthy.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Email',
    sections: [
      { key: 'intro', label: 'Email Greeting & Breakfast (The Start)', placeholder: 'Dear..., thanks for your email! Today, I want to tell you about...', minWords: 15 },
      { key: 'body', label: 'Lunch and Dinner (Healthy vs Unhealthy)', placeholder: 'What do you eat for lunch and dinner? What foods are healthy or unhealthy?', minWords: 35 },
      { key: 'conclusion', label: 'Your Friend’s Habits (The Closing)', placeholder: 'Ask your friend about their favorite food and sign off.', minWords: 15 }
    ],
    starters: {
      intro: ['Hi..., thanks for your email! Today, I want to tell you about...', 'For breakfast, I usually eat noodles or...', 'I always drink a glass of milk / orange juice in the morning...'],
      body: ['For lunch at school, I prefer eating healthy food like...', 'I do not like vegetables very much, but my mom says they are...', 'Sometimes I eat fast food like burgers or chips, but they are not...', 'My favourite fruit is apple / banana because it is...'],
      conclusion: ['What about you? What is your favourite food?', 'Do you eat healthy food at school?', 'Write back soon! Bye / See you,']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you greet your friend by name and mention breakfast?', hint: 'Start with "Hi [Name]," and describe your morning meal.' },
      { section: 'body', question: 'Did you compare healthy and unhealthy foods in your text?', hint: 'Talk about things like salads, vegetables, fruits (healthy) versus sweets, chips, soda (unhealthy).' },
      { section: 'conclusion', question: 'Did you ask your friend a question about their food?', hint: 'Ask "Do you like vegetables?" or "What do you eat for dinner?" to keep the conversation going.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using articles "a" and "an" correctly?', hint: 'Use "a" before consonant sounds (a banana, a burger) and "an" before vowel sounds (an apple, an orange).' },
      { section: 'body', question: 'Did you use adverbs of frequency to describe your habits?', hint: 'Use words like "always", "usually", "sometimes", "often", or "never" (e.g. "I always eat breakfast").' }
    ],
    commonSpellingErrors: {
      wrong: ['healthy', 'freind', 'vegtables', 'banana', 'breakfast'],
      correct: ['healthy', 'friend', 'vegetables', 'banana', 'breakfast']
    },
    exemplarText: `Hi Lukas, thanks for your email! Today, I want to tell you about my meals. For breakfast, I usually eat a banana and cereal.\n\nFor lunch at school, I prefer eating healthy food like an apple and a salad. Sometimes I eat fast food like burgers, but they are not healthy. My mom says vegetables are good for me.\n\nWhat about you? Do you eat healthy food? Write back soon!\n\nBye,\nFelix`,
    preWritingQuestions: [
      {
        question: 'Who is the recipient of the email?',
        options: ['Lukas', 'Auntie Olivia', 'Felix'],
        correctIndex: 0,
        explanation: 'The email starts with "Hi Lukas...", so Lukas is the friend receiving it.'
      },
      {
        question: 'What fruit in the body uses the article "an" correctly?',
        options: ['apple', 'banana', 'salad'],
        correctIndex: 0,
        explanation: '"apple" starts with a vowel sound, so it uses "an apple".'
      },
      {
        question: 'Which adverb of frequency describes the breakfast habit?',
        options: ['usually', 'sometimes', 'never'],
        correctIndex: 0,
        explanation: 'Felix writes: "For breakfast, I usually eat..."'
      },
      {
        question: 'Which word connects the positive healthy choice to the negative burger choice?',
        options: ['but', 'because', 'usually'],
        correctIndex: 0,
        explanation: '"but" shows contrast: "...burgers, but they are not healthy."'
      }
    ],
    wordBank: {
      starters: ['Hi', 'For breakfast', 'For lunch', 'Sometimes I', 'What about'],
      vocabulary: ['healthy', 'vegetables', 'banana', 'breakfast', 'apple'],
      connectors: ['and', 'but', 'because', 'usually', 'sometimes']
    }
  },
  {
    id: 'en-1-unit8',
    title: 'My Wardrobe: Talking about Clothes (Unit 8)',
    description: 'Write about the clothes you wear for school, for parties, and what you are wearing right now.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Personal Writing',
    sections: [
      { key: 'intro', label: 'My Daily Clothes (Intro)', placeholder: 'What do you usually wear to school?', minWords: 15 },
      { key: 'body', label: 'Party Outfits & Choices (Details)', placeholder: 'What do you wear for special days or parties? What colors?', minWords: 35 },
      { key: 'conclusion', label: 'My Clothes Right Now (Closing)', placeholder: 'Describe what you are wearing today.', minWords: 15 }
    ],
    starters: {
      intro: ['On school days, I usually wear...', 'My school uniform consists of...', 'I prefer comfortable clothes like...'],
      body: ['For birthday parties, I wear my favourite...', 'My dress is bright blue and...', 'He wears black trousers and a white...', 'I like to wear caps and trainers because...'],
      conclusion: ['Right now, I am wearing a green...', 'Today, I have got my blue jeans and...', 'It is cold, so I am also wearing...']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Do you wear jeans, t-shirts, sweaters, or skirts to school?', hint: 'List your regular school outfits.' },
      { section: 'body', question: 'Did you use color adjectives to describe the clothes?', hint: 'Write things like "red jacket", "black trousers", or "white sneakers".' },
      { section: 'conclusion', question: 'Are you wearing shoes, socks, or a sweater right now?', hint: 'Look at yourself and describe your current clothes.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using the Present Simple correctly to describe habits?', hint: 'Check verbs: "I wear...", "She wears...". Remember the third person "s"!' }
    ],
    commonSpellingErrors: {
      wrong: ['clotes', 'trousers', 'shurt', 'wearing', 'jeans'],
      correct: ['clothes', 'trousers', 'shirt', 'wearing', 'jeans']
    },
    exemplarText: `On school days, I usually wear a blue shirt and grey trousers. I prefer comfortable clothes.\n\nFor birthday parties, I wear my favourite red jacket and clean white trainers. I like to wear my red jacket because it looks cool.\n\nRight now, I am wearing green socks and blue jeans. It is cold today.`,
    preWritingQuestions: [
      {
        question: 'What clothes does the writer wear to school?',
        options: ['blue shirt and grey trousers', 'red jacket and trainers', 'green socks'],
        correctIndex: 0,
        explanation: 'In the intro, Felix states: "On school days, I usually wear a blue shirt and grey trousers."'
      },
      {
        question: 'What color is the writer’s party jacket?',
        options: ['blue', 'grey', 'red'],
        correctIndex: 2,
        explanation: 'The text describes: "For birthday parties, I wear my favourite red jacket..."'
      },
      {
        question: 'Which starter introduces the clothes worn at the moment of writing?',
        options: ['Right now, I am wearing...', 'On school days...', 'For birthday parties...'],
        correctIndex: 0,
        explanation: '"Right now, I am wearing..." is used for temporary actions happening at the moment.'
      },
      {
        question: 'Which connector links the jacket and the trainers in the body section?',
        options: ['and', 'but', 'because'],
        correctIndex: 0,
        explanation: '"and" joins the two clothing items in the list: "...red jacket and clean white trainers."'
      }
    ],
    wordBank: {
      starters: ['On school', 'I prefer', 'For birthday', 'I like to', 'Right now'],
      vocabulary: ['clothes', 'trousers', 'jacket', 'trainers', 'jeans'],
      connectors: ['and', 'because', 'usually', 'today', 'also']
    }
  },
  {
    id: 'en-1-unit9',
    title: 'An Email about a Pet Problem (Unit 9)',
    description: 'Write an email to Auntie Olivia, the clever owl. Tell her about your unusual pet and the funny problem you have with it!',
    grade: 1,
    subject: 'en',
    typeLabel: 'Email',
    sections: [
      { key: 'intro', label: 'Email Greeting & Pet Intro (The Opening)', placeholder: 'Dear Auntie Olivia, I need your help. I have an unusual pet called...', minWords: 15 },
      { key: 'body', label: 'The Funny Problem (The Details)', placeholder: 'What is the problem? What does the pet do? How often does it happen?', minWords: 35 },
      { key: 'conclusion', label: 'Ask for Advice & Sign-off (The Closing)', placeholder: 'What should I do? Please write back soon. Best wishes,...', minWords: 15 }
    ],
    starters: {
      intro: ['Dear Auntie Olivia, I hope you are well.', 'I am writing to you because I have a problem with my...', 'My pet is not a cat or a dog. It is an unusual...'],
      body: ['The problem is that my pet loves to eat...', 'Every afternoon, it climbs up the bookshelf and...', 'It is very noisy and it keeps me awake because...', 'I always feed it hamster food, but it prefers...'],
      conclusion: ['What can I do to stop this?', 'Do you have any clever ideas for me?', 'Write to me soon. Love / Best wishes,']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you introduce your unusual pet clearly?', hint: 'Describe what species it is. Is it a hamster, a parrot, a frog, or something even more unusual like an owl or a small monkey?' },
      { section: 'body', question: 'Did you explain the problem in detail? What does the pet do?', hint: 'Describe the behavior. Does it chew on shoes? Does it make funny noises at night? Does it hide in your school bag?' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you use question words (what, where, how often) or object pronouns (him, her, it, them) correctly?', hint: 'Use object pronouns to avoid repeating the pet’s name (e.g. "I love him" instead of "I love the hamster").' },
      { section: 'intro', question: 'Is your email greeting and closing polite and properly formatted?', hint: 'Start with "Dear Auntie Olivia," and end with "Love," or "Best wishes," followed by your name.' }
    ],
    commonSpellingErrors: {
      wrong: ['clever', 'problem', 'unusual', 'becuase', 'tomorow'],
      correct: ['clever', 'problem', 'unusual', 'because', 'tomorrow']
    },
    exemplarText: `Dear Auntie Olivia,\nI hope you are well. I am writing to you because I have a problem with my pet. It is an unusual frog called Fred.\n\nThe problem is that my pet Fred loves to eat paper. Every afternoon, it climbs up the bookshelf and chews my homework! I try to feed it hamsters, but it prefers paper.\n\nWhat can I do to stop him? Do you have any clever ideas? \n\nBest wishes,\nFelix`,
    preWritingQuestions: [
      {
        question: 'Who is the recipient of the advice email?',
        options: ['Auntie Olivia, the owl', 'Sherlock Groans', 'Grandma'],
        correctIndex: 0,
        explanation: 'The email is addressed to: "Dear Auntie Olivia,".'
      },
      {
        question: 'What is the unusual pet in the exemplar draft?',
        options: ['A frog named Fred', 'A parrot named Polly', 'A cat named Tom'],
        correctIndex: 0,
        explanation: 'Felix writes: "It is an unusual frog called Fred."'
      },
      {
        question: 'What does the frog love to eat?',
        options: ['flies', 'paper', 'apples'],
        correctIndex: 1,
        explanation: 'The funny problem is: "...my pet Fred loves to eat paper."'
      },
      {
        question: 'Which connector links the food transition in the body paragraph?',
        options: ['but', 'because', 'every'],
        correctIndex: 0,
        explanation: '"but" shows contrast: "I try to feed it..., but it prefers paper."'
      }
    ],
    wordBank: {
      starters: ['Dear Auntie', 'I am writing', 'The problem is', 'Every afternoon', 'What can I'],
      vocabulary: ['unusual', 'bookshelf', 'clever', 'problem', 'homework'],
      connectors: ['because', 'but', 'and', 'every', 'soon']
    }
  },
  {
    id: 'en-1-unit10',
    title: 'In a Shop: A Shopping Dialogue (Unit 10)',
    description: 'Write a dialogue between a shop assistant and a customer buying school supplies or clothes.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Dialogue Writing',
    sections: [
      { key: 'intro', label: 'Entering the Shop (Intro)', placeholder: 'The greeting between the shop assistant and the customer.', minWords: 15 },
      { key: 'body', label: 'Asking for Items and Prices (Details)', placeholder: 'The customer asks for things and the price of them.', minWords: 35 },
      { key: 'conclusion', label: 'Paying and Leaving (Closing)', placeholder: 'The customer pays and they say thank you.', minWords: 15 }
    ],
    starters: {
      intro: ['Assistant: Hello, can I help you?', 'Customer: Yes, please. I am looking for...', 'Assistant: What size or colour do you...'],
      body: ['Customer: How much is this blue ruler?', 'Assistant: That is one pound fifty...', 'Customer: And how much are those jeans?', 'Assistant: They are forty-five pounds...'],
      conclusion: ['Customer: Okay, I will take them, please...', 'Assistant: That is forty-six pounds fifty, here is...', 'Customer: Thank you very much! Goodbye.']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you include both the shop assistant and the customer?', hint: 'Label the speakers clearly, like "Assistant:" and "Customer:".' },
      { section: 'body', question: 'Did you ask for the price of at least two items?', hint: 'Use questions like "How much is this?" or "How much are these?".' },
      { section: 'conclusion', question: 'Did they exchange money and say goodbye?', hint: 'Include the dialogue for paying (e.g. "Here is the money").' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you use this/that (singular) and these/those (plural) correctly?', hint: 'Use "this ruler" (singular close), "that pen" (singular far), "these pencils" (plural close), "those shoes" (plural far).' }
    ],
    commonSpellingErrors: {
      wrong: ['assistant', 'pounds', 'dialogue', 'shoppin', 'much'],
      correct: ['assistant', 'pounds', 'dialogue', 'shopping', 'much']
    },
    exemplarText: `Assistant: Hello, can I help you?\nCustomer: Yes, please. I am looking for school supplies.\n\nCustomer: How much is this blue ruler?\nAssistant: That is one pound fifty.\nCustomer: And how much are those pencils?\nAssistant: They are three pounds.\n\nCustomer: Okay, I will take them, please. Here is five pounds.\nAssistant: Thank you, here is fifty pence change. Goodbye!\nCustomer: Goodbye.`,
    preWritingQuestions: [
      {
        question: 'Who are the two speakers in this dialogue?',
        options: ['Assistant and Customer', 'Teacher and Student', 'Mother and Son'],
        correctIndex: 0,
        explanation: 'The speakers are clearly labeled: "Assistant:" and "Customer:".'
      },
      {
        question: 'What is the price of the blue ruler?',
        options: ['One pound fifty', 'Three pounds', 'Five pounds'],
        correctIndex: 0,
        explanation: 'The assistant answers: "That is one pound fifty."'
      },
      {
        question: 'Which demonstrative pronoun is used for the pencils (plural, far)?',
        options: ['those', 'this', 'that'],
        correctIndex: 0,
        explanation: 'The customer asks: "And how much are those pencils?" (plural).'
      },
      {
        question: 'Which word connects the decision to buy and the politeness?',
        options: ['please', 'and', 'much'],
        correctIndex: 0,
        explanation: '"please" is used to make the purchase request polite.'
      }
    ],
    wordBank: {
      starters: ['Assistant: Hello', 'Customer: Yes', 'Customer: How much', 'Assistant: That is', 'Customer: Okay'],
      vocabulary: ['assistant', 'supplies', 'ruler', 'pounds', 'change'],
      connectors: ['and', 'please', 'here', 'much', 'for']
    }
  },
  {
    id: 'en-1-unit11',
    title: 'Writing a Postcard from Vacation (Unit 11)',
    description: 'Write a postcard from a vacation spot. Describe what time it is and what your family is doing right now using the Present Continuous.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Postcard',
    sections: [
      { key: 'intro', label: 'Postcard Greeting & Time (Intro)', placeholder: 'Greet your friend, say where you are and what time it is.', minWords: 15 },
      { key: 'body', label: 'What We Are Doing (Details)', placeholder: 'What are you and your family doing right now? Use the Present Continuous.', minWords: 35 },
      { key: 'conclusion', label: 'Holiday Wishes & Farewell (Closing)', placeholder: 'Say when you are coming home and sign off.', minWords: 15 }
    ],
    starters: {
      intro: ['Dear Lukas, greetings from sunny...', 'It is five o’clock in the afternoon and...', 'We are having a wonderful time in...'],
      body: ['Right now, I am sitting on the beach and...', 'My mother is reading a book under...', 'My brother and sister are swimming in the...', 'The sun is shining and we are...'],
      conclusion: ['We are returning home next Thursday...', 'See you soon in class!', 'Best wishes / Love,']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you state your vacation location and the time?', hint: 'Tell your friend where you are (e.g., London, Italy) and the time (e.g., 3 PM).' },
      { section: 'body', question: 'Did you describe what at least three people are doing?', hint: 'Use present continuous action verbs: "I am eating...", "My dad is sleeping...", "They are playing...".' },
      { section: 'conclusion', question: 'Did you write a classic postcard sign-off?', hint: 'Use "Love," or "See you soon," followed by your name.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check the spelling of your Present Continuous verbs.', hint: 'Remember to add -ing to the base verb (swim -> swimming, sit -> sitting, shine -> shining).' }
    ],
    commonSpellingErrors: {
      wrong: ['postcard', 'continuous', 'swiming', 'writting', 'beach'],
      correct: ['postcard', 'continuous', 'swimming', 'writing', 'beach']
    },
    exemplarText: `Dear Lukas,\nGreetings from sunny Italy! It is five o’clock in the afternoon and we are having a wonderful time.\n\nRight now, I am sitting on the beach and eating ice cream. My mother is reading a book under the umbrella, and my brother and sister are swimming in the blue sea. The sun is shining.\n\nWe are returning home next Thursday. See you soon!\n\nBest wishes,\nFelix`,
    preWritingQuestions: [
      {
        question: 'Where is the postcard sent from?',
        options: ['Italy', 'London', 'Telfs'],
        correctIndex: 0,
        explanation: 'The postcard greets Lukas: "Greetings from sunny Italy!"'
      },
      {
        question: 'What is the writer doing right now on the beach?',
        options: ['sitting and eating ice cream', 'swimming in the sea', 'reading a book'],
        correctIndex: 0,
        explanation: 'In the body: "Right now, I am sitting on the beach and eating ice cream."'
      },
      {
        question: 'What continuous verb has a double consonant spelling?',
        options: ['swimming', 'shining', 'reading'],
        correctIndex: 0,
        explanation: '"swim" doubles the consonant "m" before adding "ing", resulting in "swimming".'
      },
      {
        question: 'Which connector is used to state when they return home?',
        options: ['next', 'now', 'soon'],
        correctIndex: 0,
        explanation: '"next" functions as a temporal connector: "We are returning home next Thursday."'
      }
    ],
    wordBank: {
      starters: ['Dear Lukas', 'Greetings from', 'Right now', 'We are returning', 'See you soon'],
      vocabulary: ['postcard', 'swimming', 'shining', 'beach', 'umbrella'],
      connectors: ['and', 'under', 'next', 'now', 'soon']
    }
  },
  {
    id: 'en-1-unit12',
    title: 'The Birthday Party: Where Were You? (Unit 12)',
    description: 'Describe your last birthday party. State the date, where you were, and who was there using the Past Simple (was/were).',
    grade: 1,
    subject: 'en',
    typeLabel: 'Past Description',
    sections: [
      { key: 'intro', label: 'My Birthday Date (Intro)', placeholder: 'When is your birthday? When was your last party?', minWords: 15 },
      { key: 'body', label: 'The Party Scene (Details)', placeholder: 'Where was the party? Who was there? What was on the table?', minWords: 35 },
      { key: 'conclusion', label: 'How It Ended (Closing)', placeholder: 'What was the best present? How did you feel at the end of the day?', minWords: 15 }
    ],
    starters: {
      intro: ['My birthday is on the twelfth of...', 'Last month, I had a big party on...', 'It was a cold winter day but my party was...'],
      body: ['The party was at our house in the...', 'All my best friends were there, including...', 'There was a huge cake on the table and...', 'The rooms were decorated with balloons...'],
      conclusion: ['My favourite present was a new...', 'I was very tired but extremely happy...', 'It was a wonderful birthday party!']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you write your birth date using ordinal numbers?', hint: 'Use formats like "the 5th of May" or "August 21st".' },
      { section: 'body', question: 'Did you list who was present at your party?', hint: 'Mention friends, family, or classmates. Use "was" or "were" to describe them.' },
      { section: 'conclusion', question: 'What made the day memorable?', hint: 'Describe the gifts, the games you played, or the cake.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you use "was" (singular) and "were" (plural) correctly?', hint: 'Check your sentences: "I was", "my friends were", "there was a cake", "there were balloons".' }
    ],
    commonSpellingErrors: {
      wrong: ['birthday', 'balloons', 'was', 'were', 'months'],
      correct: ['birthday', 'balloons', 'was', 'were', 'months']
    },
    exemplarText: `My birthday is on the twelfth of May. Last month, I had a big party on a sunny Sunday.\n\nThe party was at our house in the garden. All my best friends were there, including Lukas and Anna. There was a huge chocolate cake on the table, and there were colorful balloons everywhere.\n\nMy favourite present was a new bike. I was very tired but extremely happy at the end of the day. It was a wonderful birthday party!`,
    preWritingQuestions: [
      {
        question: 'When is the writer’s birthday?',
        options: ['12th of May', 'sunny Sunday', 'last month'],
        correctIndex: 0,
        explanation: 'The writer states: "My birthday is on the twelfth of May."'
      },
      {
        question: 'What plural items are described using "there were"?',
        options: ['chocolate cake', 'colorful balloons', 'house'],
        correctIndex: 1,
        explanation: 'The text uses "there were" for the plural noun: "...there were colorful balloons..."'
      },
      {
        question: 'What past simple form is used for the plural friends?',
        options: ['was', 'were', 'are'],
        correctIndex: 1,
        explanation: 'Because "friends" is plural, the past form is "were there".'
      },
      {
        question: 'Which connector shows contrast in how the writer felt at the end?',
        options: ['but', 'and', 'because'],
        correctIndex: 0,
        explanation: '"but" shows contrast between feeling tired and happy: "I was very tired but extremely happy..."'
      }
    ],
    wordBank: {
      starters: ['My birthday is', 'The party was', 'All my best', 'There was a', 'My favourite'],
      vocabulary: ['birthday', 'twelfth', 'balloons', 'present', 'chocolate'],
      connectors: ['on', 'including', 'and', 'but', 'everywhere']
    }
  },
  {
    id: 'en-1-unit13',
    title: 'Space Rescue: Mission to Planet X (Unit 13)',
    description: 'Your spaceship received an emergency call! Tell the story of how you landed on Planet X and saved a stranded alien using the Past Simple.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Adventure Story',
    sections: [
      { key: 'intro', label: 'The Emergency Call (The Beginning)', placeholder: 'When did you get the call? Where were you flying? How did you feel?', minWords: 15 },
      { key: 'body', label: 'The Landing & Rescue (The Action)', placeholder: 'How did you land? What was the accident? How did you help the alien?', minWords: 35 },
      { key: 'conclusion', label: 'Back to the Stars (The Ending)', placeholder: 'How did the alien say thank you? Where did you go next?', minWords: 15 }
    ],
    starters: {
      intro: ['Last night, during our patrol near Mars, we received...', 'Suddenly, the red emergency light flashed on the dashboard...', 'An alien voice cried: "Help! We had a terrible accident on..."'],
      body: ['We quickly landed our spaceship on the dusty red ground...', 'Next, we saw a crashed flying saucer. The alien was under...', 'Fortunately, we had a space first-aid kit, so we...', 'I used my laser tool to clear the heavy rocks and...'],
      conclusion: ['The alien was very happy and gave us a glowing...', 'After that, we waved goodbye and flew back into...', 'It was a dangerous but exciting space rescue!']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you explain who was calling and where you were when the emergency started?', hint: 'Describe the scene in space: were you flying near Mars? Did you hear a strange message through your radio?' },
      { section: 'body', question: 'Did you describe how you helped the alien? What was wrong?', hint: 'Did the alien hurt its arm? Was the flying saucer broken? Explain the space rescue steps.' },
      { section: 'conclusion', question: 'How did the story end? Did the alien give you a gift?', hint: 'Conclude the mission! Describe the alien’s reaction and your return to space.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are all your actions written in the Past Simple tense?', hint: 'Since this is a story in the past, change present verbs to past: "receive -> received", "see -> saw", "help -> helped", "fly -> flew".' },
      { section: 'body', question: 'Did you use linking words to connect your sentences?', hint: 'Use words like "Suddenly", "Next", "After that", and "Fortunately" to make the story flow.' }
    ],
    commonSpellingErrors: {
      wrong: ['spaseship', 'recieved', 'helped', 'sudently', 'emergensy'],
      correct: ['spaceship', 'received', 'helped', 'suddenly', 'emergency']
    },
    exemplarText: `Last night, during our patrol near Mars, we received an emergency call. Suddenly, the red emergency light flashed on the dashboard. An alien cried for help.\n\nWe quickly landed our spaceship on the dusty red ground of Planet X. Next, we saw a crashed saucer. The alien was under a heavy rock. Fortunately, we had a laser tool, so we helped the alien.\n\nThe alien was happy and gave us a glowing gold star. After that, we flew back into space. It was a dangerous but exciting rescue!`,
    preWritingQuestions: [
      {
        question: 'Where was the spaceship patrolling when they got the call?',
        options: ['near Mars', 'on Planet X', 'near Earth'],
        correctIndex: 0,
        explanation: 'The intro states: "Last night, during our patrol near Mars, we received..."'
      },
      {
        question: 'What tool did the astronauts use to help the alien?',
        options: ['a laser tool', 'a space hammer', 'a shovel'],
        correctIndex: 0,
        explanation: 'The body explains: "...we had a laser tool, so we helped..."'
      },
      {
        question: 'What linking word indicates that something lucky happened in the body?',
        options: ['Fortunately', 'Suddenly', 'Dangerous'],
        correctIndex: 0,
        explanation: '"Fortunately" is a linking word showing good luck or relief.'
      },
      {
        question: 'Which connector links the final departure to the rescue outcome?',
        options: ['After that', 'Fortunately', 'Last night'],
        correctIndex: 0,
        explanation: '"After that" is a transition connector used to show chronological order.'
      }
    ],
    wordBank: {
      starters: ['Last night', 'Suddenly, the', 'We quickly', 'Fortunately, we', 'After that'],
      vocabulary: ['spaceship', 'emergency', 'alien', 'laser', 'saucer'],
      connectors: ['suddenly', 'next', 'fortunately', 'after that', 'but']
    }
  },
  {
    id: 'en-1-unit14',
    title: 'A Strange Day: Creative Story (Unit 14)',
    description: 'Write a story in the past about a very unusual day where something funny or mysterious happened.',
    grade: 1,
    subject: 'en',
    typeLabel: 'Creative Story',
    sections: [
      { key: 'intro', label: 'The Setting (Intro)', placeholder: 'When did the story happen? What was the weather like?', minWords: 15 },
      { key: 'body', label: 'The Strange Event (Details)', placeholder: 'What happened? What did you do? Use irregular past tense verbs.', minWords: 35 },
      { key: 'conclusion', label: 'How It Ended (Closing)', placeholder: 'How did the day end? Did it turn out to be a dream?', minWords: 15 }
    ],
    starters: {
      intro: ['Last Saturday, I woke up early and...', 'It was a rainy afternoon in November...', 'Suddenly, I heard a strange noise from...'],
      body: ['I went downstairs and saw a...', 'I did not know what to do, so I...', 'I ran to the window and called my...', 'My dog ate the remote control and...'],
      conclusion: ['In the end, it was just a funny...', 'I woke up in my bed and smiled...', 'That was the strangest day of my life!']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Did you set the time and place of your story?', hint: 'Explain when it took place (e.g. "Last week", "On a winter evening").' },
      { section: 'body', question: 'What was the mysterious event?', hint: 'Describe the surprise: did you find something? Did an animal talk? Did something disappear?' },
      { section: 'conclusion', question: 'How did the character react at the end?', hint: 'State if they laughed, ran away, or woke up from a dream.' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you use Past Simple negative and irregular verbs correctly?', hint: 'Check your verbs: "see -> saw", "go -> went", "run -> ran", "do not -> did not", "do -> did".' }
    ],
    commonSpellingErrors: {
      wrong: ['woke', 'heared', 'strange', 'drem', 'yesterday'],
      correct: ['woke', 'heard', 'strange', 'dream', 'yesterday']
    },
    exemplarText: `Last Saturday, I woke up early and looked outside. It was a rainy afternoon in November.\n\nSuddenly, I heard a strange noise from the kitchen. I went downstairs and saw a small monkey playing with my toys! I did not know what to do, so I ran to the window and called my brother. The monkey waved at me.\n\nIn the end, it was just a funny dream. I woke up in my warm bed and smiled.`,
    preWritingQuestions: [
      {
        question: 'When does the story take place?',
        options: ['Last Saturday', 'Last Monday', 'Yesterday'],
        correctIndex: 0,
        explanation: 'The story opens: "Last Saturday, I woke up early..."'
      },
      {
        question: 'What strange animal was in the kitchen in the draft?',
        options: ['a monkey', 'a puppy', 'a frog'],
        correctIndex: 0,
        explanation: 'In the body section: "...and saw a small monkey playing with my toys!"'
      },
      {
        question: 'What is the past simple form of the verb "hear" in the text?',
        options: ['heard', 'heared', 'hear'],
        correctIndex: 0,
        explanation: '"heard" is the correct irregular past tense of "hear".'
      },
      {
        question: 'Which connector signals the resolution of the story?',
        options: ['In the end', 'Suddenly', 'So'],
        correctIndex: 0,
        explanation: '"In the end" is a connector used to introduce the conclusion of a story.'
      }
    ],
    wordBank: {
      starters: ['Last Saturday', 'Suddenly, I', 'I went', 'I did not', 'In the end'],
      vocabulary: ['woke', 'heard', 'strange', 'dream', 'kitchen'],
      connectors: ['suddenly', 'so', 'and', 'in the end', 'but']
    }
  },
  {
    id: 'en-1-unit15',
    title: 'Holiday Plans: Going to... (Unit 15)',
    description: 'Write an email to a friend about your plans for the upcoming summer holidays using "be going to".',
    grade: 1,
    subject: 'en',
    typeLabel: 'Email',
    sections: [
      { key: 'intro', label: 'Holiday Greeting & Destination (Intro)', placeholder: 'Greet your friend and tell them where you are going.', minWords: 15 },
      { key: 'body', label: 'Planned Activities (Details)', placeholder: 'What are you going to do there? Who are you going with? Use "be going to".', minWords: 35 },
      { key: 'conclusion', label: 'Friend’s Plans & Sign-off (Closing)', placeholder: 'Ask about your friend’s plans and say goodbye.', minWords: 15 }
    ],
    starters: {
      intro: ['Dear Oliver, summer holidays are coming and...', 'I am so excited because we are going to...', 'This summer, my family and I are visiting...'],
      body: ['We are going to stay at a nice hotel near...', 'I am going to swim in the sea every day...', 'My dad is going to rent a boat and we...', 'We are also going to visit a famous...'],
      conclusion: ['What are you going to do this summer?', 'Are you going to travel, too?', 'Have a great holiday! Best wishes,']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Where is your holiday destination?', hint: 'Mention a country, city, or beach you are visiting.' },
      { section: 'body', question: 'Did you list at least three activities you plan to do?', hint: 'Use the "be going to" structure: "I am going to swim...", "we are going to visit...", "my dad is going to rent...".' },
      { section: 'conclusion', question: 'Did you ask your friend about their plans?', hint: 'Ask "Where are you going to go?".' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Check that "be going to" matches the subject.', hint: 'Check: "I am going to", "he/she is going to", "we/they are going to". Do not forget the verb "to be"!' }
    ],
    commonSpellingErrors: {
      wrong: ['summer', 'hollidays', 'visiting', 'going', 'travel'],
      correct: ['summer', 'holidays', 'visiting', 'going', 'travel']
    },
    exemplarText: `Dear Oliver,\nSummer holidays are coming and I am so excited because we are going to visit Italy!\n\nWe are going to stay at a nice hotel near the beach. I am going to swim in the sea every day, and my dad is going to rent a boat. We are also going to visit a famous museum.\n\nWhat are you going to do this summer? Are you going to travel, too?\n\nBest wishes,\nFelix`,
    preWritingQuestions: [
      {
        question: 'Where is the writer planning to go for the summer holidays?',
        options: ['Italy', 'Mars', 'Telfs'],
        correctIndex: 0,
        explanation: 'In the intro, the writer states: "...we are going to visit Italy!"'
      },
      {
        question: 'What is the correct future structure used to express plans in the text?',
        options: ['going to + verb', 'will + verb', 'present continuous'],
        correctIndex: 0,
        explanation: 'The text uses "be going to" throughout: "we are going to stay...", "I am going to swim...".'
      },
      {
        question: 'Who is going to rent a boat?',
        options: ['my dad', 'Oliver', 'Felix'],
        correctIndex: 0,
        explanation: 'In the body section: "...and my dad is going to rent a boat."'
      },
      {
        question: 'Which word connects the plans of the writer to the inquiry about Oliver’s plans?',
        options: ['What', 'Dear', 'too'],
        correctIndex: 2,
        explanation: '"too" is a connector showing addition: "Are you going to travel, too?"'
      }
    ],
    wordBank: {
      starters: ['Dear Oliver', 'I am so', 'We are going', 'I am going', 'What are you'],
      vocabulary: ['holidays', 'excited', 'hotel', 'beach', 'museum'],
      connectors: ['because', 'and', 'also', 'too', 'this']
    }
  },
  {
    id: 'en-2-story',
    title: 'Short Story: The Magic Key',
    description: 'Write a short creative story about finding a small key in the forest that opens a mysterious hidden door.',
    grade: 2,
    subject: 'en',
    typeLabel: 'Creative Story',
    sections: [
      { key: 'intro', label: 'Introduction (Setting the scene)', placeholder: 'Describe the weather, the forest, and how you found the key...', minWords: 20 },
      { key: 'body', label: 'Climax (The mysterious door)', placeholder: 'Where did the key lead you? What did the door look like? What happened when you opened it?', minWords: 45 },
      { key: 'conclusion', label: 'Resolution (How it ends)', placeholder: 'Did you go inside? What was the secret? How did you return home?', minWords: 20 }
    ],
    starters: {
      intro: ['One sunny autumn afternoon, I was walking in the...', 'Suddenly, I saw something glowing under a pile of leaves...', 'It was a tiny, golden key with strange patterns on it...'],
      body: ['Following a narrow path, I discovered an old oak tree...', 'In the middle of the trunk, there was a tiny iron door...', 'My hand was shaking as I put the key into the lock...'],
      conclusion: ['Inside, I found a box full of...', 'It was an adventure I will never forget...', 'From that day on, I always carry the key with me.']
    },
    draft1Socratic: [
      { section: 'intro', question: 'Do you set a clear mood in the forest scene?', hint: 'Use sensory details: what did the leaves sound like? Was it cold or warm?' },
      { section: 'body', question: 'Do you build tension before the door is opened?', hint: 'Describe how your character felt. Were they scared, excited, or nervous?' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Did you write your story in the past tense?', hint: 'Stories are usually written in simple past. Check verbs like "go -> went", "find -> found", "open -> opened".' }
    ],
    commonSpellingErrors: {
      wrong: ['forrest', 'sudently', 'mysterious', 'opended', 'golden'],
      correct: ['forest', 'sudently', 'mysterious', 'opened', 'golden']
    },
    exemplarText: `One sunny autumn afternoon, I was walking in the deep forest. Suddenly, I saw something glowing under a pile of dry leaves. It was a tiny, golden key with strange patterns on it.\n\nFollowing a narrow path, I discovered an old oak tree. In the middle of the trunk, there was a tiny iron door. My hand was shaking as I put the key into the lock and opened it.\n\nInside, I found a box full of glowing crystals. It was an adventure I will never forget. From that day on, I always carry the key with me.`,
    preWritingQuestions: [
      {
        question: 'What is the main finding in the introduction?',
        options: ['A tiny, golden key', 'A mysterious box', 'An old oak tree'],
        correctIndex: 0,
        explanation: 'The intro sets the scene and concludes with: "It was a tiny, golden key..."'
      },
      {
        question: 'Where is the hidden iron door located?',
        options: ['In the middle of an oak tree trunk', 'Under the pile of dry leaves', 'Deep in the grass'],
        correctIndex: 0,
        explanation: 'In the body section: "In the middle of the trunk, there was a tiny iron door."'
      },
      {
        question: 'Which verb shows how the author felt when inserting the key?',
        options: ['shaking', 'walking', 'forget'],
        correctIndex: 0,
        explanation: '"shaking" (my hand was shaking) is a descriptive verb expressing nervousness.'
      },
      {
        question: 'What connector describes the timeline of carrying the key after the story?',
        options: ['From that day on', 'Suddenly', 'As'],
        correctIndex: 0,
        explanation: '"From that day on" is a temporal connector showing habits starting after the event.'
      }
    ],
    wordBank: {
      starters: ['One sunny', 'Suddenly, I', 'It was a', 'Following a', 'Inside, I'],
      vocabulary: ['forest', 'glowing', 'oak', 'shaking', 'adventure'],
      connectors: ['suddenly', 'as', 'inside', 'from that day', 'with']
    }
  },
  {
    id: 'en-4-opinion',
    title: 'Opinion Essay: Mobile Phones in School',
    description: 'Should mobile phones be banned in schools? Write an essay expressing your opinion with supporting reasons.',
    grade: 4,
    subject: 'en',
    typeLabel: 'Opinion Essay',
    sections: [
      { key: 'intro', label: 'Introduction (Hook & Thesis)', placeholder: 'Introduce the debate and state your opinion clearly...', minWords: 25 },
      { key: 'body', label: 'Body Paragraphs (Reasons & Examples)', placeholder: 'Give at least two reasons to support your opinion. Provide examples...', minWords: 60 },
      { key: 'conclusion', label: 'Conclusion (Summary of main points)', placeholder: 'Restate your opinion in a new way and wrap up your arguments...', minWords: 20 }
    ],
    starters: {
      intro: ['Nowadays, almost every student carries a smartphone to school...', 'The question of whether phones should be allowed in class is highly debated...', 'In my opinion, school phone bans are... because...'],
      body: ['First of all, smartphones can be a major distraction during...', 'On the other hand, they can also be used as a helpful tool for...', 'For example, students can quickly look up dictionary words or...'],
      conclusion: ['To sum up, I believe that...', 'Taking everything into consideration, school boards should...', 'In conclusion, it is clear that...']
    },
    draft1Socratic: [
      { section: 'body', question: 'Did you support your opinion with real-life examples?', hint: 'Instead of just saying "phones distract", give an example like: "Students might secretly text or play games under their desks during math class."' },
      { section: 'intro', question: 'Is your stance (thesis) clear in the introduction?', hint: 'Make a clear statement: "I strongly believe that phones should be allowed for educational use only."' }
    ],
    draft2Socratic: [
      { section: 'body', question: 'Are you using formal transition words to link your points?', hint: 'Use linking words: "Furthermore", "In addition", "However", "Consequently", or "Therefore".' }
    ],
    commonSpellingErrors: {
      wrong: ['goverment', 'distractin', 'classroom', 'opinion', 'alowed'],
      correct: ['government', 'distraction', 'classroom', 'opinion', 'allowed']
    },
    exemplarText: `Nowadays, almost every student carries a smartphone to school. The question of whether phones should be allowed in class is highly debated. In my opinion, school phone bans are necessary because they distract students.\n\nFirst of all, smartphones can be a major distraction during lessons. For example, students can secretly text or play games. On the other hand, they can be a helpful tool for research, but the distraction risk is too high.\n\nTo sum up, I believe that mobile phones should be kept in bags. Taking everything into consideration, school boards should ban them during lessons.`,
    preWritingQuestions: [
      {
        question: 'What is the writer’s opinion (thesis) in the introduction?',
        options: ['Bans are necessary because of distraction', 'Phones should be allowed all the time', 'Teachers should buy phones for pupils'],
        correctIndex: 0,
        explanation: 'The writer states: "In my opinion, school phone bans are necessary..."'
      },
      {
        question: 'What example is given for distraction in the body paragraph?',
        options: ['secretly texting or playing games', 'calling parents', 'taking photos of the board'],
        correctIndex: 0,
        explanation: 'The text states: "For example, students can secretly text or play games."'
      },
      {
        question: 'Which starter introduces the first supporting point in the body?',
        options: ['First of all', 'On the other hand', 'To sum up'],
        correctIndex: 0,
        explanation: '"First of all" is a standard transition starter to list the first major argument.'
      },
      {
        question: 'Which connector is used to introduce the counter-argument (research)?',
        options: ['On the other hand', 'For example', 'First of all'],
        correctIndex: 0,
        explanation: '"On the other hand" is a contrasting connector used to introduce a opposing point of view.'
      }
    ],
    wordBank: {
      starters: ['Nowadays', 'In my opinion', 'First of all', 'On the other', 'To sum up'],
      vocabulary: ['smartphone', 'debated', 'distraction', 'research', 'lessons'],
      connectors: ['because', 'first of all', 'for example', 'on the other hand', 'to sum up']
    }
  }
]
