// MORE! 1 — Complete Vocabulary Data for Units 1–15
// Format: English = German (en = de)
// All words are A1–A2 level, Austrian curriculum (Mittelschule Klasse 1 / Schulstufe 5)

export interface VocabWord {
  en: string
  de: string
  phrase?: true
}

export interface VocabCategory {
  name: string
  words: VocabWord[]
}

export interface VocabUnit {
  unit: number
  theme: string
  unitTitle: string   // as in the MORE!1 textbook
  categories: VocabCategory[]
  phrases: VocabWord[]
}

export const MORE1_VOCABULARY: VocabUnit[] = [
  // ─────────────────────────────────────────────────────────────────
  // UNIT 1 — Time for School
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 1,
    theme: 'Time for School',
    unitTitle: 'Unit 1: Time for School',
    categories: [
      {
        name: 'Colours',
        words: [
          { en: 'red', de: 'rot' },
          { en: 'blue', de: 'blau' },
          { en: 'green', de: 'grün' },
          { en: 'yellow', de: 'gelb' },
          { en: 'orange', de: 'orange' },
          { en: 'purple', de: 'lila / violett' },
          { en: 'pink', de: 'rosa' },
          { en: 'black', de: 'schwarz' },
          { en: 'white', de: 'weiß' },
          { en: 'brown', de: 'braun' },
        ],
      },
      {
        name: 'School things',
        words: [
          { en: 'book', de: 'Buch' },
          { en: 'pencil', de: 'Bleistift' },
          { en: 'pen', de: 'Stift / Kugelschreiber' },
          { en: 'ruler', de: 'Lineal' },
          { en: 'eraser (rubber)', de: 'Radiergummi' },
          { en: 'bag (backpack)', de: 'Tasche / Schulrucksack' },
          { en: 'pencil case', de: 'Federmäppchen' },
          { en: 'notebook', de: 'Heft / Notizbuch' },
          { en: 'scissors', de: 'Schere' },
          { en: 'glue', de: 'Kleber / Klebstoff' },
          { en: 'sharpener', de: 'Spitzer' },
        ],
      },
      {
        name: 'Classroom objects',
        words: [
          { en: 'desk', de: 'Schreibtisch / Schulbank' },
          { en: 'chair', de: 'Stuhl' },
          { en: 'board (whiteboard)', de: 'Tafel / Whiteboard' },
          { en: 'door', de: 'Tür' },
          { en: 'window', de: 'Fenster' },
          { en: 'clock', de: 'Uhr' },
          { en: 'map', de: 'Karte / Landkarte' },
          { en: 'shelf', de: 'Regal' },
          { en: 'cupboard', de: 'Schrank' },
          { en: 'computer', de: 'Computer' },
          { en: 'wall', de: 'Wand' },
        ],
      },
    ],
    phrases: [
      { en: 'What colour is it?', de: 'Welche Farbe hat es?', phrase: true },
      { en: 'It is red.', de: 'Es ist rot.', phrase: true },
      { en: 'How do you spell that?', de: 'Wie buchstabiert man das?', phrase: true },
      { en: 'Can I have a pen, please?', de: 'Kann ich bitte einen Stift haben?', phrase: true },
      { en: 'Open your book.', de: 'Öffne dein Buch.', phrase: true },
      { en: 'Close your book.', de: 'Schließe dein Buch.', phrase: true },
      { en: 'Listen and repeat.', de: 'Hör zu und wiederhole.', phrase: true },
      { en: 'Work in pairs.', de: 'Arbeite zu zweit.', phrase: true },
      { en: 'What is your name?', de: 'Wie heißt du?', phrase: true },
      { en: 'My name is ...', de: 'Ich heiße ...', phrase: true },
      { en: 'How old are you?', de: 'Wie alt bist du?', phrase: true },
      { en: 'I am eleven years old.', de: 'Ich bin elf Jahre alt.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 2 — At the Zoo
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 2,
    theme: 'At the Zoo',
    unitTitle: 'Unit 2: At the Zoo',
    categories: [
      {
        name: 'Animals',
        words: [
          { en: 'lion', de: 'Löwe' },
          { en: 'elephant', de: 'Elefant' },
          { en: 'monkey', de: 'Affe' },
          { en: 'giraffe', de: 'Giraffe' },
          { en: 'zebra', de: 'Zebra' },
          { en: 'snake', de: 'Schlange' },
          { en: 'parrot', de: 'Papagei' },
          { en: 'tiger', de: 'Tiger' },
          { en: 'bear', de: 'Bär' },
          { en: 'crocodile', de: 'Krokodil' },
          { en: 'penguin', de: 'Pinguin' },
        ],
      },
    ],
    phrases: [
      { en: 'This is a lion.', de: 'Das ist ein Löwe.', phrase: true },
      { en: 'It is big and yellow.', de: 'Es ist groß und gelb.', phrase: true },
      { en: 'The elephant is grey.', de: 'Der Elefant ist grau.', phrase: true },
      { en: 'I like monkeys.', de: 'Ich mag Affen.', phrase: true },
      { en: 'Look at the giraffe!', de: 'Schau dir die Giraffe an!', phrase: true },
      { en: 'It has got a long neck.', de: 'Es hat einen langen Hals.', phrase: true },
      { en: 'My favourite animal is ...', de: 'Mein Lieblingstier ist ...', phrase: true },
      { en: 'It can swim / run / fly.', de: 'Es kann schwimmen / rennen / fliegen.', phrase: true },
      { en: 'Is it a ...?', de: 'Ist es ein ...?', phrase: true },
      { en: 'Yes, it is. / No, it isn\'t.', de: 'Ja, das stimmt. / Nein, das stimmt nicht.', phrase: true },
      { en: 'Where is the ...?', de: 'Wo ist der/die/das ...?', phrase: true },
      { en: 'It is over there.', de: 'Es ist dort drüben.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 3 — Pirates
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 3,
    theme: 'Pirates',
    unitTitle: 'Unit 3: Pirates',
    categories: [
      {
        name: 'Parts of the body',
        words: [
          { en: 'head', de: 'Kopf' },
          { en: 'face', de: 'Gesicht' },
          { en: 'eye', de: 'Auge' },
          { en: 'ear', de: 'Ohr' },
          { en: 'nose', de: 'Nase' },
          { en: 'mouth', de: 'Mund' },
          { en: 'tooth / teeth', de: 'Zahn / Zähne' },
          { en: 'hair', de: 'Haare' },
          { en: 'hand', de: 'Hand' },
          { en: 'arm', de: 'Arm' },
          { en: 'leg', de: 'Bein' },
          { en: 'foot / feet', de: 'Fuß / Füße' },
          { en: 'finger', de: 'Finger' },
          { en: 'shoulder', de: 'Schulter' },
        ],
      },
    ],
    phrases: [
      { en: 'He has got long black hair.', de: 'Er hat lange schwarze Haare.', phrase: true },
      { en: 'She has got blue eyes.', de: 'Sie hat blaue Augen.', phrase: true },
      { en: 'He has got one eye.', de: 'Er hat ein Auge.', phrase: true },
      { en: 'Touch your nose!', de: 'Berühr deine Nase!', phrase: true },
      { en: 'Point to your ear.', de: 'Zeig auf dein Ohr.', phrase: true },
      { en: 'My arm is long.', de: 'Mein Arm ist lang.', phrase: true },
      { en: 'He has got a wooden leg.', de: 'Er hat ein Holzbein.', phrase: true },
      { en: 'How many fingers have you got?', de: 'Wie viele Finger hast du?', phrase: true },
      { en: 'I have got ten fingers.', de: 'Ich habe zehn Finger.', phrase: true },
      { en: 'What does he look like?', de: 'Wie sieht er aus?', phrase: true },
      { en: 'He is tall and thin.', de: 'Er ist groß und dünn.', phrase: true },
      { en: 'She is short and friendly.', de: 'Sie ist klein und freundlich.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 4 — Emotions
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 4,
    theme: 'Emotions',
    unitTitle: 'Unit 4: Emotions',
    categories: [
      {
        name: 'Feelings',
        words: [
          { en: 'happy', de: 'glücklich / fröhlich' },
          { en: 'sad', de: 'traurig' },
          { en: 'angry', de: 'wütend / ärgerlich' },
          { en: 'scared', de: 'ängstlich / verängstigt' },
          { en: 'tired', de: 'müde' },
          { en: 'hungry', de: 'hungrig' },
          { en: 'thirsty', de: 'durstig' },
          { en: 'hot', de: 'heiß / warm' },
          { en: 'cold', de: 'kalt' },
          { en: 'bored', de: 'gelangweilt' },
          { en: 'excited', de: 'aufgeregt / begeistert' },
        ],
      },
    ],
    phrases: [
      { en: 'How are you?', de: 'Wie geht es dir?', phrase: true },
      { en: 'I am happy today.', de: 'Ich bin heute glücklich.', phrase: true },
      { en: 'I feel tired.', de: 'Ich fühle mich müde.', phrase: true },
      { en: 'She is angry because ...', de: 'Sie ist wütend, weil ...', phrase: true },
      { en: 'He is sad.', de: 'Er ist traurig.', phrase: true },
      { en: 'Are you hungry?', de: 'Bist du hungrig?', phrase: true },
      { en: 'Yes, I am very hungry!', de: 'Ja, ich bin sehr hungrig!', phrase: true },
      { en: 'I am scared of spiders.', de: 'Ich habe Angst vor Spinnen.', phrase: true },
      { en: 'Why are you bored?', de: 'Warum bist du gelangweilt?', phrase: true },
      { en: 'I am excited about the trip.', de: 'Ich bin aufgeregt wegen des Ausflugs.', phrase: true },
      { en: 'She looks happy.', de: 'Sie sieht glücklich aus.', phrase: true },
      { en: 'Don\'t be angry!', de: 'Sei nicht wütend!', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 5 — This is our Band
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 5,
    theme: 'This is our Band',
    unitTitle: 'Unit 5: This is our Band',
    categories: [
      {
        name: 'Musicians',
        words: [
          { en: 'singer', de: 'Sänger / Sängerin' },
          { en: 'drummer', de: 'Schlagzeuger / Schlagzeugerin' },
          { en: 'guitarist', de: 'Gitarrist / Gitarristin' },
          { en: 'pianist', de: 'Pianist / Pianistin' },
          { en: 'DJ', de: 'DJ' },
        ],
      },
      {
        name: 'Musical instruments',
        words: [
          { en: 'guitar', de: 'Gitarre' },
          { en: 'drums', de: 'Schlagzeug' },
          { en: 'piano', de: 'Klavier' },
          { en: 'violin', de: 'Geige / Violine' },
        ],
      },
      {
        name: 'Movement verbs',
        words: [
          { en: 'dance', de: 'tanzen' },
          { en: 'jump', de: 'springen' },
          { en: 'run', de: 'rennen / laufen' },
          { en: 'walk', de: 'gehen / spazieren' },
        ],
      },
    ],
    phrases: [
      { en: 'I can play the guitar.', de: 'Ich kann Gitarre spielen.', phrase: true },
      { en: 'She can\'t play the piano.', de: 'Sie kann kein Klavier spielen.', phrase: true },
      { en: 'Can you dance?', de: 'Kannst du tanzen?', phrase: true },
      { en: 'Yes, I can! / No, I can\'t.', de: 'Ja, ich kann! / Nein, ich kann nicht.', phrase: true },
      { en: 'He is a great singer.', de: 'Er ist ein toller Sänger.', phrase: true },
      { en: 'She plays the drums very well.', de: 'Sie spielt sehr gut Schlagzeug.', phrase: true },
      { en: 'Let\'s dance together!', de: 'Lass uns zusammen tanzen!', phrase: true },
      { en: 'Jump up and down!', de: 'Spring auf und ab!', phrase: true },
      { en: 'Our band is fantastic.', de: 'Unsere Band ist fantastisch.', phrase: true },
      { en: 'What instrument do you play?', de: 'Welches Instrument spielst du?', phrase: true },
      { en: 'I want to learn the violin.', de: 'Ich möchte Geige lernen.', phrase: true },
      { en: 'Walk to the beat!', de: 'Geh im Takt!', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 6 — The World's Best Detective
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 6,
    theme: "The World's Best Detective",
    unitTitle: "Unit 6: The World's Best Detective",
    categories: [
      {
        name: 'Action verbs',
        words: [
          { en: 'run', de: 'rennen / laufen' },
          { en: 'walk', de: 'gehen / spazieren' },
          { en: 'jump', de: 'springen' },
          { en: 'sit', de: 'sitzen' },
          { en: 'stand', de: 'stehen' },
          { en: 'open', de: 'öffnen / aufmachen' },
          { en: 'close', de: 'schließen / zumachen' },
          { en: 'look', de: 'schauen / ansehen' },
          { en: 'listen', de: 'zuhören' },
          { en: 'talk', de: 'reden / sprechen' },
          { en: 'eat', de: 'essen' },
          { en: 'drink', de: 'trinken' },
          { en: 'sleep', de: 'schlafen' },
          { en: 'play', de: 'spielen' },
        ],
      },
    ],
    phrases: [
      { en: 'She runs every morning.', de: 'Sie rennt jeden Morgen.', phrase: true },
      { en: 'He eats breakfast at 8 o\'clock.', de: 'Er frühstückt um 8 Uhr.', phrase: true },
      { en: 'Do you play football?', de: 'Spielst du Fußball?', phrase: true },
      { en: 'Yes, I play football on Fridays.', de: 'Ja, ich spiele freitags Fußball.', phrase: true },
      { en: 'She doesn\'t eat meat.', de: 'Sie isst kein Fleisch.', phrase: true },
      { en: 'He doesn\'t listen in class.', de: 'Er hört im Unterricht nicht zu.', phrase: true },
      { en: 'Look at the clue!', de: 'Schau dir den Hinweis an!', phrase: true },
      { en: 'Stand up, please.', de: 'Steh bitte auf.', phrase: true },
      { en: 'Sit down.', de: 'Setz dich hin.', phrase: true },
      { en: 'Open the door!', de: 'Öffne die Tür!', phrase: true },
      { en: 'Close your eyes.', de: 'Schließ die Augen.', phrase: true },
      { en: 'Talk to your partner.', de: 'Sprich mit deinem Partner.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 7 — I love Noodles
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 7,
    theme: 'I love Noodles',
    unitTitle: 'Unit 7: I love Noodles',
    categories: [
      {
        name: 'Food',
        words: [
          { en: 'bread', de: 'Brot' },
          { en: 'rice', de: 'Reis' },
          { en: 'pasta', de: 'Pasta / Nudeln' },
          { en: 'noodles', de: 'Nudeln' },
          { en: 'pizza', de: 'Pizza' },
          { en: 'burger', de: 'Burger / Hamburger' },
          { en: 'sandwich', de: 'Sandwich / belegtes Brot' },
          { en: 'salad', de: 'Salat' },
          { en: 'soup', de: 'Suppe' },
          { en: 'chicken', de: 'Hühnchen / Hähnchen' },
          { en: 'fish', de: 'Fisch' },
          { en: 'egg', de: 'Ei' },
          { en: 'cheese', de: 'Käse' },
          { en: 'fruit', de: 'Obst' },
          { en: 'apple', de: 'Apfel' },
          { en: 'banana', de: 'Banane' },
          { en: 'chocolate', de: 'Schokolade' },
        ],
      },
    ],
    phrases: [
      { en: 'I love noodles!', de: 'Ich liebe Nudeln!', phrase: true },
      { en: 'Do you like pizza?', de: 'Magst du Pizza?', phrase: true },
      { en: 'Yes, I love it. / No, I don\'t like it.', de: 'Ja, ich liebe es. / Nein, ich mag es nicht.', phrase: true },
      { en: 'I eat fruit every day.', de: 'Ich esse jeden Tag Obst.', phrase: true },
      { en: 'She doesn\'t eat fish.', de: 'Sie isst keinen Fisch.', phrase: true },
      { en: 'What\'s for lunch?', de: 'Was gibt es zu Mittag?', phrase: true },
      { en: 'Can I have a sandwich, please?', de: 'Kann ich bitte ein Sandwich haben?', phrase: true },
      { en: 'I don\'t like soup.', de: 'Ich mag keine Suppe.', phrase: true },
      { en: 'He always eats rice for dinner.', de: 'Er isst immer Reis zum Abendessen.', phrase: true },
      { en: 'My favourite food is pizza.', de: 'Mein Lieblingsessen ist Pizza.', phrase: true },
      { en: 'How often do you eat chocolate?', de: 'Wie oft isst du Schokolade?', phrase: true },
      { en: 'I sometimes eat an apple for breakfast.', de: 'Ich esse manchmal einen Apfel zum Frühstück.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 8 — Clothes
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 8,
    theme: 'Clothes',
    unitTitle: 'Unit 8: Clothes',
    categories: [
      {
        name: 'Clothes',
        words: [
          { en: 'shirt', de: 'Hemd' },
          { en: 'T-shirt', de: 'T-Shirt' },
          { en: 'trousers', de: 'Hose' },
          { en: 'jeans', de: 'Jeans' },
          { en: 'shorts', de: 'Shorts / kurze Hose' },
          { en: 'skirt', de: 'Rock' },
          { en: 'dress', de: 'Kleid' },
          { en: 'jacket', de: 'Jacke' },
          { en: 'coat', de: 'Mantel' },
          { en: 'sweater', de: 'Pullover' },
          { en: 'shoes', de: 'Schuhe' },
          { en: 'socks', de: 'Socken' },
          { en: 'hat', de: 'Hut' },
          { en: 'cap', de: 'Mütze / Kappe' },
          { en: 'scarf', de: 'Schal' },
          { en: 'gloves', de: 'Handschuhe' },
          { en: 'boots', de: 'Stiefel' },
        ],
      },
    ],
    phrases: [
      { en: 'I am wearing a blue T-shirt.', de: 'Ich trage ein blaues T-Shirt.', phrase: true },
      { en: 'She is wearing a red dress.', de: 'Sie trägt ein rotes Kleid.', phrase: true },
      { en: 'What are you wearing today?', de: 'Was trägst du heute?', phrase: true },
      { en: 'Put on your jacket!', de: 'Zieh deine Jacke an!', phrase: true },
      { en: 'Take off your shoes.', de: 'Zieh deine Schuhe aus.', phrase: true },
      { en: 'It\'s cold — wear a coat!', de: 'Es ist kalt — trag einen Mantel!', phrase: true },
      { en: 'These jeans are too big.', de: 'Diese Jeans ist zu groß.', phrase: true },
      { en: 'I like your hat!', de: 'Ich mag deinen Hut!', phrase: true },
      { en: 'He is wearing boots today.', de: 'Er trägt heute Stiefel.', phrase: true },
      { en: 'Don\'t forget your scarf!', de: 'Vergiss deinen Schal nicht!', phrase: true },
      { en: 'My favourite clothes are jeans and a hoodie.', de: 'Meine Lieblingskleidung sind Jeans und ein Hoodie.', phrase: true },
      { en: 'Are these your gloves?', de: 'Sind das deine Handschuhe?', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 9 — Shopping (Pets)
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 9,
    theme: 'Shopping — Pets',
    unitTitle: 'Unit 9: Shopping',
    categories: [
      {
        name: 'Pets',
        words: [
          { en: 'dog', de: 'Hund' },
          { en: 'cat', de: 'Katze' },
          { en: 'hamster', de: 'Hamster' },
          { en: 'rabbit', de: 'Kaninchen / Hase' },
          { en: 'fish', de: 'Fisch' },
          { en: 'bird', de: 'Vogel' },
          { en: 'turtle', de: 'Schildkröte' },
          { en: 'mouse', de: 'Maus' },
          { en: 'horse', de: 'Pferd' },
          { en: 'sheep', de: 'Schaf' },
          { en: 'chicken', de: 'Huhn' },
        ],
      },
    ],
    phrases: [
      { en: 'Have you got a pet?', de: 'Hast du ein Haustier?', phrase: true },
      { en: 'Yes, I have got a dog.', de: 'Ja, ich habe einen Hund.', phrase: true },
      { en: 'No, I haven\'t got a pet.', de: 'Nein, ich habe kein Haustier.', phrase: true },
      { en: 'My cat is black and white.', de: 'Meine Katze ist schwarz und weiß.', phrase: true },
      { en: 'I feed my rabbit every day.', de: 'Ich füttere mein Kaninchen jeden Tag.', phrase: true },
      { en: 'Dogs are loyal animals.', de: 'Hunde sind treue Tiere.', phrase: true },
      { en: 'Can I pet your dog?', de: 'Darf ich deinen Hund streicheln?', phrase: true },
      { en: 'I want a hamster for my birthday.', de: 'Ich möchte einen Hamster zu meinem Geburtstag.', phrase: true },
      { en: 'Turtles are slow but interesting.', de: 'Schildkröten sind langsam aber interessant.', phrase: true },
      { en: 'She has got two fish.', de: 'Sie hat zwei Fische.', phrase: true },
      { en: 'The horse is very big.', de: 'Das Pferd ist sehr groß.', phrase: true },
      { en: 'Is a bird a good pet?', de: 'Ist ein Vogel ein gutes Haustier?', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 10 — In a Shop
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 10,
    theme: 'In a Shop',
    unitTitle: 'Unit 10: In a Shop',
    categories: [
      {
        name: 'Numbers (25–1,000)',
        words: [
          { en: 'twenty-five', de: 'fünfundzwanzig' },
          { en: 'thirty', de: 'dreißig' },
          { en: 'forty', de: 'vierzig' },
          { en: 'fifty', de: 'fünfzig' },
          { en: 'sixty', de: 'sechzig' },
          { en: 'seventy', de: 'siebzig' },
          { en: 'eighty', de: 'achtzig' },
          { en: 'ninety', de: 'neunzig' },
          { en: 'one hundred', de: 'hundert' },
          { en: 'two hundred', de: 'zweihundert' },
          { en: 'five hundred', de: 'fünfhundert' },
          { en: 'one thousand', de: 'tausend' },
        ],
      },
      {
        name: 'Demonstratives',
        words: [
          { en: 'this', de: 'dieser / diese / dieses (nah, Singular)' },
          { en: 'that', de: 'jener / jene / jenes (fern, Singular)' },
          { en: 'these', de: 'diese (nah, Plural)' },
          { en: 'those', de: 'jene (fern, Plural)' },
        ],
      },
    ],
    phrases: [
      { en: 'How much is this?', de: 'Wie viel kostet das?', phrase: true },
      { en: 'How much are these?', de: 'Wie viel kosten diese?', phrase: true },
      { en: 'It is five euros.', de: 'Es kostet fünf Euro.', phrase: true },
      { en: 'They are twelve euros fifty.', de: 'Sie kosten zwölf Euro fünfzig.', phrase: true },
      { en: 'Can I help you?', de: 'Kann ich Ihnen helfen?', phrase: true },
      { en: 'I\'d like this T-shirt, please.', de: 'Ich hätte gerne dieses T-Shirt, bitte.', phrase: true },
      { en: 'That is too expensive.', de: 'Das ist zu teuer.', phrase: true },
      { en: 'Here is your change.', de: 'Hier ist Ihr Wechselgeld.', phrase: true },
      { en: 'Do you have this in blue?', de: 'Haben Sie das in Blau?', phrase: true },
      { en: 'I\'ll take it!', de: 'Ich nehme es!', phrase: true },
      { en: 'Those shoes are nice.', de: 'Diese Schuhe dort sind schön.', phrase: true },
      { en: 'Where is the cash desk?', de: 'Wo ist die Kasse?', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 11 — What's the Time?
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 11,
    theme: "What's the Time?",
    unitTitle: "Unit 11: What's the Time?",
    categories: [
      {
        name: 'Free time activities',
        words: [
          { en: 'play football', de: 'Fußball spielen' },
          { en: 'play basketball', de: 'Basketball spielen' },
          { en: 'ride a bike', de: 'Fahrrad fahren' },
          { en: 'swim', de: 'schwimmen' },
          { en: 'read', de: 'lesen' },
          { en: 'draw', de: 'zeichnen' },
          { en: 'paint', de: 'malen' },
          { en: 'watch TV', de: 'fernsehen' },
          { en: 'play video games', de: 'Videospiele spielen' },
          { en: 'listen to music', de: 'Musik hören' },
          { en: 'cook', de: 'kochen' },
        ],
      },
      {
        name: 'Time words',
        words: [
          { en: 'o\'clock', de: 'Uhr (genau)' },
          { en: 'half past', de: 'halb (z.B. halb drei)' },
          { en: 'quarter past', de: 'Viertel nach' },
          { en: 'quarter to', de: 'Viertel vor' },
          { en: 'morning', de: 'Morgen / Vormittag' },
          { en: 'afternoon', de: 'Nachmittag' },
          { en: 'evening', de: 'Abend' },
          { en: 'night', de: 'Nacht' },
        ],
      },
    ],
    phrases: [
      { en: 'What\'s the time?', de: 'Wie viel Uhr ist es?', phrase: true },
      { en: 'It\'s three o\'clock.', de: 'Es ist drei Uhr.', phrase: true },
      { en: 'It\'s half past five.', de: 'Es ist halb sechs.', phrase: true },
      { en: 'It\'s quarter past two.', de: 'Es ist Viertel nach zwei.', phrase: true },
      { en: 'It\'s quarter to eight.', de: 'Es ist Viertel vor acht.', phrase: true },
      { en: 'I play football in the afternoon.', de: 'Ich spiele nachmittags Fußball.', phrase: true },
      { en: 'She reads in the evening.', de: 'Sie liest abends.', phrase: true },
      { en: 'What do you do in your free time?', de: 'Was machst du in deiner Freizeit?', phrase: true },
      { en: 'I love watching TV at night.', de: 'Ich liebe es, nachts fernzusehen.', phrase: true },
      { en: 'He swims every morning.', de: 'Er schwimmt jeden Morgen.', phrase: true },
      { en: 'Let\'s ride our bikes!', de: 'Lass uns Fahrrad fahren!', phrase: true },
      { en: 'I listen to music after school.', de: 'Ich höre nach der Schule Musik.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 12 — The Birthday Cake
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 12,
    theme: 'The Birthday Cake',
    unitTitle: 'Unit 12: The Birthday Cake',
    categories: [
      {
        name: 'Rooms in a house',
        words: [
          { en: 'kitchen', de: 'Küche' },
          { en: 'bathroom', de: 'Badezimmer / Bad' },
          { en: 'bedroom', de: 'Schlafzimmer' },
          { en: 'living room', de: 'Wohnzimmer' },
          { en: 'dining room', de: 'Esszimmer' },
          { en: 'garden', de: 'Garten' },
          { en: 'garage', de: 'Garage' },
          { en: 'hall', de: 'Flur / Eingang' },
          { en: 'stairs', de: 'Treppe' },
          { en: 'balcony', de: 'Balkon' },
        ],
      },
      {
        name: 'Months',
        words: [
          { en: 'January', de: 'Januar / Jänner' },
          { en: 'February', de: 'Februar' },
          { en: 'March', de: 'März' },
          { en: 'April', de: 'April' },
          { en: 'May', de: 'Mai' },
          { en: 'June', de: 'Juni' },
          { en: 'July', de: 'Juli' },
          { en: 'August', de: 'August' },
          { en: 'September', de: 'September' },
          { en: 'October', de: 'Oktober' },
          { en: 'November', de: 'November' },
          { en: 'December', de: 'Dezember' },
        ],
      },
    ],
    phrases: [
      { en: 'My birthday is in March.', de: 'Mein Geburtstag ist im März.', phrase: true },
      { en: 'When is your birthday?', de: 'Wann hast du Geburtstag?', phrase: true },
      { en: 'It\'s on the fifth of June.', de: 'Es ist am fünften Juni.', phrase: true },
      { en: 'The kitchen is next to the hall.', de: 'Die Küche ist neben dem Flur.', phrase: true },
      { en: 'We eat in the dining room.', de: 'Wir essen im Esszimmer.', phrase: true },
      { en: 'My bedroom is upstairs.', de: 'Mein Schlafzimmer ist oben.', phrase: true },
      { en: 'The cake is in the kitchen.', de: 'Der Kuchen ist in der Küche.', phrase: true },
      { en: 'Happy birthday!', de: 'Alles Gute zum Geburtstag!', phrase: true },
      { en: 'How old are you today?', de: 'Wie alt bist du heute?', phrase: true },
      { en: 'I am twelve today.', de: 'Ich bin heute zwölf.', phrase: true },
      { en: 'The party is in the garden.', de: 'Die Party ist im Garten.', phrase: true },
      { en: 'We have a balcony with flowers.', de: 'Wir haben einen Balkon mit Blumen.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 13 — Help!
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 13,
    theme: 'Help!',
    unitTitle: 'Unit 13: Help!',
    categories: [
      {
        name: 'Emergency services',
        words: [
          { en: 'police', de: 'Polizei' },
          { en: 'fire brigade', de: 'Feuerwehr' },
          { en: 'ambulance', de: 'Krankenwagen / Rettung' },
          { en: 'doctor', de: 'Arzt / Ärztin' },
          { en: 'nurse', de: 'Krankenpfleger / Krankenschwester' },
          { en: 'paramedic', de: 'Sanitäter / Sanitäterin' },
          { en: 'lifeguard', de: 'Bademeister / Rettungsschwimmer' },
        ],
      },
      {
        name: 'Accidents and injuries',
        words: [
          { en: 'cut', de: 'Schnitt / Wunde' },
          { en: 'burn', de: 'Verbrennung' },
          { en: 'fall', de: 'Sturz / fallen' },
          { en: 'break', de: 'brechen / Bruch' },
          { en: 'hurt', de: 'verletzt / schmerzen' },
          { en: 'bleeding', de: 'blutend / Blutung' },
          { en: 'dizzy', de: 'schwindelig' },
          { en: 'sick', de: 'krank / übel' },
        ],
      },
    ],
    phrases: [
      { en: 'Help!', de: 'Hilfe!', phrase: true },
      { en: 'Call an ambulance!', de: 'Ruf einen Krankenwagen!', phrase: true },
      { en: 'I am hurt.', de: 'Ich bin verletzt.', phrase: true },
      { en: 'I feel sick.', de: 'Mir ist schlecht / Ich bin krank.', phrase: true },
      { en: 'Where does it hurt?', de: 'Wo tut es weh?', phrase: true },
      { en: 'My arm is bleeding.', de: 'Mein Arm blutet.', phrase: true },
      { en: 'She fell down the stairs.', de: 'Sie ist die Treppe hinuntergefallen.', phrase: true },
      { en: 'He broke his leg.', de: 'Er hat sich das Bein gebrochen.', phrase: true },
      { en: 'I feel dizzy.', de: 'Mir ist schwindelig.', phrase: true },
      { en: 'The fire brigade is coming.', de: 'Die Feuerwehr kommt.', phrase: true },
      { en: 'Don\'t worry, the doctor is here.', de: 'Keine Sorge, der Arzt ist da.', phrase: true },
      { en: 'Please, call the police!', de: 'Bitte ruf die Polizei!', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 14 — It's my Favourite
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 14,
    theme: "It's my Favourite",
    unitTitle: "Unit 14: It's my Favourite",
    categories: [
      {
        name: 'TV programmes',
        words: [
          { en: 'cartoon', de: 'Zeichentrickfilm / Cartoon' },
          { en: 'comedy', de: 'Komödie / Comedy-Show' },
          { en: 'drama', de: 'Drama / Fernsehserie' },
          { en: 'film / movie', de: 'Film' },
          { en: 'news', de: 'Nachrichten' },
          { en: 'sport', de: 'Sport(sendung)' },
          { en: 'quiz show', de: 'Quizshow' },
          { en: 'reality show', de: 'Reality-Show' },
          { en: 'soap opera', de: 'Seifenoper / Soap' },
          { en: 'documentary', de: 'Dokumentation / Doku' },
          { en: 'music video', de: 'Musikvideo' },
          { en: 'weather forecast', de: 'Wetterbericht' },
        ],
      },
      {
        name: 'Books and stories',
        words: [
          { en: 'story', de: 'Geschichte / Erzählung' },
          { en: 'poem', de: 'Gedicht' },
          { en: 'fairy tale', de: 'Märchen' },
          { en: 'comic', de: 'Comic' },
          { en: 'magazine', de: 'Zeitschrift / Magazin' },
          { en: 'adventure', de: 'Abenteuer(roman)' },
          { en: 'mystery', de: 'Kriminalgeschichte / Rätsel' },
          { en: 'fantasy', de: 'Fantasy' },
        ],
      },
    ],
    phrases: [
      { en: 'My favourite TV programme is ...', de: 'Meine Lieblingssendung ist ...', phrase: true },
      { en: 'I watch cartoons on Saturday morning.', de: 'Ich schaue samstags morgens Cartoons.', phrase: true },
      { en: 'Do you like documentaries?', de: 'Magst du Dokumentationen?', phrase: true },
      { en: 'I prefer reading comics.', de: 'Ich lese lieber Comics.', phrase: true },
      { en: 'My favourite book is a fantasy story.', de: 'Mein Lieblingsbuch ist eine Fantasiegeschichte.', phrase: true },
      { en: 'She loves watching quiz shows.', de: 'Sie liebt Quizshows.', phrase: true },
      { en: 'What is your favourite film?', de: 'Was ist dein Lieblingsfilm?', phrase: true },
      { en: 'I read a poem in class today.', de: 'Ich habe heute in der Klasse ein Gedicht gelesen.', phrase: true },
      { en: 'The news is on at eight.', de: 'Die Nachrichten kommen um acht.', phrase: true },
      { en: 'Fairy tales always have a happy ending.', de: 'Märchen haben immer ein gutes Ende.', phrase: true },
      { en: 'I don\'t like reality shows.', de: 'Ich mag keine Reality-Shows.', phrase: true },
      { en: 'This is an exciting adventure story.', de: 'Das ist eine spannende Abenteuergeschichte.', phrase: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UNIT 15 — What are you Going to Do?
  // ─────────────────────────────────────────────────────────────────
  {
    unit: 15,
    theme: 'What are you Going to Do?',
    unitTitle: 'Unit 15: What are you Going to Do?',
    categories: [
      {
        name: 'Future plans',
        words: [
          { en: 'go to the beach', de: 'an den Strand gehen' },
          { en: 'visit my grandparents', de: 'meine Großeltern besuchen' },
          { en: 'go camping', de: 'zelten gehen / campen' },
          { en: 'travel', de: 'reisen' },
          { en: 'have a party', de: 'eine Party feiern' },
          { en: 'play with friends', de: 'mit Freunden spielen' },
          { en: 'go swimming', de: 'schwimmen gehen' },
          { en: 'read books', de: 'Bücher lesen' },
          { en: 'watch films', de: 'Filme schauen / ansehen' },
          { en: 'relax', de: 'sich entspannen / ausruhen' },
        ],
      },
    ],
    phrases: [
      { en: 'What are you going to do?', de: 'Was wirst du tun? / Was hast du vor?', phrase: true },
      { en: 'I am going to go to the beach.', de: 'Ich werde an den Strand gehen.', phrase: true },
      { en: 'She is going to visit her grandparents.', de: 'Sie wird ihre Großeltern besuchen.', phrase: true },
      { en: 'We are going to have a party.', de: 'Wir werden eine Party feiern.', phrase: true },
      { en: 'He is not going to travel this summer.', de: 'Er wird diesen Sommer nicht reisen.', phrase: true },
      { en: 'Are you going to go camping?', de: 'Wirst du zelten gehen?', phrase: true },
      { en: 'Yes, I am! / No, I\'m not.', de: 'Ja, ich werde! / Nein, ich werde nicht.', phrase: true },
      { en: 'I am going to relax at home.', de: 'Ich werde mich zu Hause entspannen.', phrase: true },
      { en: 'What are your plans for the summer?', de: 'Was hast du für den Sommer geplant?', phrase: true },
      { en: 'I hope I\'m going to swim every day.', de: 'Ich hoffe, ich werde jeden Tag schwimmen.', phrase: true },
      { en: 'They are going to read books on holiday.', de: 'Sie werden im Urlaub Bücher lesen.', phrase: true },
      { en: 'I\'m going to play with my friends.', de: 'Ich werde mit meinen Freunden spielen.', phrase: true },
    ],
  },
]

// Helper: get a unit by number
export function getVocabUnit(unit: number): VocabUnit | undefined {
  return MORE1_VOCABULARY.find((u) => u.unit === unit)
}

// Helper: get all words flat for a unit (words + phrases)
export function getAllWordsForUnit(unit: number): VocabWord[] {
  const u = getVocabUnit(unit)
  if (!u) return []
  const words = u.categories.flatMap((c) => c.words)
  return [...words, ...u.phrases]
}

// Helper: get only core vocabulary words (no phrases) for a unit
export function getCoreWordsForUnit(unit: number): VocabWord[] {
  const u = getVocabUnit(unit)
  if (!u) return []
  return u.categories.flatMap((c) => c.words)
}

// Grading utility
export function getLetterGrade(score: number, max: number): string {
  if (max === 0) return 'F'
  const pct = (score / max) * 100
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  if (pct >= 50) return 'E'
  return 'F'
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#10b981'  // emerald
    case 'B': return '#3b82f6'  // blue
    case 'C': return '#f59e0b'  // amber
    case 'D': return '#f97316'  // orange
    case 'E': return '#ef4444'  // red
    default:  return '#6b7280'  // gray
  }
}

export function getGradeEmoji(grade: string): string {
  switch (grade) {
    case 'A': return '🌟'
    case 'B': return '😊'
    case 'C': return '🙂'
    case 'D': return '😐'
    case 'E': return '😟'
    default:  return '😢'
  }
}
