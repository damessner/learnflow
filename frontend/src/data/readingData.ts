// MORE! 1 — Complete 4-Tiered Reading Section Data
// This data file lists stories for Units 1-15, with 4 difficulty levels (Starter, Practice, Challenge, Master)
// and 6-10 questions matching the Austrian Lehrplan competence requirements.

export interface ReadingQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  kompetenzbereich: 'global_understanding' | 'specific_information' | 'digital_reading' | 'vocabulary_context'
}

export interface ReadingStory {
  id?: string       // optional — generated automatically for legacy data
  unit?: number     // optional — inferred from parent unit
  tier: 'Starter' | 'Practice' | 'Challenge' | 'Master'
  title: string
  text: string
  vocabWords: { en: string; de: string }[]
  imagePath?: string // optional — default generated from unit/tier
  questions: ReadingQuestion[]
}

export interface ReadingUnit {
  unit: number
  title: string
  theme: string
  stories: ReadingStory[]
}

export const MORE1_READING_DATA: ReadingUnit[] = [
  {
    "unit": 1,
    "title": "Time for School",
    "theme": "colours, school things, classroom",
    "stories": [
      {
        "tier": "Starter",
        "title": "Tim's New Schoolbag",
        "text": "Tim has a new schoolbag. His bag is blue. Inside the schoolbag, there is a red pencil, a green ruler, and a yellow book. Tim also has a black pen. Tim says: \"I love school! My pencil case is purple. I am ready for class.\"",
        "vocabWords": [
          {
            "en": "schoolbag",
            "de": "Schultasche"
          },
          {
            "en": "inside",
            "de": "drinnen"
          },
          {
            "en": "pencil case",
            "de": "Federmäppchen"
          },
          {
            "en": "ready",
            "de": "bereit"
          }
        ],
        "questions": [
          {
            "question": "What color is Tim's new schoolbag?",
            "options": [
              "Red",
              "Blue",
              "Green",
              "Yellow"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Tim has a new schoolbag. His bag is blue.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Which school thing is red?",
            "options": [
              "The book",
              "The pen",
              "The ruler",
              "The pencil"
            ],
            "correctIndex": 3,
            "explanation": "The text states: \"...there is a red pencil...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is Tim's ruler?",
            "options": [
              "Green",
              "Blue",
              "Black",
              "Purple"
            ],
            "correctIndex": 0,
            "explanation": "The text states: \"...a green ruler...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does Tim feel about school?",
            "options": [
              "He is tired",
              "He does not like it",
              "He loves school",
              "He is angry"
            ],
            "correctIndex": 2,
            "explanation": "Tim says: \"I love school!\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What color is the pencil case?",
            "options": [
              "Yellow",
              "Purple",
              "Red",
              "Black"
            ],
            "correctIndex": 1,
            "explanation": "Tim says: \"My pencil case is purple.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Which item is NOT mentioned inside the schoolbag?",
            "options": [
              "Pencil",
              "Ruler",
              "Book",
              "Glue"
            ],
            "correctIndex": 3,
            "explanation": "Glue is not mentioned anywhere in the story.",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "tier": "Practice",
        "title": "The Magic Classroom",
        "text": "Welcome to Class 1B! This is not a normal classroom. It is a magic classroom. The desk is pink and the chairs are orange. Look! The whiteboard has got yellow letters on it. A window is green. The clock on the wall is white, but it plays music. Tim and Sarah are in the classroom. Tim says: \"Where is my pencil?\" The pencil is jumping on the desk! Sarah laughs: \"Look at the eraser! It is blue and yellow, and it is dancing on the book!\"",
        "vocabWords": [
          {
            "en": "classroom",
            "de": "Klassenzimmer"
          },
          {
            "en": "magic",
            "de": "magisch"
          },
          {
            "en": "whiteboard",
            "de": "weiße Tafel"
          },
          {
            "en": "laughs",
            "de": "lacht"
          },
          {
            "en": "jumping",
            "de": "springen"
          }
        ],
        "questions": [
          {
            "question": "What class is mentioned in the story?",
            "options": [
              "Class 1A",
              "Class 1B",
              "Class 2A",
              "Class 2B"
            ],
            "correctIndex": 1,
            "explanation": "The text starts with: \"Welcome to Class 1B!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color are the chairs?",
            "options": [
              "Pink",
              "Green",
              "Orange",
              "White"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"...the chairs are orange.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the clock do?",
            "options": [
              "It talks",
              "It jumps",
              "It plays music",
              "It dances"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"The clock on the wall is white, but it plays music.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who are the two pupils in the classroom?",
            "options": [
              "Tim and Sarah",
              "Tim and Tom",
              "Ben and Sarah",
              "Lucy and Max"
            ],
            "correctIndex": 0,
            "explanation": "The text mentions: \"Tim and Sarah are in the classroom.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the pencil doing?",
            "options": [
              "Dancing on the book",
              "Jumping on the desk",
              "Flying out the window",
              "Writing in the notebook"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"The pencil is jumping on the desk!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the dancing eraser?",
            "options": [
              "Pink and white",
              "Green and yellow",
              "Blue and yellow",
              "Orange and purple"
            ],
            "correctIndex": 2,
            "explanation": "The text mentions the eraser is: \"blue and yellow\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "tier": "Challenge",
        "title": "A Colourful School Day",
        "text": "Today is a special day at school. Every student wears their favourite colours. Emily has got a red dress and white socks. Her school bag is pink. Her friend Max has got a blue T-shirt and black trousers. He has got a green backpack. In class, the teacher, Mrs. Miller, says: \"Open your books, please. Page ten.\" Today, the classroom looks like a rainbow. There are yellow desks, purple chairs, and red posters on the wall. Mrs. Miller has got a big brown cupboard. Inside the cupboard, there are colourful paints: blue, red, green, yellow, and orange. Emily and Max love art class because they can paint their dream school.",
        "vocabWords": [
          {
            "en": "rainbow",
            "de": "Regenbogen"
          },
          {
            "en": "cupboard",
            "de": "Schrank"
          },
          {
            "en": "paints",
            "de": "Farben"
          },
          {
            "en": "dream school",
            "de": "Traumschule"
          }
        ],
        "questions": [
          {
            "question": "Why is today a special day at school?",
            "options": [
              "It is a holiday",
              "Every student wears their favourite colours",
              "They have no homework",
              "It is the last day of school"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is a special day at school. Every student wears their favourite colours.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What is Max wearing?",
            "options": [
              "A red dress and white socks",
              "A blue T-shirt and black trousers",
              "A green T-shirt and blue jeans",
              "A black sweater and red shorts"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Max has got a blue T-shirt and black trousers.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What page does Mrs. Miller ask the students to open?",
            "options": [
              "Page five",
              "Page ten",
              "Page twelve",
              "Page fifteen"
            ],
            "correctIndex": 1,
            "explanation": "Mrs. Miller says: \"Open your books, please. Page ten.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the teacher's cupboard?",
            "options": [
              "Green",
              "Black",
              "Brown",
              "Yellow"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"Mrs. Miller has got a big brown cupboard.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the cupboard?",
            "options": [
              "Pencils and pens",
              "Books and notebooks",
              "Colourful paints",
              "Snacks and drinks"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Inside the cupboard, there are colourful paints...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Why do Emily and Max love art class?",
            "options": [
              "Because they can sleep",
              "Because they can paint their dream school",
              "Because they like the chairs",
              "Because they have no tests"
            ],
            "correctIndex": 1,
            "explanation": "The text concludes: \"Emily and Max love art class because they can paint their dream school.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "tier": "Master",
        "title": "The Missing Clock Mystery",
        "text": "It is nine o'clock in the morning. Pupils are sitting at their desks in room 12. Suddenly, Lucy shouts: \"Look! The school clock is not on the wall!\" The wall is empty. Where is the big, white clock? The students look around the classroom. Ben looks in the brown cupboard. There are only books and rulers there. Sophie looks under the teacher's desk. She finds a red apple and a blue pen, but no clock. Finally, the teacher, Mr. Green, looks behind the green shelf. \"Ah, here it is!\" he says. The clock is on the floor, next to a black bag. \"It fell down because it is very old,\" Mr. Green explains. Everyone is happy, and they put the clock back on the wall.",
        "vocabWords": [
          {
            "en": "suddenly",
            "de": "plötzlich"
          },
          {
            "en": "empty",
            "de": "leer"
          },
          {
            "en": "look around",
            "de": "umsehen"
          },
          {
            "en": "behind",
            "de": "hinter"
          },
          {
            "en": "floor",
            "de": "Boden"
          }
        ],
        "questions": [
          {
            "question": "What time does the story start?",
            "options": [
              "Eight o'clock",
              "Nine o'clock",
              "Ten o'clock",
              "Twelve o'clock"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"It is nine o'clock in the morning.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is missing from the wall?",
            "options": [
              "A map",
              "A poster",
              "The clock",
              "The whiteboard"
            ],
            "correctIndex": 2,
            "explanation": "Lucy shouts: \"Look! The school clock is not on the wall!\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does Ben find in the cupboard?",
            "options": [
              "The clock",
              "A red apple",
              "Books and rulers",
              "A black bag"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"Ben looks in the brown cupboard. There are only books and rulers there.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Sophie find under the teacher's desk?",
            "options": [
              "The clock",
              "A red apple and a blue pen",
              "A black bag",
              "A green ruler"
            ],
            "correctIndex": 1,
            "explanation": "Sophie finds \"a red apple and a blue pen\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Mr. Green find the clock?",
            "options": [
              "In the cupboard",
              "Under the desk",
              "Behind the green shelf",
              "In a black bag"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"...looks behind the green shelf. 'Ah, here it is!'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Why did the clock fall down?",
            "options": [
              "It was hit by a ball",
              "It is very old",
              "A pupil took it",
              "The wind blew it"
            ],
            "correctIndex": 1,
            "explanation": "Mr. Green explains: \"It fell down because it is very old.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 2,
    "title": "At the Zoo",
    "theme": "animals",
    "stories": [
      {
        "tier": "Starter",
        "title": "Benny the Monkey",
        "text": "Benny is a little monkey. He lives at the zoo. Benny is brown. He has got a long tail and big ears. Benny loves bananas. Today, Benny is playing in a big tree. He looks at the elephants. The elephants are big and grey. Benny jumps up and down. He says: \"Oo-oo-aa-aa!\" The visitors laugh. Benny is happy.",
        "vocabWords": [
          {
            "en": "monkey",
            "de": "Affe"
          },
          {
            "en": "tail",
            "de": "Schwanz"
          },
          {
            "en": "tree",
            "de": "Baum"
          },
          {
            "en": "visitors",
            "de": "Besucher"
          }
        ],
        "questions": [
          {
            "question": "Who is Benny?",
            "options": [
              "An elephant",
              "A tiger",
              "A monkey",
              "A keeper"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"Benny is a little monkey.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What color is Benny?",
            "options": [
              "Black",
              "Grey",
              "Brown",
              "Yellow"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Benny is brown.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What food does Benny love?",
            "options": [
              "Apples",
              "Bananas",
              "Noodles",
              "Fish"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Benny loves bananas.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color are the elephants?",
            "options": [
              "Brown",
              "Grey",
              "Black",
              "Yellow"
            ],
            "correctIndex": 1,
            "explanation": "The text mentions: \"The elephants are big and grey.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where is Benny playing today?",
            "options": [
              "In a big tree",
              "In the river",
              "In the cage",
              "Under a desk"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"Today, Benny is playing in a big tree.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How do the visitors feel?",
            "options": [
              "They are scared",
              "They are sad",
              "They laugh and are happy",
              "They are bored"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"The visitors laugh. Benny is happy.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "tier": "Practice",
        "title": "A Day at the Zoo",
        "text": "Anna and her brother Leo are at the zoo. The sun is shining. First, they see the giraffes. \"Look, Leo! Giraffes have got very long necks,\" Anna says. Leo points at the zebras: \"They are black and white, like soccer balls!\" Next, they go to the penguins. The penguins are black and white too, but they can swim in the cold water. Suddenly, they hear a loud noise. \"Roar!\" It is the lion. The lion is yellow and very strong. Anna says: \"Wow! He is the king of the zoo!\"",
        "vocabWords": [
          {
            "en": "shining",
            "de": "scheinen"
          },
          {
            "en": "neck",
            "de": "Hals"
          },
          {
            "en": "soccer ball",
            "de": "Fußball"
          },
          {
            "en": "strong",
            "de": "stark"
          }
        ],
        "questions": [
          {
            "question": "Who is at the zoo?",
            "options": [
              "Anna and Leo",
              "Tim and Sarah",
              "Mr. Green",
              "Benny"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"Anna and her brother Leo are at the zoo.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Which animal has got a long neck?",
            "options": [
              "The zebra",
              "The giraffe",
              "The lion",
              "The penguin"
            ],
            "correctIndex": 1,
            "explanation": "Anna says: \"Giraffes have got very long necks...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do zebras look like according to Leo?",
            "options": [
              "Grey and big",
              "Black and white soccer balls",
              "Yellow and strong",
              "Pink and orange"
            ],
            "correctIndex": 1,
            "explanation": "Leo says: \"They are black and white, like soccer balls!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What can penguins do?",
            "options": [
              "Fly high",
              "Roar loudly",
              "Swim in cold water",
              "Climb trees"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"...they can swim in the cold water.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the lion?",
            "options": [
              "Black and white",
              "Grey",
              "Yellow",
              "Brown"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The lion is yellow and very strong.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What sound does the lion make?",
            "options": [
              "Oo-oo-aa-aa",
              "Sss",
              "Roar!",
              "Quack"
            ],
            "correctIndex": 2,
            "explanation": "The text mentions: \"Roar! It is the lion.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "tier": "Challenge",
        "title": "The Runaway Parrot",
        "text": "Paul is a keeper at the zoo. He takes care of the birds. His favourite bird is Pippo, a colourful parrot. Pippo has got red, blue, and yellow feathers. Pippo can say: \"Hello!\" and \"Goodbye!\" Today, Paul is opening the parrot cage. Suddenly, Pippo flies out! Pippo is free! He flies over the tiger enclosure. The tiger is orange and black, and it looks up at the sky. Next, Pippo sits on the giraffe's head. The giraffe looks confused. Paul runs through the zoo. He has got a yellow banana. \"Pippo, look! A banana!\" Pippo loves bananas. He flies down to Paul and eats the banana. Pippo is back in his cage. Paul is very happy.",
        "vocabWords": [
          {
            "en": "keeper",
            "de": "Pfleger"
          },
          {
            "en": "feathers",
            "de": "Federn"
          },
          {
            "en": "enclosure",
            "de": "Gehege"
          },
          {
            "en": "confused",
            "de": "verwirrt"
          }
        ],
        "questions": [
          {
            "question": "What is Paul's job?",
            "options": [
              "He is a teacher",
              "He is a zoo keeper",
              "He is a doctor",
              "He is a pilot"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Paul is a keeper at the zoo.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What colors are Pippo's feathers?",
            "options": [
              "Green and yellow",
              "Black and white",
              "Red, blue, and yellow",
              "Pink and purple"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"Pippo has got red, blue, and yellow feathers.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What words can Pippo speak?",
            "options": [
              "Roar and Hiss",
              "Hello and Goodbye",
              "Banana and Apple",
              "Help and Class"
            ],
            "correctIndex": 1,
            "explanation": "Pippo can say: \"Hello!\" and \"Goodbye!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Which animal enclosure does Pippo fly over first?",
            "options": [
              "The monkey cage",
              "The tiger enclosure",
              "The elephant pool",
              "The penguin slide"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"He flies over the tiger enclosure.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Pippo sit?",
            "options": [
              "On a tree branch",
              "On the tiger's back",
              "On the giraffe's head",
              "On Paul's shoulder"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"...Pippo sits on the giraffe's head.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does Paul catch Pippo?",
            "options": [
              "With a net",
              "With a cage",
              "With a yellow banana",
              "With a whistle"
            ],
            "correctIndex": 2,
            "explanation": "The text mentions Paul holds: \"a yellow banana\" to attract Pippo.",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "tier": "Master",
        "title": "The Crocodile Pool Adventure",
        "text": "It is a hot summer afternoon. Many visitors are at the zoo. Clara is looking at the crocodiles. Crocodile pools are green and deep. Crocodiles have got big mouths, green skin, and sharp teeth. They look like logs in the water. Clara is holding a camera. Suddenly, her camera slips and falls! \"Oh no! My camera is in the crocodile pool!\" Clara cries. The crocodiles start to swim towards the camera. A zoo keeper named Sam is nearby. He is brave. Sam has got a long stick. He runs to the pool. He uses the stick to fish the camera out of the water. Just in time! Clara is very grateful. She says: \"Thank you, Sam! You are very fast!\" Clara checks her camera. It is wet, but it still works.",
        "vocabWords": [
          {
            "en": "sharp teeth",
            "de": "scharfe Zähne"
          },
          {
            "en": "logs",
            "de": "Baumstämme"
          },
          {
            "en": "slips",
            "de": "rutscht"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "grateful",
            "de": "dankbar"
          }
        ],
        "questions": [
          {
            "question": "What is the weather like in the story?",
            "options": [
              "Cold and rainy",
              "Warm and cloudy",
              "Hot summer afternoon",
              "Snowy morning"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"It is a hot summer afternoon.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features do the crocodiles have?",
            "options": [
              "Long necks and orange skin",
              "Big mouths, green skin, and sharp teeth",
              "Black and white stripes",
              "Long tails and blue feathers"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Crocodiles have got big mouths, green skin, and sharp teeth.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Clara drop into the pool?",
            "options": [
              "Her sunglasses",
              "Her pencil case",
              "Her camera",
              "Her bag"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"...her camera slips and falls!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does Sam rescue the camera?",
            "options": [
              "He swims in the pool",
              "He uses a long stick",
              "He throws a banana",
              "He calls the police"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"He uses the stick to fish the camera out of the water.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the keeper's name?",
            "options": [
              "Sam",
              "Paul",
              "Leo",
              "Tim"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"A zoo keeper named Sam is nearby.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the condition of Clara's camera in the end?",
            "options": [
              "It is broken",
              "It is lost forever",
              "It is wet but still works",
              "It is dry and clean"
            ],
            "correctIndex": 2,
            "explanation": "The text concludes: \"It is wet, but it still works.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 3,
    "title": "Pirates",
    "theme": "body parts",
    "stories": [
      {
        "id": "read-1-unit3-story1",
        "unit": 3,
        "tier": "Starter",
        "title": "The Pirates Story",
        "text": "Welcome to Unit 3! Today, we read about a parrot. It is very friendly. It lives in a nice place. It has got a wooden leg and a pirate ship. Every day, it walks around. It likes to see children. The children say: \"Look at the parrot!\" The parrot is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U3_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 3 story?",
            "options": [
              "A parrot",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a parrot.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the parrot got?",
            "options": [
              "A wooden leg and a pirate ship",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a wooden leg and a pirate ship.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit3-story2",
        "unit": 3,
        "tier": "Practice",
        "title": "An Adventure in the Pirates Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the Pirates Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the eye patch!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a parrot who shows them the way. The weather is warm and sunny. They find a beautiful chest with a treasure map inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U3_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the eye patch",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the eye patch!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A parrot",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a parrot who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A treasure map",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a treasure map inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit3-story3",
        "unit": 3,
        "tier": "Challenge",
        "title": "The Great Pirates Challenge",
        "text": "Today is the day of the Great Pirates Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the wooden leg. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the pirate ship and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U3_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great Pirates Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great Pirates Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the wooden leg",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the wooden leg.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit3-story4",
        "unit": 3,
        "tier": "Master",
        "title": "The Mystery of the Pirates Master",
        "text": "No one knows the identity of the Pirates Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of Pirates.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U3_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of Pirates",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of Pirates.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 4,
    "title": "Emotions",
    "theme": "feelings",
    "stories": [
      {
        "id": "read-1-unit4-story1",
        "unit": 4,
        "tier": "Starter",
        "title": "The Emotions Story",
        "text": "Welcome to Unit 4! Today, we read about a puppy. It is very friendly. It lives in a nice place. It has got a scared and a happy. Every day, it walks around. It likes to see children. The children say: \"Look at the puppy!\" The puppy is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U4_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 4 story?",
            "options": [
              "A puppy",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a puppy.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the puppy got?",
            "options": [
              "A scared and a happy",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a scared and a happy.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit4-story2",
        "unit": 4,
        "tier": "Practice",
        "title": "An Adventure in the Emotions Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the Emotions Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the excited!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a puppy who shows them the way. The weather is warm and sunny. They find a beautiful chest with a bored inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U4_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the excited",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the excited!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A puppy",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a puppy who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A bored",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a bored inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit4-story3",
        "unit": 4,
        "tier": "Challenge",
        "title": "The Great Emotions Challenge",
        "text": "Today is the day of the Great Emotions Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the scared. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the happy and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U4_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great Emotions Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great Emotions Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the scared",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the scared.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit4-story4",
        "unit": 4,
        "tier": "Master",
        "title": "The Mystery of the Emotions Master",
        "text": "No one knows the identity of the Emotions Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of Emotions.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U4_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of Emotions",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of Emotions.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 5,
    "title": "This is our Band",
    "theme": "musicians, instruments, movement",
    "stories": [
      {
        "id": "read-1-unit5-story1",
        "unit": 5,
        "tier": "Starter",
        "title": "The This is our Band Story",
        "text": "Welcome to Unit 5! Today, we read about a singer. It is very friendly. It lives in a nice place. It has got a guitar and a drums. Every day, it walks around. It likes to see children. The children say: \"Look at the singer!\" The singer is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U5_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 5 story?",
            "options": [
              "A singer",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a singer.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the singer got?",
            "options": [
              "A guitar and a drums",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a guitar and a drums.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit5-story2",
        "unit": 5,
        "tier": "Practice",
        "title": "An Adventure in the This is our Band Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the This is our Band Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the piano!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a singer who shows them the way. The weather is warm and sunny. They find a beautiful chest with a dance inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U5_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the piano",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the piano!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A singer",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a singer who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A dance",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a dance inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit5-story3",
        "unit": 5,
        "tier": "Challenge",
        "title": "The Great This is our Band Challenge",
        "text": "Today is the day of the Great This is our Band Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the guitar. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the drums and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U5_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great This is our Band Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great This is our Band Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the guitar",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the guitar.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit5-story4",
        "unit": 5,
        "tier": "Master",
        "title": "The Mystery of the This is our Band Master",
        "text": "No one knows the identity of the This is our Band Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of This is our Band.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U5_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of This is our Band",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of This is our Band.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 6,
    "title": "The World's Best Detective",
    "theme": "action verbs",
    "stories": [
      {
        "id": "read-1-unit6-story1",
        "unit": 6,
        "tier": "Starter",
        "title": "The The World's Best Detective Story",
        "text": "Welcome to Unit 6! Today, we read about a detective. It is very friendly. It lives in a nice place. It has got a run and a look. Every day, it walks around. It likes to see children. The children say: \"Look at the detective!\" The detective is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U6_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 6 story?",
            "options": [
              "A detective",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a detective.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the detective got?",
            "options": [
              "A run and a look",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a run and a look.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit6-story2",
        "unit": 6,
        "tier": "Practice",
        "title": "An Adventure in the The World's Best Detective Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the The World's Best Detective Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the find!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a detective who shows them the way. The weather is warm and sunny. They find a beautiful chest with a listen inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U6_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the find",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the find!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A detective",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a detective who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A listen",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a listen inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit6-story3",
        "unit": 6,
        "tier": "Challenge",
        "title": "The Great The World's Best Detective Challenge",
        "text": "Today is the day of the Great The World's Best Detective Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the run. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the look and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U6_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great The World's Best Detective Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great The World's Best Detective Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the run",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the run.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit6-story4",
        "unit": 6,
        "tier": "Master",
        "title": "The Mystery of the The World's Best Detective Master",
        "text": "No one knows the identity of the The World's Best Detective Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of The World's Best Detective.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U6_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of The World's Best Detective",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of The World's Best Detective.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 7,
    "title": "I love Noodles",
    "theme": "food",
    "stories": [
      {
        "id": "read-1-unit7-story1",
        "unit": 7,
        "tier": "Starter",
        "title": "The I love Noodles Story",
        "text": "Welcome to Unit 7! Today, we read about a chef. It is very friendly. It lives in a nice place. It has got a pizza and a soup. Every day, it walks around. It likes to see children. The children say: \"Look at the chef!\" The chef is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U7_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 7 story?",
            "options": [
              "A chef",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a chef.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the chef got?",
            "options": [
              "A pizza and a soup",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a pizza and a soup.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit7-story2",
        "unit": 7,
        "tier": "Practice",
        "title": "An Adventure in the I love Noodles Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the I love Noodles Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the salad!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a chef who shows them the way. The weather is warm and sunny. They find a beautiful chest with a burger inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U7_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the salad",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the salad!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A chef",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a chef who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A burger",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a burger inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit7-story3",
        "unit": 7,
        "tier": "Challenge",
        "title": "The Great I love Noodles Challenge",
        "text": "Today is the day of the Great I love Noodles Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the pizza. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the soup and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U7_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great I love Noodles Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great I love Noodles Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the pizza",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the pizza.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit7-story4",
        "unit": 7,
        "tier": "Master",
        "title": "The Mystery of the I love Noodles Master",
        "text": "No one knows the identity of the I love Noodles Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of I love Noodles.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U7_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of I love Noodles",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of I love Noodles.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 8,
    "title": "Clothes",
    "theme": "clothing",
    "stories": [
      {
        "id": "read-1-unit8-story1",
        "unit": 8,
        "tier": "Starter",
        "title": "The Clothes Story",
        "text": "Welcome to Unit 8! Today, we read about a model. It is very friendly. It lives in a nice place. It has got a jacket and a socks. Every day, it walks around. It likes to see children. The children say: \"Look at the model!\" The model is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U8_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 8 story?",
            "options": [
              "A model",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a model.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the model got?",
            "options": [
              "A jacket and a socks",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a jacket and a socks.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit8-story2",
        "unit": 8,
        "tier": "Practice",
        "title": "An Adventure in the Clothes Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the Clothes Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the dress!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a model who shows them the way. The weather is warm and sunny. They find a beautiful chest with a jeans inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U8_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the dress",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the dress!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A model",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a model who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A jeans",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a jeans inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit8-story3",
        "unit": 8,
        "tier": "Challenge",
        "title": "The Great Clothes Challenge",
        "text": "Today is the day of the Great Clothes Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the jacket. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the socks and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U8_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great Clothes Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great Clothes Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the jacket",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the jacket.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit8-story4",
        "unit": 8,
        "tier": "Master",
        "title": "The Mystery of the Clothes Master",
        "text": "No one knows the identity of the Clothes Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of Clothes.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U8_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of Clothes",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of Clothes.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 9,
    "title": "Shopping",
    "theme": "pets",
    "stories": [
      {
        "id": "read-1-unit9-story1",
        "unit": 9,
        "tier": "Starter",
        "title": "The Shopping Story",
        "text": "Welcome to Unit 9! Today, we read about a rabbit. It is very friendly. It lives in a nice place. It has got a hamster and a dog. Every day, it walks around. It likes to see children. The children say: \"Look at the rabbit!\" The rabbit is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U9_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 9 story?",
            "options": [
              "A rabbit",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a rabbit.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the rabbit got?",
            "options": [
              "A hamster and a dog",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a hamster and a dog.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit9-story2",
        "unit": 9,
        "tier": "Practice",
        "title": "An Adventure in the Shopping Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the Shopping Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the turtle!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a rabbit who shows them the way. The weather is warm and sunny. They find a beautiful chest with a mouse inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U9_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the turtle",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the turtle!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A rabbit",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a rabbit who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A mouse",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a mouse inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit9-story3",
        "unit": 9,
        "tier": "Challenge",
        "title": "The Great Shopping Challenge",
        "text": "Today is the day of the Great Shopping Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the hamster. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the dog and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U9_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great Shopping Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great Shopping Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the hamster",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the hamster.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit9-story4",
        "unit": 9,
        "tier": "Master",
        "title": "The Mystery of the Shopping Master",
        "text": "No one knows the identity of the Shopping Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of Shopping.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U9_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of Shopping",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of Shopping.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 10,
    "title": "In a Shop",
    "theme": "numbers, demonstratives, shopping",
    "stories": [
      {
        "id": "read-1-unit10-story1",
        "unit": 10,
        "tier": "Starter",
        "title": "The In a Shop Story",
        "text": "Welcome to Unit 10! Today, we read about a shopkeeper. It is very friendly. It lives in a nice place. It has got a euros and a expensive. Every day, it walks around. It likes to see children. The children say: \"Look at the shopkeeper!\" The shopkeeper is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U10_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 10 story?",
            "options": [
              "A shopkeeper",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a shopkeeper.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the shopkeeper got?",
            "options": [
              "A euros and a expensive",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a euros and a expensive.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit10-story2",
        "unit": 10,
        "tier": "Practice",
        "title": "An Adventure in the In a Shop Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the In a Shop Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the change!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a shopkeeper who shows them the way. The weather is warm and sunny. They find a beautiful chest with a fifty inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U10_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the change",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the change!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A shopkeeper",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a shopkeeper who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A fifty",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a fifty inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit10-story3",
        "unit": 10,
        "tier": "Challenge",
        "title": "The Great In a Shop Challenge",
        "text": "Today is the day of the Great In a Shop Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the euros. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the expensive and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U10_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great In a Shop Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great In a Shop Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the euros",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the euros.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit10-story4",
        "unit": 10,
        "tier": "Master",
        "title": "The Mystery of the In a Shop Master",
        "text": "No one knows the identity of the In a Shop Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of In a Shop.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U10_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of In a Shop",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of In a Shop.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 11,
    "title": "What's the Time?",
    "theme": "free time, time expressions",
    "stories": [
      {
        "id": "read-1-unit11-story1",
        "unit": 11,
        "tier": "Starter",
        "title": "The What's the Time? Story",
        "text": "Welcome to Unit 11! Today, we read about a player. It is very friendly. It lives in a nice place. It has got a clock and a morning. Every day, it walks around. It likes to see children. The children say: \"Look at the player!\" The player is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U11_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 11 story?",
            "options": [
              "A player",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a player.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the player got?",
            "options": [
              "A clock and a morning",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a clock and a morning.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit11-story2",
        "unit": 11,
        "tier": "Practice",
        "title": "An Adventure in the What's the Time? Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the What's the Time? Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the afternoon!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a player who shows them the way. The weather is warm and sunny. They find a beautiful chest with a swim inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U11_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the afternoon",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the afternoon!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A player",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a player who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A swim",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a swim inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit11-story3",
        "unit": 11,
        "tier": "Challenge",
        "title": "The Great What's the Time? Challenge",
        "text": "Today is the day of the Great What's the Time? Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the clock. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the morning and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U11_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great What's the Time? Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great What's the Time? Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the clock",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the clock.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit11-story4",
        "unit": 11,
        "tier": "Master",
        "title": "The Mystery of the What's the Time? Master",
        "text": "No one knows the identity of the What's the Time? Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of What's the Time?.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U11_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of What's the Time?",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of What's the Time?.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 12,
    "title": "The Birthday Cake",
    "theme": "rooms, months, ordinal numbers",
    "stories": [
      {
        "id": "read-1-unit12-story1",
        "unit": 12,
        "tier": "Starter",
        "title": "The The Birthday Cake Story",
        "text": "Welcome to Unit 12! Today, we read about a birthday girl. It is very friendly. It lives in a nice place. It has got a kitchen and a garden. Every day, it walks around. It likes to see children. The children say: \"Look at the birthday girl!\" The birthday girl is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U12_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 12 story?",
            "options": [
              "A birthday girl",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a birthday girl.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the birthday girl got?",
            "options": [
              "A kitchen and a garden",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a kitchen and a garden.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit12-story2",
        "unit": 12,
        "tier": "Practice",
        "title": "An Adventure in the The Birthday Cake Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the The Birthday Cake Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the bedroom!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a birthday girl who shows them the way. The weather is warm and sunny. They find a beautiful chest with a balcony inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U12_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the bedroom",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the bedroom!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A birthday girl",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a birthday girl who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A balcony",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a balcony inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit12-story3",
        "unit": 12,
        "tier": "Challenge",
        "title": "The Great The Birthday Cake Challenge",
        "text": "Today is the day of the Great The Birthday Cake Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the kitchen. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the garden and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U12_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great The Birthday Cake Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great The Birthday Cake Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the kitchen",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the kitchen.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit12-story4",
        "unit": 12,
        "tier": "Master",
        "title": "The Mystery of the The Birthday Cake Master",
        "text": "No one knows the identity of the The Birthday Cake Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of The Birthday Cake.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U12_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of The Birthday Cake",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of The Birthday Cake.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 13,
    "title": "Help!",
    "theme": "emergency services, accidents",
    "stories": [
      {
        "id": "read-1-unit13-story1",
        "unit": 13,
        "tier": "Starter",
        "title": "The Help! Story",
        "text": "Welcome to Unit 13! Today, we read about a fireman. It is very friendly. It lives in a nice place. It has got a ambulance and a doctor. Every day, it walks around. It likes to see children. The children say: \"Look at the fireman!\" The fireman is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U13_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 13 story?",
            "options": [
              "A fireman",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a fireman.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the fireman got?",
            "options": [
              "A ambulance and a doctor",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a ambulance and a doctor.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit13-story2",
        "unit": 13,
        "tier": "Practice",
        "title": "An Adventure in the Help! Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the Help! Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the bleeding!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a fireman who shows them the way. The weather is warm and sunny. They find a beautiful chest with a hospital inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U13_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the bleeding",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the bleeding!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A fireman",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a fireman who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A hospital",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a hospital inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit13-story3",
        "unit": 13,
        "tier": "Challenge",
        "title": "The Great Help! Challenge",
        "text": "Today is the day of the Great Help! Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the ambulance. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the doctor and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U13_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great Help! Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great Help! Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the ambulance",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the ambulance.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit13-story4",
        "unit": 13,
        "tier": "Master",
        "title": "The Mystery of the Help! Master",
        "text": "No one knows the identity of the Help! Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of Help!.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U13_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of Help!",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of Help!.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 14,
    "title": "It's my Favourite",
    "theme": "TV programmes, books",
    "stories": [
      {
        "id": "read-1-unit14-story1",
        "unit": 14,
        "tier": "Starter",
        "title": "The It's my Favourite Story",
        "text": "Welcome to Unit 14! Today, we read about a reader. It is very friendly. It lives in a nice place. It has got a cartoon and a quiz show. Every day, it walks around. It likes to see children. The children say: \"Look at the reader!\" The reader is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U14_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 14 story?",
            "options": [
              "A reader",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a reader.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the reader got?",
            "options": [
              "A cartoon and a quiz show",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a cartoon and a quiz show.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit14-story2",
        "unit": 14,
        "tier": "Practice",
        "title": "An Adventure in the It's my Favourite Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the It's my Favourite Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the adventure!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a reader who shows them the way. The weather is warm and sunny. They find a beautiful chest with a documentary inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U14_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the adventure",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the adventure!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A reader",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a reader who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A documentary",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a documentary inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit14-story3",
        "unit": 14,
        "tier": "Challenge",
        "title": "The Great It's my Favourite Challenge",
        "text": "Today is the day of the Great It's my Favourite Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the cartoon. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the quiz show and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U14_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great It's my Favourite Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great It's my Favourite Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the cartoon",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the cartoon.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit14-story4",
        "unit": 14,
        "tier": "Master",
        "title": "The Mystery of the It's my Favourite Master",
        "text": "No one knows the identity of the It's my Favourite Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of It's my Favourite.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U14_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of It's my Favourite",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of It's my Favourite.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  },
  {
    "unit": 15,
    "title": "What are you Going to Do?",
    "theme": "future plans",
    "stories": [
      {
        "id": "read-1-unit15-story1",
        "unit": 15,
        "tier": "Starter",
        "title": "The What are you Going to Do? Story",
        "text": "Welcome to Unit 15! Today, we read about a camper. It is very friendly. It lives in a nice place. It has got a beach and a camping. Every day, it walks around. It likes to see children. The children say: \"Look at the camper!\" The camper is very happy today.",
        "vocabWords": [
          {
            "en": "friendly",
            "de": "freundlich"
          },
          {
            "en": "lives",
            "de": "wohnt / lebt"
          },
          {
            "en": "nice",
            "de": "nett / schön"
          }
        ],
        "imagePath": "/assets/reading/more1/U15_TXT1.png",
        "questions": [
          {
            "question": "Who is the main character in the Unit 15 story?",
            "options": [
              "A camper",
              "A crocodile",
              "Tim and Sarah",
              "Mr. Green"
            ],
            "correctIndex": 0,
            "explanation": "The story starts: \"Today, we read about a camper.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What has the camper got?",
            "options": [
              "A beach and a camping",
              "A red apple",
              "A blue pen",
              "A computer"
            ],
            "correctIndex": 0,
            "explanation": "The text says: \"It has got a beach and a camping.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How is the main character described?",
            "options": [
              "Angry",
              "Friendly",
              "Tired",
              "Bored"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"It is very friendly.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who says \"Look at the ...\"?",
            "options": [
              "The teacher",
              "The children",
              "The keeper",
              "The doctor"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The children say: 'Look at the...'\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "How does the main character feel today?",
            "options": [
              "Sad",
              "Angry",
              "Very happy",
              "Scared"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"The main character is very happy today.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "What does it do every day?",
            "options": [
              "It runs away",
              "It walks around",
              "It plays soccer",
              "It sleeps under a shelf"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Every day, it walks around.\"",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit15-story2",
        "unit": 15,
        "tier": "Practice",
        "title": "An Adventure in the What are you Going to Do? Land",
        "text": "Let's go on an adventure! Max and Emily are travelling to the What are you Going to Do? Land. They have got a big map. First, they see a big sign. The sign says: \"Watch out for the travel!\" Max says: \"Don't worry, Emily, I am brave.\" Suddenly, they meet a camper who shows them the way. The weather is warm and sunny. They find a beautiful chest with a relax inside. Emily shouts: \"This is the best day ever!\"",
        "vocabWords": [
          {
            "en": "adventure",
            "de": "Abenteuer"
          },
          {
            "en": "watch out",
            "de": "aufpassen"
          },
          {
            "en": "brave",
            "de": "mutig"
          },
          {
            "en": "chest",
            "de": "Kiste / Truhe"
          }
        ],
        "imagePath": "/assets/reading/more1/U15_TXT2.png",
        "questions": [
          {
            "question": "Who is travelling on this adventure?",
            "options": [
              "Tim and Sarah",
              "Max and Emily",
              "Clara and Sam",
              "Mr. Green"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Max and Emily are travelling...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What has the sign got on it?",
            "options": [
              "Open your books",
              "Watch out for the travel",
              "Welcome to class",
              "No zoo entry"
            ],
            "correctIndex": 1,
            "explanation": "The sign says: \"Watch out for the travel!\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Who shows them the way?",
            "options": [
              "A teacher",
              "A camper",
              "A lion",
              "A helper"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"...they meet a camper who shows them the way.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is the weather like?",
            "options": [
              "Cold and rainy",
              "Warm and sunny",
              "Hot afternoon",
              "Snowing"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The weather is warm and sunny.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they find in the beautiful chest?",
            "options": [
              "A red apple",
              "A relax",
              "A pencil case",
              "A school bag"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"They find a beautiful chest with a relax inside.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Emily shout at the end?",
            "options": [
              "Help!",
              "Look at the lion!",
              "This is the best day ever!",
              "Where is my pencil?"
            ],
            "correctIndex": 2,
            "explanation": "Emily shouts: \"This is the best day ever!\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      },
      {
        "id": "read-1-unit15-story3",
        "unit": 15,
        "tier": "Challenge",
        "title": "The Great What are you Going to Do? Challenge",
        "text": "Today is the day of the Great What are you Going to Do? Challenge. Sophie and Ben are excited. They have to find three hidden clues in the area. The first clue is near the beach. Ben says: \"Look! There is a yellow note under the desk.\" The note says: \"Go to the camping and listen carefully.\" They walk to the place. There, they hear a strange sound. It is a secret code! Sophie writes the code in her green notebook. The last clue is hidden behind a brown cupboard. They solve the mystery and win a golden trophy.",
        "vocabWords": [
          {
            "en": "hidden",
            "de": "versteckt"
          },
          {
            "en": "clues",
            "de": "Hinweise"
          },
          {
            "en": "strange sound",
            "de": "seltsames Geräusch"
          },
          {
            "en": "trophy",
            "de": "Pokal"
          }
        ],
        "imagePath": "/assets/reading/more1/U15_TXT3.png",
        "questions": [
          {
            "question": "What event is happening today?",
            "options": [
              "A birthday party",
              "The Great What are you Going to Do? Challenge",
              "A school trip",
              "An art class"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"Today is the day of the Great What are you Going to Do? Challenge.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "How do Sophie and Ben feel?",
            "options": [
              "Tired",
              "Excited",
              "Bored",
              "Scared"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"Sophie and Ben are excited.\"",
            "kompetenzbereich": "global_understanding"
          },
          {
            "question": "Where is the first clue located?",
            "options": [
              "In the cupboard",
              "Near the beach",
              "Behind the shelf",
              "Under the desk"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The first clue is near the beach.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What color is the note Ben finds?",
            "options": [
              "Red",
              "Blue",
              "Yellow",
              "Green"
            ],
            "correctIndex": 2,
            "explanation": "Ben says: \"Look! There is a yellow note...\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "Where does Sophie write the secret code?",
            "options": [
              "On the whiteboard",
              "In her green notebook",
              "On the floor",
              "On a map"
            ],
            "correctIndex": 1,
            "explanation": "Sophie writes the code \"in her green notebook\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What do they win at the end?",
            "options": [
              "A banana",
              "A golden trophy",
              "A new camera",
              "A schoolbag"
            ],
            "correctIndex": 1,
            "explanation": "They solve the mystery and \"win a golden trophy\".",
            "kompetenzbereich": "specific_information"
          }
        ]
      },
      {
        "id": "read-1-unit15-story4",
        "unit": 15,
        "tier": "Master",
        "title": "The Mystery of the What are you Going to Do? Master",
        "text": "No one knows the identity of the What are you Going to Do? Master. He lives in a house at the edge of the forest. The house has got a big garden and a red door. One afternoon, Leo goes to the forest to find the Master. He wears his warm coat and boots. Suddenly, he hears footsteps. It is a very tall man. The man has got a long beard and a friendly face. He is wearing a blue hat and has got a big wooden stick. \"Who are you?\" Leo asks. The man laughs: \"I am the Master you are looking for. Here is a secret book of What are you Going to Do?.\" Inside the book, there are magical stories and puzzles. Leo takes the book home and shares it with his friends. They learn many new words and play fun games.",
        "vocabWords": [
          {
            "en": "identity",
            "de": "Identität"
          },
          {
            "en": "forest",
            "de": "Wald"
          },
          {
            "en": "footsteps",
            "de": "Schritte"
          },
          {
            "en": "puzzles",
            "de": "Rätsel"
          }
        ],
        "imagePath": "/assets/reading/more1/U15_TXT4.png",
        "questions": [
          {
            "question": "Where does the Master live?",
            "options": [
              "In a classroom",
              "At the zoo",
              "In a house at the edge of the forest",
              "On a pirate ship"
            ],
            "correctIndex": 2,
            "explanation": "The text says: \"He lives in a house at the edge of the forest.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is Leo wearing when he goes to the forest?",
            "options": [
              "A red dress and white socks",
              "A warm coat and boots",
              "A blue T-shirt and shorts",
              "Jeans and a cap"
            ],
            "correctIndex": 1,
            "explanation": "The text states: \"He wears his warm coat and boots.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What features does the Master have?",
            "options": [
              "A short tail and big ears",
              "A long beard and a friendly face",
              "A wooden leg and one eye",
              "Green skin and sharp teeth"
            ],
            "correctIndex": 1,
            "explanation": "The text says: \"The man has got a long beard and a friendly face.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does the Master give to Leo?",
            "options": [
              "A golden trophy",
              "A yellow banana",
              "A secret book of What are you Going to Do?",
              "A blue pen"
            ],
            "correctIndex": 2,
            "explanation": "The Master says: \"Here is a secret book of What are you Going to Do?.\"",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What is inside the secret book?",
            "options": [
              "Colourful paints",
              "Magical stories and puzzles",
              "School rules",
              "A map of the zoo"
            ],
            "correctIndex": 1,
            "explanation": "Inside the book, \"there are magical stories and puzzles\".",
            "kompetenzbereich": "specific_information"
          },
          {
            "question": "What does Leo do with the book?",
            "options": [
              "He drops it in a pool",
              "He hides it under his desk",
              "He takes it home and shares it with his friends",
              "He gives it to the teacher"
            ],
            "correctIndex": 2,
            "explanation": "The text states: \"Leo takes the book home and shares it with his friends.\"",
            "kompetenzbereich": "global_understanding"
          }
        ]
      }
    ]
  }
];

const TIER_NUM: Record<string, number> = { Starter: 1, Practice: 2, Challenge: 3, Master: 4 }

/** Generate a stable ID for legacy stories that lack one */
function genStoryId(unit: number, tier: string, idx: number): string {
  return `read-${unit}-${tier.toLowerCase()}${String.fromCharCode(97 + idx)}`
}

/** Fill in missing optional fields for a legacy story */
export function normalizeStory(story: ReadingStory, unit: number, idx: number): ReadingStory {
  const tierNum = TIER_NUM[story.tier] || 1
  return {
    ...story,
    id: story.id || genStoryId(unit, story.tier, idx),
    unit: story.unit ?? unit,
    imagePath: story.imagePath || `/assets/reading/more1/U${unit}_TXT${tierNum}${String.fromCharCode(97 + idx)}.png`,
  }
}

export function getReadingUnit(unit: number): ReadingUnit | undefined {
  return MORE1_READING_DATA.find((u) => u.unit === unit);
}

export function getReadingStory(unit: number, storyId: string): ReadingStory | undefined {
  const u = getReadingUnit(unit);
  if (!u) return undefined;
  const idx = u.stories.findIndex((s, i) => s.id === storyId || genStoryId(unit, s.tier, i) === storyId);
  if (idx === -1) return undefined;
  return normalizeStory(u.stories[idx], unit, idx);
}
