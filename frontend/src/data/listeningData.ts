// MORE! 1 — High-Quality Listening Section Data
// Each task includes a full transcript script and 10–14 contextual questions

export interface ListeningQuestion {
  question: string; options: string[]; correctIndex: number
  explanation: string
  kompetenzbereich: 'global_understanding' | 'specific_information' | 'digital_reading' | 'vocabulary_context'
}
export interface ListeningTask {
  id: string; unit: number; tier: 'Starter' | 'Practice' | 'Challenge' | 'Master'
  title: string; scene: string; type: 'monologue' | 'dialogue'
  audioPath: string; transcriptPath: string; imagePath: string
  transcriptText: string; questions: ListeningQuestion[]
}
export interface ListeningUnit { unit: number; title: string; theme: string; tasks: ListeningTask[] }

export const MORE1_LISTENING_DATA: ListeningUnit[] = [
  // ════════════════════════════════════════════════════ UNIT 1: Time for School
  {
    unit: 1, title: 'Time for School', theme: 'colours, school things, classroom',
    tasks: [
      {
        id: 'listen-1-unit1-task1', unit: 1, tier: 'Starter',
        title: 'First Day at School',
        scene: 'A classroom on the first day of school',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U1_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U1_TXT1.txt',
        imagePath: '/assets/listening/more1/U1_TXT1.png',
        transcriptText: `Speaker 1: Good morning! I am your new teacher, Mrs Miller. What is your name?\n\nSpeaker 2: Hello! My name is Tim. I am ten years old.\n\nSpeaker 1: Nice to meet you, Tim! Do you have a pencil?\n\nSpeaker 2: Yes, I have a blue pencil and a red book.\n\nSpeaker 1: Wonderful! Please sit at the desk near the window.\n\nSpeaker 2: Thank you, Mrs Miller! I like this classroom. It is very colourful.`,
        questions: [
          { question: 'Who is Mrs Miller?', options: ['A student', 'The new teacher', "Tim's mother", 'A visitor'], correctIndex: 1, explanation: 'Speaker 1 says: "I am your new teacher, Mrs Miller."', kompetenzbereich: 'specific_information' },
          { question: 'How old is Tim?', options: ['Eight', 'Nine', 'Ten', 'Eleven'], correctIndex: 2, explanation: 'Tim says: "I am ten years old."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is Tim\'s pencil?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctIndex: 1, explanation: 'Tim says: "I have a blue pencil."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim have besides a pencil?', options: ['A ruler', 'A red book', 'A red pencil', 'A bag'], correctIndex: 1, explanation: 'He says: "a blue pencil and a red book."', kompetenzbereich: 'specific_information' },
          { question: 'Where does the teacher ask Tim to sit?', options: ['At the back', 'Near the door', 'At the desk near the window', 'Next to the board'], correctIndex: 2, explanation: 'She says: "Sit at the desk near the window."', kompetenzbereich: 'specific_information' },
          { question: 'How does Tim feel about the classroom?', options: ['He is scared', 'He thinks it is colourful', 'He wants to go home', 'He is bored'], correctIndex: 1, explanation: 'Tim says: "I like this classroom. It is very colourful."', kompetenzbereich: 'global_understanding' },
          { question: 'What time of day is it?', options: ['Afternoon', 'Evening', 'Morning', 'Night'], correctIndex: 2, explanation: 'The teacher says "Good morning!"', kompetenzbereich: 'digital_reading' },
          { question: 'What does "colourful" mean in German?', options: ['langweilig', 'farbenfroh', 'dunkel', 'leise'], correctIndex: 1, explanation: '"Colourful" means having many colours — "farbenfroh".', kompetenzbereich: 'vocabulary_context' },
          { question: 'True or False: Tim does not have a book.', options: ['True', 'False'], correctIndex: 1, explanation: 'Tim says he has a red book.', kompetenzbereich: 'specific_information' },
          { question: 'Who speaks first in the conversation?', options: ['Tim', 'Mrs Miller', "Tim's friend", 'The headmaster'], correctIndex: 1, explanation: 'Mrs Miller says "Good morning!" first.', kompetenzbereich: 'digital_reading' },
        ]
      },
      {
        id: 'listen-1-unit1-task2', unit: 1, tier: 'Practice',
        title: 'Packing My School Bag',
        scene: 'A student talking about their school bag at home',
        type: 'monologue',
        audioPath: '/assets/listening/more1/U1_TXT2.wav',
        transcriptPath: '/assets/listening/more1/U1_TXT2.txt',
        imagePath: '/assets/listening/more1/U1_TXT2.png',
        transcriptText: `Speaker 1: Hello, my name is Sarah. I am going to school now. Let me show you my school bag. My school bag is purple and pink. I have got a green pencil case. Inside the pencil case, I have a yellow pencil, a red ruler, and a blue pen. I also have a white eraser. My notebook is orange, and my book is brown. I am ready for school! I love my school things.`,
        questions: [
          { question: 'What is the speaker\'s name?', options: ['Sarah', 'Emma', 'Anna', 'Lisa'], correctIndex: 0, explanation: 'She says: "Hello, my name is Sarah."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the school bag?', options: ['Red and blue', 'Purple and pink', 'Green and yellow', 'Black and white'], correctIndex: 1, explanation: 'Sarah says: "My school bag is purple and pink."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the pencil case?', options: ['Red', 'Blue', 'Green', 'Orange'], correctIndex: 2, explanation: 'She says: "I have got a green pencil case."', kompetenzbereich: 'specific_information' },
          { question: 'What items are inside the pencil case?', options: ['A yellow pencil, a red ruler, and a blue pen', 'A book and a notebook', 'A yellow pen, a red pencil, and a blue ruler', 'Only a pencil'], correctIndex: 0, explanation: 'She lists: "a yellow pencil, a red ruler, and a blue pen."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the eraser?', options: ['Pink', 'White', 'Yellow', 'Black'], correctIndex: 1, explanation: 'She says: "I also have a white eraser."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the notebook?', options: ['Green', 'Brown', 'Orange', 'Blue'], correctIndex: 2, explanation: 'She says: "My notebook is orange."', kompetenzbereich: 'specific_information' },
          { question: 'How does Sarah feel about going to school?', options: ['She is scared', 'She is ready and loves her things', 'She is angry', 'She is tired'], correctIndex: 1, explanation: 'She says: "I am ready for school! I love my school things."', kompetenzbereich: 'global_understanding' },
          { question: 'What colour is the book?', options: ['Red', 'Brown', 'Green', 'Blue'], correctIndex: 1, explanation: 'She says: "My book is brown."', kompetenzbereich: 'specific_information' },
          { question: 'What does "ruler" mean in German?', options: ['Bleistift', 'Lineal', 'Buch', 'Heft'], correctIndex: 1, explanation: '"Ruler" = "Lineal" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many items does Sarah list in total?', options: ['5', '4', '7', '8'], correctIndex: 0, explanation: 'School bag, pencil case, pencil, ruler, pen, eraser, notebook, book = 8 items described.', kompetenzbereich: 'digital_reading' },
        ]
      },
      {
        id: 'listen-1-unit1-task3', unit: 1, tier: 'Challenge',
        title: 'The Lost Pencil Mystery',
        scene: 'In the classroom during break time',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U1_TXT3.wav',
        transcriptPath: '/assets/listening/more1/U1_TXT3.txt',
        imagePath: '/assets/listening/more1/U1_TXT3.png',
        transcriptText: `Speaker 1 (Tim): Oh no! Where is my green pencil? I cannot find it!\n\nSpeaker 2 (Sarah): Calm down, Tim. Did you look in your pencil case?\n\nSpeaker 1: Yes, I did. It is not there. I looked under my chair and on the floor.\n\nSpeaker 2: Is it on your desk? Maybe it is next to your book.\n\nSpeaker 1: No, it is not there either. Wait — Bello the dog is in the corner. Is that my pencil in his mouth?\n\nSpeaker 2: Yes! Bello has got your green pencil! He is chewing it!\n\nSpeaker 1: Bello! Give me back my pencil, please!\n\nSpeaker 2: Ha ha! Bello thinks your pencil is a toy. Look, he is giving it to you now.`,
        questions: [
          { question: 'What is Tim looking for?', options: ['His book', 'His green pencil', 'His school bag', 'His ruler'], correctIndex: 1, explanation: 'Tim says: "Where is my green pencil?"', kompetenzbereich: 'specific_information' },
          { question: 'Where has Tim already looked?', options: ['In his bag and on the shelf', 'In his pencil case, under his chair, and on the floor', 'Outside the classroom', 'In the library'], correctIndex: 1, explanation: 'Tim says he looked in his pencil case, under the chair, and on the floor.', kompetenzbereich: 'specific_information' },
          { question: 'Who has the pencil?', options: ['Sarah', 'The teacher', 'Bello the dog', 'Another student'], correctIndex: 2, explanation: 'Sarah says: "Bello has got your green pencil!"', kompetenzbereich: 'specific_information' },
          { question: 'What is Bello doing with the pencil?', options: ['Drawing with it', 'Chewing it', 'Hiding it', 'Throwing it'], correctIndex: 1, explanation: 'Sarah says: "He is chewing it!"', kompetenzbereich: 'specific_information' },
          { question: 'How does Tim ask for his pencil back?', options: ['He shouts at Bello', 'He says "Bello! Give me back my pencil, please!"', 'He takes it from Bello', 'He tells the teacher'], correctIndex: 1, explanation: 'Tim says: "Bello! Give me back my pencil, please!"', kompetenzbereich: 'specific_information' },
          { question: 'What does Sarah say Bello thinks the pencil is?', options: ['Food', 'A toy', 'A bone', 'A stick'], correctIndex: 1, explanation: 'Sarah says: "Bello thinks your pencil is a toy."', kompetenzbereich: 'specific_information' },
          { question: 'What does Bello do at the end of the conversation?', options: ['Runs away', 'Hides the pencil', 'Gives the pencil back to Tim', 'Falls asleep'], correctIndex: 2, explanation: 'Sarah says: "Look, he is giving it to you now."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "chewing" mean?', options: ['kauen', 'rennen', 'schlafen', 'springen'], correctIndex: 0, explanation: '"Chewing" means to bite and grind with teeth — "kauen".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How does Sarah react to the situation?', options: ['She is angry', 'She laughs', 'She cries', 'She leaves'], correctIndex: 1, explanation: 'Sarah says "Ha ha!" and thinks it is funny.', kompetenzbereich: 'global_understanding' },
          { question: 'Where is Bello when they find him?', options: ['Under the desk', 'In the corner', 'Outside', 'On the chair'], correctIndex: 1, explanation: 'Tim says: "Bello the dog is in the corner."', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit1-task4', unit: 1, tier: 'Master',
        title: 'The Classroom Helper Plan',
        scene: 'A classroom meeting with the teacher',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U1_TXT4.wav',
        transcriptPath: '/assets/listening/more1/U1_TXT4.txt',
        imagePath: '/assets/listening/more1/U1_TXT4.png',
        transcriptText: `Speaker 1 (Teacher): Good morning, class! Today we need a classroom helper. Who would like to help?\n\nSpeaker 2 (Tim): I want to help! I can clean the whiteboard.\n\nSpeaker 3 (Sarah): I can organise the books on the shelf. The red books go on the top shelf, and the blue books go on the bottom shelf.\n\nSpeaker 4 (Emma): I can give out the pencils. I have got twenty pencils in this box — ten yellow, five green, and five blue.\n\nSpeaker 1: Wonderful! Tim, you clean the whiteboard. Sarah, you organise the books. Emma, you give out the pencils. And Bello, can you help too?\n\nSpeaker 2: Woof! Bello can be our class mascot!\n\nSpeaker 1: Yes, Bello can sit quietly and watch us work. Teamwork makes everything better!\n\nSpeaker 3: I love being a classroom helper. The classroom looks great now!`,
        questions: [
          { question: 'What is the teacher looking for?', options: ['A new student', 'A classroom helper', 'A lost book', 'A pencil'], correctIndex: 1, explanation: 'The teacher says: "Today we need a classroom helper."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim offer to do?', options: ['Give out pencils', 'Clean the whiteboard', 'Organise books', 'Feed Bello'], correctIndex: 1, explanation: 'Tim says: "I can clean the whiteboard."', kompetenzbereich: 'specific_information' },
          { question: 'Where do the blue books go?', options: ['On the top shelf', 'On the bottom shelf', 'In the cupboard', 'On the desk'], correctIndex: 1, explanation: 'Sarah says: "The blue books go on the bottom shelf."', kompetenzbereich: 'specific_information' },
          { question: 'How many pencils does Emma have?', options: ['Ten', 'Twenty', 'Fifteen', 'Five'], correctIndex: 1, explanation: 'Emma says: "I have got twenty pencils."', kompetenzbereich: 'specific_information' },
          { question: 'How many green pencils are there?', options: ['Ten', 'Five', 'Twenty', 'Two'], correctIndex: 1, explanation: 'Emma says: "ten yellow, five green, and five blue."', kompetenzbereich: 'specific_information' },
          { question: 'What is Bello\'s job in the classroom?', options: ['Clean the board', 'Give out pencils', 'Be the class mascot and sit quietly', 'Organise books'], correctIndex: 2, explanation: 'The teacher says: "Bello can sit quietly and watch us work." And Tim calls Bello the class mascot.', kompetenzbereich: 'specific_information' },
          { question: 'What does the teacher say about teamwork?', options: ['It is difficult', 'It makes everything better', 'It is not important', 'It takes too long'], correctIndex: 1, explanation: 'The teacher says: "Teamwork makes everything better!"', kompetenzbereich: 'global_understanding' },
          { question: 'How does Sarah feel at the end?', options: ['Tired', 'She loves being a helper', 'Bored', 'Sad'], correctIndex: 1, explanation: 'Sarah says: "I love being a classroom helper."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "organise" mean?', options: ['organisieren / ordnen', 'werfen', 'lesen', 'malen'], correctIndex: 0, explanation: '"Organise" means to arrange things neatly — "organisieren / ordnen".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What colour books are on the top shelf?', options: ['Blue', 'Red', 'Green', 'Yellow'], correctIndex: 1, explanation: 'Sarah says: "The red books go on the top shelf."', kompetenzbereich: 'specific_information' },
          { question: 'How many students offer to help before Bello?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 2, explanation: 'Tim, Sarah, and Emma all offer to help.', kompetenzbereich: 'digital_reading' },
          { question: 'What does the teacher say Bello should do?', options: ['Run around', 'Bark loudly', 'Sit quietly and watch', 'Go outside'], correctIndex: 2, explanation: 'She says: "Bello can sit quietly and watch us work."', kompetenzbereich: 'specific_information' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 2: At the Zoo
  {
    unit: 2, title: 'At the Zoo', theme: 'animals',
    tasks: [
      {
        id: 'listen-1-unit2-task1', unit: 2, tier: 'Starter',
        title: 'Our Trip to the Zoo',
        scene: 'At the zoo entrance with a class',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U2_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U2_TXT1.txt',
        imagePath: '/assets/listening/more1/U2_TXT1.png',
        transcriptText: `Speaker 1 (Teacher): Good morning everyone! We are at the zoo today. What animals can you see?\n\nSpeaker 2 (Tim): I can see a big elephant! It is grey and very tall.\n\nSpeaker 3 (Sarah): Look! There is a zebra. It is black and white.\n\nSpeaker 4 (Emma): I can see a monkey! It is brown and it is eating a banana.\n\nSpeaker 1: Wonderful! Can you see the lion? The lion is the king of the zoo.\n\nSpeaker 2: Yes! The lion has got a big mane. It is sleeping under a tree.\n\nSpeaker 1: Let us visit the penguins next. They are my favourite animals!`,
        questions: [
          { question: 'Where is the class?', options: ['At school', 'At the zoo', 'At home', 'In a park'], correctIndex: 1, explanation: 'The teacher says: "We are at the zoo today."', kompetenzbereich: 'specific_information' },
          { question: 'What animal does Tim see first?', options: ['A zebra', 'A lion', 'A monkey', 'A big elephant'], correctIndex: 3, explanation: 'Tim says: "I can see a big elephant!"', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the zebra?', options: ['Brown and white', 'Black and white', 'Grey and white', 'Black and grey'], correctIndex: 1, explanation: 'Sarah says: "It is black and white."', kompetenzbereich: 'specific_information' },
          { question: 'What is the monkey doing?', options: ['Sleeping', 'Running', 'Eating a banana', 'Climbing'], correctIndex: 2, explanation: 'Emma says: "It is eating a banana."', kompetenzbereich: 'specific_information' },
          { question: 'What is the lion doing?', options: ['Roaring', 'Eating', 'Sleeping under a tree', 'Walking'], correctIndex: 2, explanation: 'Tim says: "It is sleeping under a tree."', kompetenzbereich: 'specific_information' },
          { question: 'What is the teacher\'s favourite animal?', options: ['Lions', 'Elephants', 'Penguins', 'Zebras'], correctIndex: 2, explanation: 'The teacher says: "They are my favourite animals!" referring to penguins.', kompetenzbereich: 'specific_information' },
          { question: 'What is the German word for "monkey"?', options: ['Löwe', 'Affe', 'Elefant', 'Zebra'], correctIndex: 1, explanation: '"Monkey" = "Affe" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'Which animal does the teacher call "king of the zoo"?', options: ['The elephant', 'The tiger', 'The lion', 'The gorilla'], correctIndex: 2, explanation: 'The teacher says: "The lion is the king of the zoo."', kompetenzbereich: 'specific_information' },
          { question: 'What does the lion have on its head?', options: ['A hat', 'A big mane', 'Big ears', 'A crown'], correctIndex: 1, explanation: 'Tim says: "The lion has got a big mane."', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit2-task2', unit: 2, tier: 'Practice',
        title: 'Feeding Time at the Zoo',
        scene: 'At the zoo animal feeding area',
        type: 'monologue',
        audioPath: '/assets/listening/more1/U2_TXT2.wav',
        transcriptPath: '/assets/listening/more1/U2_TXT2.txt',
        imagePath: '/assets/listening/more1/U2_TXT2.png',
        transcriptText: `Speaker 1: Hello, I am the zookeeper. Welcome to feeding time! The penguins eat fish — they eat twelve fish every day. The monkeys like bananas and apples. Look at the elephant! It eats grass, leaves, and lots of fruit. An elephant can eat one hundred kilograms of food per day! The lions eat meat. They are not vegetarians! All the animals are hungry now. It is time to feed them.`,
        questions: [
          { question: 'Who is speaking?', options: ['A teacher', 'The zookeeper', 'A visitor', 'A student'], correctIndex: 1, explanation: 'The speaker says: "Hello, I am the zookeeper."', kompetenzbereich: 'specific_information' },
          { question: 'How many fish do the penguins eat per day?', options: ['Five', 'Ten', 'Twelve', 'Twenty'], correctIndex: 2, explanation: 'The zookeeper says: "They eat twelve fish every day."', kompetenzbereich: 'specific_information' },
          { question: 'What do monkeys like to eat?', options: ['Fish and meat', 'Bananas and apples', 'Leaves and grass', 'Only bananas'], correctIndex: 1, explanation: 'He says: "The monkeys like bananas and apples."', kompetenzbereich: 'specific_information' },
          { question: 'How much food can an elephant eat per day?', options: ['50 kilograms', '75 kilograms', '100 kilograms', '200 kilograms'], correctIndex: 2, explanation: 'He says: "One hundred kilograms of food per day."', kompetenzbereich: 'specific_information' },
          { question: 'Are lions vegetarians?', options: ['Yes', 'No, they eat meat', 'Sometimes', 'Only on Mondays'], correctIndex: 1, explanation: 'He says: "They are not vegetarians!"', kompetenzbereich: 'specific_information' },
          { question: 'What does "vegetarian" mean?', options: ['Someone who eats only meat', 'Someone who does not eat meat', 'Someone who eats only fish', 'Someone who eats everything'], correctIndex: 1, explanation: 'A vegetarian is a person who does not eat meat.', kompetenzbereich: 'vocabulary_context' },
          { question: 'What time is it described as?', options: ['Morning', 'Closing time', 'Feeding time', 'Nap time'], correctIndex: 2, explanation: 'He says: "Welcome to feeding time!"', kompetenzbereich: 'specific_information' },
          { question: 'What does the elephant eat besides grass?', options: ['Meat and fish', 'Leaves and fruit', 'Bread and milk', 'Chocolate and cake'], correctIndex: 1, explanation: 'He says: "It eats grass, leaves, and lots of fruit."', kompetenzbereich: 'specific_information' },
          { question: 'How many different animals are mentioned?', options: ['Three', 'Four', 'Five', 'Six'], correctIndex: 1, explanation: 'Penguins, monkeys, elephant, lions = 4 animals.', kompetenzbereich: 'digital_reading' },
        ]
      },
      {
        id: 'listen-1-unit2-task3', unit: 2, tier: 'Challenge',
        title: 'The Missing Baby Penguin',
        scene: 'At the penguin enclosure, a worried zookeeper talks to visitors',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U2_TXT3.wav',
        transcriptPath: '/assets/listening/more1/U2_TXT3.txt',
        imagePath: '/assets/listening/more1/U2_TXT3.png',
        transcriptText: `Speaker 1 (Zookeeper): Oh dear! Has anyone seen a small baby penguin? It is only two weeks old.\n\nSpeaker 2 (Tim): What does it look like?\n\nSpeaker 1: It is very small, grey and fluffy. It has got big black eyes and a tiny beak. Its name is Pip.\n\nSpeaker 3 (Sarah): I think I saw something near the café! A little grey bird was next to the ice cream stand.\n\nSpeaker 1: That could be Pip! Let us go and look.\n\nSpeaker 2: Look, over there! Behind the bench. Is that Pip?\n\nSpeaker 1: Yes! That is him! He must have followed the smell of fish from the café. Thank you so much, children!\n\nSpeaker 3: You are welcome! Baby penguins are so curious.`,
        questions: [
          { question: 'What is the zookeeper looking for?', options: ['A lost key', 'A baby penguin', 'A bucket of fish', 'A visitor'], correctIndex: 1, explanation: 'The zookeeper asks about a small baby penguin.', kompetenzbereich: 'specific_information' },
          { question: 'How old is the baby penguin?', options: ['Two days', 'Two weeks', 'Two months', 'Two years'], correctIndex: 1, explanation: 'The zookeeper says: "It is only two weeks old."', kompetenzbereich: 'specific_information' },
          { question: 'What is the baby penguin\'s name?', options: ['Pip', 'Pop', 'Pipkin', 'Peng'], correctIndex: 0, explanation: 'The zookeeper says: "Its name is Pip."', kompetenzbereich: 'specific_information' },
          { question: 'Where did Sarah think she saw the penguin?', options: ['Near the entrance', 'Near the café', 'In the water', 'Under a tree'], correctIndex: 1, explanation: 'Sarah says: "A little grey bird was next to the ice cream stand" — near the café.', kompetenzbereich: 'specific_information' },
          { question: 'Where do they actually find Pip?', options: ['In the water', 'Behind the bench', 'Under a table', 'At the ice cream stand'], correctIndex: 1, explanation: 'Tim says: "Behind the bench. Is that Pip?"', kompetenzbereich: 'specific_information' },
          { question: 'Why does the zookeeper think Pip left his enclosure?', options: ['He was scared', 'He followed the smell of fish', 'He wanted ice cream', 'A visitor took him'], correctIndex: 1, explanation: 'The zookeeper says: "He must have followed the smell of fish from the café."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "fluffy" mean?', options: ['flauschig', 'nass', 'hart', 'kalt'], correctIndex: 0, explanation: '"Fluffy" describes soft, light texture — "flauschig".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does Sarah say about baby penguins at the end?', options: ['They are smelly', 'They are curious', 'They are scary', 'They are boring'], correctIndex: 1, explanation: 'Sarah says: "Baby penguins are so curious."', kompetenzbereich: 'global_understanding' },
          { question: 'How many people are in the conversation?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1, explanation: 'Zookeeper, Tim, Sarah = 3 speakers.', kompetenzbereich: 'digital_reading' },
          { question: 'What colour are the baby penguin\'s eyes?', options: ['Blue', 'Brown', 'Green', 'Black'], correctIndex: 3, explanation: 'The zookeeper says: "It has got big black eyes."', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit2-task4', unit: 2, tier: 'Master',
        title: 'Zookeeper Interview',
        scene: 'A school reporter interviews the head zookeeper',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U2_TXT4.wav',
        transcriptPath: '/assets/listening/more1/U2_TXT4.txt',
        imagePath: '/assets/listening/more1/U2_TXT4.png',
        transcriptText: `Speaker 1 (Emma): Hello, I am Emma from the school newspaper. Can I ask you some questions about your job?\n\nSpeaker 2 (Zookeeper): Of course! I love talking about the animals. I have worked here for fifteen years.\n\nEmma: What time do you start work?\n\nZookeeper: I start at six o'clock in the morning. The animals are hungry early!\n\nEmma: Which animal is the most difficult to look after?\n\nZookeeper: The monkeys! They are very clever and they can open doors. Last week, a monkey opened its cage and ate all the bananas from the kitchen.\n\nEmma: That is very funny! Which animal is the friendliest?\n\nZookeeper: The giraffes are very gentle. They are tall and quiet, and they never run away.\n\nEmma: What is your favourite part of your job?\n\nZookeeper: When baby animals are born. Three weeks ago, we had a baby elephant! It was the happiest day of my career.`,
        questions: [
          { question: 'Who is Emma?', options: ['A student', 'A reporter from the school newspaper', 'A zookeeper', 'A teacher'], correctIndex: 1, explanation: 'Emma says: "I am Emma from the school newspaper."', kompetenzbereich: 'specific_information' },
          { question: 'How long has the zookeeper worked at the zoo?', options: ['Five years', 'Ten years', 'Fifteen years', 'Twenty years'], correctIndex: 2, explanation: 'He says: "I have worked here for fifteen years."', kompetenzbereich: 'specific_information' },
          { question: 'What time does the zookeeper start work?', options: ['Five o\'clock', 'Six o\'clock', 'Seven o\'clock', 'Eight o\'clock'], correctIndex: 1, explanation: 'He says: "I start at six o\'clock in the morning."', kompetenzbereich: 'specific_information' },
          { question: 'Why does he say monkeys are difficult?', options: ['They bite', 'They can open doors and steal food', 'They are very noisy', 'They sleep too much'], correctIndex: 1, explanation: 'He says: "They can open doors" and mentions the monkey ate all the bananas.', kompetenzbereich: 'specific_information' },
          { question: 'What did the monkey do last week?', options: ['Escaped to the city', 'Opened its cage and ate bananas from the kitchen', 'Had a baby', 'Fell asleep in a tree'], correctIndex: 1, explanation: 'The zookeeper says: "A monkey opened its cage and ate all the bananas."', kompetenzbereich: 'specific_information' },
          { question: 'Which animal does the zookeeper say is the friendliest?', options: ['The monkeys', 'The lions', 'The giraffes', 'The elephants'], correctIndex: 2, explanation: 'He says: "The giraffes are very gentle."', kompetenzbereich: 'specific_information' },
          { question: 'What is the zookeeper\'s favourite part of the job?', options: ['Feeding time', 'Cleaning cages', 'When baby animals are born', 'Talking to visitors'], correctIndex: 2, explanation: 'He says: "When baby animals are born."', kompetenzbereich: 'specific_information' },
          { question: 'What baby animal was born three weeks ago?', options: ['A baby giraffe', 'A baby elephant', 'A baby monkey', 'A baby lion'], correctIndex: 1, explanation: 'He says: "Three weeks ago, we had a baby elephant!"', kompetenzbereich: 'specific_information' },
          { question: 'What does "gentle" mean?', options: ['sanft / freundlich', 'wild', 'laut', 'gefährlich'], correctIndex: 0, explanation: '"Gentle" means kind and careful — "sanft / freundlich".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How does the zookeeper feel about the baby elephant?', options: ['It was the happiest day of his career', 'He was worried', 'He did not care', 'He was annoyed'], correctIndex: 0, explanation: 'He says: "It was the happiest day of my career."', kompetenzbereich: 'global_understanding' },
          { question: 'Why does the zookeeper start work so early?', options: ['He likes mornings', 'The animals are hungry early', 'The zoo opens early', 'It is the rule'], correctIndex: 1, explanation: 'He says: "The animals are hungry early!"', kompetenzbereich: 'global_understanding' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 3: Pirates (body parts)
  {
    unit: 3, title: 'Pirates', theme: 'body parts',
    tasks: [
      {
        id: 'listen-1-unit3-task1', unit: 3, tier: 'Starter',
        title: 'The Pirate Has Got a Hook',
        scene: 'A pirate ship deck',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U3_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U3_TXT1.txt',
        imagePath: '/assets/listening/more1/U3_TXT1.png',
        transcriptText: `Speaker 1: Look! A pirate! He has got a hat on his head.\n\nSpeaker 2: Yes! And he has got a hook for a hand. Look at his arm.\n\nSpeaker 1: He has got one leg. The other leg is a wooden leg.\n\nSpeaker 2: He has got a parrot on his shoulder!\n\nSpeaker 1: The parrot is green and yellow. It has got two wings.\n\nSpeaker 2: The pirate has got a treasure map. It is in his hand.\n\nSpeaker 1: Where is the treasure? Is it on the island?\n\nSpeaker 2: I think so! Let us follow the pirate!`,
        questions: [
          { question: 'What does the pirate have on his head?', options: ['A crown', 'A hat', 'A helmet', 'A bandana'], correctIndex: 1, explanation: 'Speaker 1 says: "He has got a hat on his head."', kompetenzbereich: 'specific_information' },
          { question: 'What does the pirate have instead of a hand?', options: ['A sword', 'A glove', 'A hook', 'A ring'], correctIndex: 2, explanation: 'Speaker 2 says: "He has got a hook for a hand."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is the parrot?', options: ['Red and blue', 'Green and yellow', 'Blue and yellow', 'Green and red'], correctIndex: 1, explanation: 'Speaker 1 says: "The parrot is green and yellow."', kompetenzbereich: 'specific_information' },
          { question: 'What does the parrot have?', options: ['Two legs', 'Two wings', 'A hat', 'A tail'], correctIndex: 1, explanation: 'Speaker 1 says: "It has got two wings."', kompetenzbereich: 'specific_information' },
          { question: 'Where is the parrot sitting?', options: ["On the pirate's head", "On the pirate's shoulder", "On the pirate's hand", 'On the treasure map'], correctIndex: 1, explanation: 'Speaker 2 says: "He has got a parrot on his shoulder!"', kompetenzbereich: 'specific_information' },
          { question: 'What does the pirate have in his hand?', options: ['A sword', 'A treasure map', 'A telescope', 'A parrot'], correctIndex: 1, explanation: 'Speaker 2 says: "The pirate has got a treasure map."', kompetenzbereich: 'specific_information' },
          { question: 'What is the German word for "shoulder"?', options: ['Hand', 'Schulter', 'Fuß', 'Kopf'], correctIndex: 1, explanation: '"Shoulder" = "Schulter" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'What do the speakers want to do?', options: ['Run away', 'Follow the pirate', 'Go home', 'Hide'], correctIndex: 1, explanation: 'Speaker 2 says: "Let us follow the pirate!"', kompetenzbereich: 'global_understanding' },
          { question: 'How many legs does the pirate have?', options: ['Two real legs', 'One real leg and one wooden leg', 'No legs', 'Three legs'], correctIndex: 1, explanation: 'He has one leg and the other is wooden.', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit3-task2', unit: 3, tier: 'Practice',
        title: 'Pirate Training',
        scene: 'On a pirate ship, the captain trains new pirates',
        type: 'monologue',
        audioPath: '/assets/listening/more1/U3_TXT2.wav',
        transcriptPath: '/assets/listening/more1/U3_TXT2.txt',
        imagePath: '/assets/listening/more1/U3_TXT2.png',
        transcriptText: `Speaker 1: Ahoy, new pirates! Welcome to my ship. To be a pirate, you need strong arms and strong legs. You must climb the ropes with your hands. You must stand on one foot to balance. Touch your toes with your fingers — can you do it? Good! Now, put your hands on your knees. Bend your elbows. Stretch your neck. Pirates need healthy bodies to find treasure. Remember: a pirate without strong muscles is like a ship without a sail. Now, let us practise every morning!`,
        questions: [
          { question: 'What is the speaker training?', options: ['New sailors', 'New pirates', 'New students', 'New animals'], correctIndex: 1, explanation: 'He says: "Welcome to my ship. To be a pirate..."', kompetenzbereich: 'global_understanding' },
          { question: 'What does the captain say pirates need?', options: ['Strong arms and strong legs', 'Big ears', 'Long hair', 'Sharp teeth'], correctIndex: 0, explanation: 'He says: "You need strong arms and strong legs."', kompetenzbereich: 'specific_information' },
          { question: 'What must the pirates do with their hands?', options: ['Clap', 'Write', 'Climb the ropes', 'Wash dishes'], correctIndex: 2, explanation: 'He says: "You must climb the ropes with your hands."', kompetenzbereich: 'specific_information' },
          { question: 'What body part do they stand on to balance?', options: ['Two feet', 'One foot', 'Their hands', 'Their head'], correctIndex: 1, explanation: 'He says: "You must stand on one foot to balance."', kompetenzbereich: 'specific_information' },
          { question: 'What should they touch with their fingers?', options: ['Their ears', 'Their nose', 'Their toes', 'The floor'], correctIndex: 2, explanation: 'He says: "Touch your toes with your fingers."', kompetenzbereich: 'specific_information' },
          { question: 'What body part does the captain mention near the end?', options: ['Shoulders', 'Knees', 'Elbows', 'All of these'], correctIndex: 3, explanation: 'He mentions hands, knees, elbows, and neck.', kompetenzbereich: 'digital_reading' },
          { question: 'What comparison does the captain make?', options: ['A pirate without muscles is like a ship without a sail', 'A pirate without a hat is like a bird without wings', 'A pirate without treasure is like a teacher without a book', 'A pirate without a map is like a fish without water'], correctIndex: 0, explanation: 'He says: "A pirate without strong muscles is like a ship without a sail."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "muscles" mean?', options: ['Muskeln', 'Knochen', 'Haare', 'Zähne'], correctIndex: 0, explanation: '"Muscles" = "Muskeln" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'When does the captain want them to practice?', options: ['Every evening', 'Every morning', 'Every weekend', 'Once a year'], correctIndex: 1, explanation: 'He says: "Let us practise every morning!"', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit3-task3', unit: 3, tier: 'Challenge',
        title: 'The Treasure Map Directions',
        scene: 'Pirates gathered around an old treasure map',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U3_TXT3.wav',
        transcriptPath: '/assets/listening/more1/U3_TXT3.txt',
        imagePath: '/assets/listening/more1/U3_TXT3.png',
        transcriptText: `Speaker 1 (Captain): Gather around, crew! I have found the treasure map. The treasure is buried under the palm tree with three coconuts.\n\nSpeaker 2 (First Mate): But Captain, how do we get there? The island is full of traps.\n\nSpeaker 1: First, we walk fifty steps north from the beach. Then we turn left at the big rock shaped like a skull.\n\nSpeaker 2: I see the rock on the map. After that?\n\nSpeaker 1: We must climb over a fallen tree. Use your strong arms and legs! Then cross the small river. The water is cold, so do not fall in!\n\nSpeaker 2: And then the palm tree?\n\nSpeaker 1: Yes! The palm tree is right there, next to the cave. Use your fingers to dig in the sand. The treasure chest is about one metre deep.\n\nSpeaker 2: Shall we bring shovels?\n\nSpeaker 1: Shovels and strong backs! A pirate\'s back must be strong to dig for gold. Let us go at sunrise!`,
        questions: [
          { question: 'Where is the treasure buried?', options: ['Under a rock', 'Under a palm tree with three coconuts', 'In a cave', 'On the beach'], correctIndex: 1, explanation: 'The captain says: "Under the palm tree with three coconuts."', kompetenzbereich: 'specific_information' },
          { question: 'How many steps north from the beach?', options: ['Twenty', 'Thirty', 'Fifty', 'One hundred'], correctIndex: 2, explanation: 'He says: "We walk fifty steps north from the beach."', kompetenzbereich: 'specific_information' },
          { question: 'What is the rock shaped like?', options: ['A heart', 'A skull', 'A star', 'An anchor'], correctIndex: 1, explanation: 'He says: "The big rock shaped like a skull."', kompetenzbereich: 'specific_information' },
          { question: 'What do they have to climb over?', options: ['A wall', 'A fence', 'A fallen tree', 'A big rock'], correctIndex: 2, explanation: 'He says: "We must climb over a fallen tree."', kompetenzbereich: 'specific_information' },
          { question: 'What body parts does the captain mention for digging?', options: ['Fingers and back', 'Hands and feet', 'Arms and legs', 'Eyes and ears'], correctIndex: 0, explanation: 'He says: "Use your fingers to dig" and "A pirate\'s back must be strong to dig."', kompetenzbereich: 'specific_information' },
          { question: 'How deep is the treasure chest buried?', options: ['Half a metre', 'One metre', 'Two metres', 'Three metres'], correctIndex: 1, explanation: 'He says: "The treasure chest is about one metre deep."', kompetenzbereich: 'specific_information' },
          { question: 'What does the captain say about the river?', options: ['It is warm', 'It is cold, so do not fall in', 'It is deep', 'It has fish'], correctIndex: 1, explanation: 'He says: "The water is cold, so do not fall in!"', kompetenzbereich: 'specific_information' },
          { question: 'What does "shovel" mean?', options: ['Schaufel', 'Eimer', 'Seil', 'Messer'], correctIndex: 0, explanation: '"Shovel" is a tool for digging — "Schaufel".', kompetenzbereich: 'vocabulary_context' },
          { question: 'When do they plan to leave?', options: ['At midnight', 'At sunrise', 'At sunset', 'At noon'], correctIndex: 1, explanation: 'The captain says: "Let us go at sunrise!"', kompetenzbereich: 'specific_information' },
          { question: 'What is the right order of obstacles?', options: ['River → rock → tree → beach', 'Beach → rock → tree → river → palm tree', 'Tree → beach → rock → river', 'Rock → tree → river → beach'], correctIndex: 1, explanation: 'North from beach → left at skull rock → climb fallen tree → cross river → palm tree.', kompetenzbereich: 'digital_reading' },
        ]
      },
      {
        id: 'listen-1-unit3-task4', unit: 3, tier: 'Master',
        title: 'The Doctor on the Pirate Ship',
        scene: 'A doctor examines injured pirates on a ship',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U3_TXT4.wav',
        transcriptPath: '/assets/listening/more1/U3_TXT4.txt',
        imagePath: '/assets/listening/more1/U3_TXT4.png',
        transcriptText: `Speaker 1 (Doctor): Next patient, please! What is the problem?\n\nSpeaker 2 (Pirate Jack): Doctor, my right shoulder hurts. I cannot lift my arm.\n\nSpeaker 1: Let me see. Yes, it is swollen. You have overworked your shoulder lifting heavy treasure chests. Rest it for three days.\n\nSpeaker 2: Thank you, Doctor.\n\nSpeaker 3 (Pirate Anne): Doctor, I have got a terrible headache. It is behind my eyes.\n\nSpeaker 1: How long have you had this pain?\n\nSpeaker 3: Since yesterday. I hit my head on the low wooden door downstairs.\n\nSpeaker 1: Ah, that explains it. Your forehead has a small bruise. Ice will help. And be more careful!\n\nSpeaker 4 (Pirate Tom): Doctor, my ankle is purple and I cannot stand on my foot.\n\nSpeaker 1: You must have twisted it during sword practice. Put your foot up and wrap it with a bandage.\n\nSpeaker 2: Doctor, you are the best! Without you, the crew would be in big trouble.\n\nSpeaker 1: A pirate doctor must know every body part. From the top of the head to the tip of the toes!`,
        questions: [
          { question: 'What is wrong with Pirate Jack?', options: ['His knee hurts', 'His right shoulder hurts', 'His back hurts', 'His wrist hurts'], correctIndex: 1, explanation: 'Jack says: "My right shoulder hurts."', kompetenzbereich: 'specific_information' },
          { question: 'Why does the doctor think Jack\'s shoulder is injured?', options: ['He fell down', 'He lifted heavy treasure chests', 'He slept badly', 'He got hit by a sword'], correctIndex: 1, explanation: 'The doctor says: "You have overworked your shoulder lifting heavy treasure chests."', kompetenzbereich: 'specific_information' },
          { question: 'How long must Jack rest his shoulder?', options: ['One day', 'Three days', 'One week', 'Two weeks'], correctIndex: 1, explanation: 'The doctor says: "Rest it for three days."', kompetenzbereich: 'specific_information' },
          { question: 'What kind of pain does Pirate Anne have?', options: ['Stomach ache', 'Back pain', 'A headache behind her eyes', 'Ear pain'], correctIndex: 2, explanation: 'Anne says: "I have got a terrible headache. It is behind my eyes."', kompetenzbereich: 'specific_information' },
          { question: 'What caused Anne\'s headache?', options: ['She read too much', 'She hit her head on a low wooden door', 'She was in the sun', 'She ate bad food'], correctIndex: 1, explanation: 'Anne says: "I hit my head on the low wooden door."', kompetenzbereich: 'specific_information' },
          { question: 'What is wrong with Pirate Tom?', options: ['His ear hurts', 'His ankle is purple and he cannot stand', 'His finger is broken', 'His back is sore'], correctIndex: 1, explanation: 'Tom says: "My ankle is purple and I cannot stand on my foot."', kompetenzbereich: 'specific_information' },
          { question: 'What does the doctor recommend for Tom\'s ankle?', options: ['Surgery', 'Put his foot up and wrap with a bandage', 'Walk more', 'Swim in the ocean'], correctIndex: 1, explanation: 'The doctor says: "Put your foot up and wrap it with a bandage."', kompetenzbereich: 'specific_information' },
          { question: 'What does "bruise" mean?', options: ['Blauer Fleck / Prellung', 'Narbe', 'Knochenbruch', 'Schnittwunde'], correctIndex: 0, explanation: '"Bruise" is a mark on skin from injury — "Blauer Fleck / Prellung".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does the doctor say a pirate doctor must know?', options: ['Every ocean', 'Every ship', 'Every body part from head to toes', 'Every treasure map'], correctIndex: 2, explanation: 'The doctor says: "From the top of the head to the tip of the toes!"', kompetenzbereich: 'specific_information' },
          { question: 'What does "swollen" mean?', options: ['geschwollen', 'gebrochen', 'verbrannt', 'verkühlt'], correctIndex: 0, explanation: '"Swollen" means enlarged — "geschwollen".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many patients does the doctor see in this scene?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 2, explanation: 'Jack, Anne, and Tom = 3 patients.', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 4: Emotions
  {
    unit: 4, title: 'Emotions', theme: 'feelings',
    tasks: [
      {
        id: 'listen-1-unit4-task1', unit: 4, tier: 'Starter',
        title: 'How Do You Feel Today?',
        scene: 'In the classroom, the teacher asks how students feel',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U4_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U4_TXT1.txt',
        imagePath: '/assets/listening/more1/U4_TXT1.png',
        transcriptText: `Speaker 1 (Teacher): Good morning, class! How are you feeling today? Tim, are you happy?\n\nSpeaker 2 (Tim): Yes, I am very happy! It is my birthday!\n\nSpeaker 1: Happy birthday, Tim! Sarah, are you sad?\n\nSpeaker 3 (Sarah): No, I am not sad. I am excited! I have got a new puppy.\n\nSpeaker 1: Wonderful! Emma, are you tired?\n\nSpeaker 4 (Emma): Yes, I am a little tired. I went to bed late last night.\n\nSpeaker 1: That is okay. And Bello, are you hungry?\n\nSpeaker 2: Woof! Bello is always hungry! He is wagging his tail.`,
        questions: [
          { question: 'Why is Tim happy?', options: ['He got a present', 'It is his birthday', 'He has a new pet', 'He got a good grade'], correctIndex: 1, explanation: 'Tim says: "It is my birthday!"', kompetenzbereich: 'specific_information' },
          { question: 'Why is Sarah excited?', options: ['She is going on holiday', 'She has got a new puppy', 'It is her birthday', 'She won a prize'], correctIndex: 1, explanation: 'Sarah says: "I have got a new puppy."', kompetenzbereich: 'specific_information' },
          { question: 'How does Emma feel?', options: ['Angry', 'A little tired', 'Very happy', 'Sad'], correctIndex: 1, explanation: 'Emma says: "Yes, I am a little tired."', kompetenzbereich: 'specific_information' },
          { question: 'Why is Emma tired?', options: ['She exercised a lot', 'She went to bed late', 'She travelled far', 'She was reading'], correctIndex: 1, explanation: 'Emma says: "I went to bed late last night."', kompetenzbereich: 'specific_information' },
          { question: 'What is Bello doing?', options: ['Sleeping', 'Wagging his tail', 'Barking loudly', 'Eating'], correctIndex: 1, explanation: 'Tim says: "Bello is always hungry! He is wagging his tail."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "excited" mean in German?', options: ['traurig', 'aufgeregt', 'müde', 'hungrig'], correctIndex: 1, explanation: '"Excited" = "aufgeregt" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'Is Sarah sad?', options: ['Yes', 'No, she is excited', 'She did not answer', 'She is angry'], correctIndex: 1, explanation: 'Sarah says: "No, I am not sad."', kompetenzbereich: 'specific_information' },
        ]
      },
      {
        id: 'listen-1-unit4-task2', unit: 4, tier: 'Practice',
        title: 'Feelings at the Playground',
        scene: 'Children at the school playground',
        type: 'monologue',
        audioPath: '/assets/listening/more1/U4_TXT2.wav',
        transcriptPath: '/assets/listening/more1/U4_TXT2.txt',
        imagePath: '/assets/listening/more1/U4_TXT2.png',
        transcriptText: `Speaker 1: Hello, I am at the playground. Let me tell you about my friends. Tim is on the swing — he is very happy. The swing goes high and he laughs. Sarah is on the bench. She looks sad because she fell and hurt her knee. Emma is on the slide. She is a bit scared because the slide is very tall. But she goes down and now she is proud! Tom is near the sandbox. He is angry because someone took his bucket. But then the teacher helps him and now he is calm. At the playground, everyone feels different things.`,
        questions: [
          { question: 'Where is Tim and how does he feel?', options: ['On the slide, scared', 'On the swing, happy', 'On the bench, sad', 'In the sandbox, angry'], correctIndex: 1, explanation: 'He says: "Tim is on the swing — he is very happy."', kompetenzbereich: 'specific_information' },
          { question: 'Why is Sarah sad?', options: ['She lost her toy', 'She fell and hurt her knee', 'She has no friends', 'It is raining'], correctIndex: 1, explanation: 'He says: "She looks sad because she fell and hurt her knee."', kompetenzbereich: 'specific_information' },
          { question: 'How does Emma feel before going down the slide?', options: ['Proud', 'Happy', 'Scared', 'Angry'], correctIndex: 2, explanation: 'He says: "She is a bit scared because the slide is very tall."', kompetenzbereich: 'specific_information' },
          { question: 'How does Emma feel after going down?', options: ['Still scared', 'Proud', 'Sad', 'Angry'], correctIndex: 1, explanation: 'He says: "She goes down and now she is proud!"', kompetenzbereich: 'specific_information' },
          { question: 'Why is Tom angry?', options: ['He fell down', 'Someone took his bucket', 'He lost his lunch', 'He was pushed'], correctIndex: 1, explanation: 'He says: "He is angry because someone took his bucket."', kompetenzbereich: 'specific_information' },
          { question: 'What happens after the teacher helps Tom?', options: ['He stays angry', 'He runs home', 'He is calm', 'He cries'], correctIndex: 2, explanation: 'He says: "The teacher helps him and now he is calm."', kompetenzbereich: 'specific_information' },
          { question: 'What does the speaker say is true about the playground?', options: ['Everyone feels the same', 'Everyone feels different things', 'Nobody plays', 'Only happy children are there'], correctIndex: 1, explanation: 'He says: "Everyone feels different things."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "proud" mean?', options: ['stolz', 'traurig', 'wütend', 'ängstlich'], correctIndex: 0, explanation: '"Proud" = feeling good about an achievement — "stolz".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does "calm" mean?', options: ['ruhig', 'laut', 'schnell', 'hungrig'], correctIndex: 0, explanation: '"Calm" = peaceful, not angry — "ruhig".', kompetenzbereich: 'vocabulary_context' },
        ]
      },
      {
        id: 'listen-1-unit4-task3', unit: 4, tier: 'Challenge',
        title: 'The Surprise Party',
        scene: 'A classroom turns into a surprise party',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U4_TXT3.wav',
        transcriptPath: '/assets/listening/more1/U4_TXT3.txt',
        imagePath: '/assets/listening/more1/U4_TXT3.png',
        transcriptText: `Speaker 1 (Tim): Everyone, be quiet! Sarah is coming! When she opens the door, we shout "Surprise!"\n\nSpeaker 2 (Emma): I am so nervous. What if she does not like the party?\n\nSpeaker 3 (Tom): She will love it! We have got balloons, a cake, and presents. I am very excited.\n\nSpeaker 1: Shh! I hear her footsteps. Ready? One... two... three... SURPRISE!\n\nSpeaker 4 (Sarah): Oh my goodness! What is this? A party for me? I am so surprised! I did not know!\n\nSpeaker 1: Happy birthday, Sarah! Are you happy?\n\nSpeaker 4: I am more than happy — I am overjoyed! You are the best friends in the world!\n\nSpeaker 2: I was nervous before, but now I am relieved. Look, Sarah is crying happy tears!\n\nSpeaker 3: Are you sad, Sarah?\n\nSpeaker 4: No, these are happy tears! Sometimes people cry when they are very, very happy.`,
        questions: [
          { question: 'What is the surprise for Sarah?', options: ['A test', 'A birthday party', 'A school trip', 'A new classroom'], correctIndex: 1, explanation: 'Tim is organizing a surprise party for Sarah.', kompetenzbereich: 'global_understanding' },
          { question: 'How does Emma feel before the surprise?', options: ['Excited', 'Nervous', 'Angry', 'Bored'], correctIndex: 1, explanation: 'Emma says: "I am so nervous."', kompetenzbereich: 'specific_information' },
          { question: 'How does Tom feel?', options: ['Nervous', 'Sad', 'Very excited', 'Scared'], correctIndex: 2, explanation: 'Tom says: "I am very excited."', kompetenzbereich: 'specific_information' },
          { question: 'What three things are at the party?', options: ['Balloons, cake, and presents', 'Books, pencils, and rulers', 'Games, music, and pizza', 'Flowers, chocolate, and cards'], correctIndex: 0, explanation: 'Tom says: "We have got balloons, a cake, and presents."', kompetenzbereich: 'specific_information' },
          { question: 'How does Sarah feel when she sees the party?', options: ['Angry', 'Surprised and overjoyed', 'Bored', 'Confused'], correctIndex: 1, explanation: 'Sarah says: "I am so surprised! I am overjoyed!"', kompetenzbereich: 'specific_information' },
          { question: 'Why does Sarah cry?', options: ['She is sad', 'She has happy tears', 'She hurt herself', 'She is embarrassed'], correctIndex: 1, explanation: 'Sarah explains: "These are happy tears! Sometimes people cry when they are very, very happy."', kompetenzbereich: 'global_understanding' },
          { question: 'How does Emma feel after the surprise works?', options: ['Still nervous', 'Relieved', 'Angry', 'Bored'], correctIndex: 1, explanation: 'Emma says: "I was nervous before, but now I am relieved."', kompetenzbereich: 'specific_information' },
          { question: 'What does "overjoyed" mean?', options: ['überglücklich', 'traurig', 'müde', 'böse'], correctIndex: 0, explanation: '"Overjoyed" means extremely happy — "überglücklich".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does "relieved" mean?', options: ['erleichtert', 'ängstlich', 'aufgeregt', 'traurig'], correctIndex: 0, explanation: '"Relieved" = no longer worried — "erleichtert".', kompetenzbereich: 'vocabulary_context' },
        ]
      },
      {
        id: 'listen-1-unit4-task4', unit: 4, tier: 'Master',
        title: 'The School Counsellor',
        scene: 'The school counsellor\'s office',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U4_TXT4.wav',
        transcriptPath: '/assets/listening/more1/U4_TXT4.txt',
        imagePath: '/assets/listening/more1/U4_TXT4.png',
        transcriptText: `Speaker 1 (Counsellor): Good morning, Ben. You look worried. How are you feeling?\n\nSpeaker 2 (Ben): I am nervous, Mrs Brown. Tomorrow is the big maths test and I am afraid I will fail.\n\nCounsellor: I understand. Many students feel anxious before tests. Tell me, when did you start feeling this way?\n\nBen: Three days ago. I cannot sleep well, and I feel sick in the morning.\n\nCounsellor: Those are signs of stress. But I have some advice. First, take deep breaths. Breathe in slowly and breathe out.\n\nBen: (breathing) Okay... I feel a little calmer now.\n\nCounsellor: Good. Second, do not study all night. Your brain needs rest. Third, remember: a test is just a test. It does not define who you are.\n\nBen: Thank you, Mrs Brown. I was embarrassed to talk about this.\n\nCounsellor: Never be embarrassed about your feelings, Ben. Being brave does not mean you are never scared. It means you face your fears. Now, are you ready to go back to class?\n\nBen: Yes, I am ready. I feel much better. Thank you for listening.`,
        questions: [
          { question: 'Why is Ben nervous?', options: ['He has a maths test tomorrow', 'He lost his homework', 'He argued with a friend', 'He is new at school'], correctIndex: 0, explanation: 'Ben says: "Tomorrow is the big maths test and I am afraid I will fail."', kompetenzbereich: 'specific_information' },
          { question: 'How long has Ben felt anxious?', options: ['One day', 'Three days', 'One week', 'Two weeks'], correctIndex: 1, explanation: 'Ben says: "Three days ago."', kompetenzbereich: 'specific_information' },
          { question: 'What physical symptoms does Ben describe?', options: ['Headache and fever', 'Cannot sleep and feels sick in the morning', 'Sore throat and cough', 'Back pain'], correctIndex: 1, explanation: 'Ben says: "I cannot sleep well, and I feel sick in the morning."', kompetenzbereich: 'specific_information' },
          { question: 'What is the counsellor\'s first piece of advice?', options: ['Drink water', 'Take deep breaths', 'Go for a walk', 'Call a friend'], correctIndex: 1, explanation: 'She says: "First, take deep breaths."', kompetenzbereich: 'specific_information' },
          { question: 'What is her second piece of advice?', options: ['Study all night', 'Do not study all night — your brain needs rest', 'Skip the test', 'Ask the teacher for answers'], correctIndex: 1, explanation: 'She says: "Do not study all night. Your brain needs rest."', kompetenzbereich: 'specific_information' },
          { question: 'What is her third point?', options: ['You should study harder', 'A test does not define who you are', 'Tests are easy', 'Everyone fails sometimes'], correctIndex: 1, explanation: 'She says: "A test is just a test. It does not define who you are."', kompetenzbereich: 'specific_information' },
          { question: 'How did Ben feel about talking to the counsellor at first?', options: ['Proud', 'Embarrassed', 'Angry', 'Happy'], correctIndex: 1, explanation: 'Ben says: "I was embarrassed to talk about this."', kompetenzbereich: 'specific_information' },
          { question: 'What does the counsellor say about being brave?', options: ['It means never being scared', 'It means facing your fears', 'It means being strong physically', 'It means being popular'], correctIndex: 1, explanation: 'She says: "Being brave does not mean you are never scared. It means you face your fears."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "anxious" mean?', options: ['ängstlich / besorgt', 'glücklich', 'müde', 'gelangweilt'], correctIndex: 0, explanation: '"Anxious" = worried or nervous — "ängstlich / besorgt".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How does Ben feel at the end?', options: ['Still worried', 'Much better and ready for class', 'Angry at the test', 'He wants to go home'], correctIndex: 1, explanation: 'Ben says: "I feel much better. Thank you for listening."', kompetenzbereich: 'global_understanding' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 5: This is our Band
  {
    unit: 5, title: 'This is our Band', theme: 'musicians, instruments, movement',
    tasks: [
      {
        id: 'listen-1-unit5-task1', unit: 5, tier: 'Starter',
        title: 'Meet the School Band',
        scene: 'Music room at school, band practice',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U5_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U5_TXT1.txt',
        imagePath: '/assets/listening/more1/U5_TXT1.png',
        transcriptText: `Speaker 1 (Tim): Welcome to our school band! We are "The Blue Stars". Let me introduce everyone.\n\nSpeaker 2 (Sarah): I am Sarah. I can play the guitar. I practise every day after school.\n\nSpeaker 3 (Tom): I am Tom and I am the drummer. I love playing the drums — it is loud and fun!\n\nSpeaker 4 (Emma): I am the singer! I can sing very well. My favourite song is "Twinkle Twinkle Little Star".\n\nSpeaker 1: And I play the keyboard. I can play seven different songs! Together, we are the best band in the school!\n\nSpeaker 2: Do you want to join? You can sing, dance, or play an instrument!`,
        questions: [
          { question: 'What is the name of the band?', options: ['The Red Stars', 'The Blue Stars', 'The Yellow Band', 'The Green Guitar'], correctIndex: 1, explanation: 'Tim says: "We are The Blue Stars."', kompetenzbereich: 'specific_information' },
          { question: 'What instrument can Sarah play?', options: ['The drums', 'The guitar', 'The keyboard', 'The piano'], correctIndex: 1, explanation: 'Sarah says: "I can play the guitar."', kompetenzbereich: 'specific_information' },
          { question: 'What is Tom\'s role in the band?', options: ['Guitarist', 'Drummer', 'Singer', 'Keyboard player'], correctIndex: 1, explanation: 'Tom says: "I am the drummer."', kompetenzbereich: 'specific_information' },
          { question: 'What is Emma\'s favourite song?', options: ['"Happy Birthday"', '"Twinkle Twinkle Little Star"', '"Jingle Bells"', '"Old MacDonald"'], correctIndex: 1, explanation: 'Emma says her favourite is "Twinkle Twinkle Little Star."', kompetenzbereich: 'specific_information' },
          { question: 'How many songs can Tim play on the keyboard?', options: ['Three', 'Five', 'Seven', 'Ten'], correctIndex: 2, explanation: 'Tim says: "I can play seven different songs!"', kompetenzbereich: 'specific_information' },
          { question: 'What does Tom say about playing drums?', options: ['It is quiet', 'It is loud and fun', 'It is boring', 'It is very hard'], correctIndex: 1, explanation: 'Tom says: "It is loud and fun!"', kompetenzbereich: 'specific_information' },
          { question: 'How can someone join the band according to Sarah?', options: ['You must play an instrument', 'You can sing, dance, or play an instrument', 'You need to write songs', 'You must be very good'], correctIndex: 1, explanation: 'Sarah says: "You can sing, dance, or play an instrument!"', kompetenzbereich: 'global_understanding' },
          { question: 'What does "keyboard" mean in German?', options: ['Klavier / Keyboard', 'Gitarre', 'Schlagzeug', 'Flöte'], correctIndex: 0, explanation: '"Keyboard" is the same word in German — "Keyboard" or "Klavier".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many band members speak in this script?', options: ['Three', 'Four', 'Five', 'Two'], correctIndex: 1, explanation: 'Tim, Sarah, Tom, and Emma = 4 members speak.', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 6: The World's Best Detective
  {
    unit: 6, title: "The World's Best Detective", theme: 'action verbs',
    tasks: [
      {
        id: 'listen-1-unit6-task1', unit: 6, tier: 'Starter',
        title: 'The Missing Sandwich',
        scene: 'The school cafeteria, a detective investigates',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U6_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U6_TXT1.txt',
        imagePath: '/assets/listening/more1/U6_TXT1.png',
        transcriptText: `Speaker 1 (Detective Tim): Good morning! I am Detective Tim. Someone took my sandwich from the lunchbox. I must find it!\n\nSpeaker 2 (Sarah): What did the sandwich look like?\n\nSpeaker 1: It was a cheese sandwich in a blue box. I put it on my desk at 8 o\'clock.\n\nSpeaker 3 (Tom): I saw someone near the desk! A person with a red hat walked past.\n\nSpeaker 1: A red hat? Let me search the room. I look under the desks. I check the cupboards. I open the window...\n\nSpeaker 2: Look outside! Bello has got the sandwich in his mouth!\n\nSpeaker 1: Mystery solved! Bello, you are the thief! But you are too cute to be angry with.`,
        questions: [
          { question: 'What is Detective Tim looking for?', options: ['His hat', 'His lunchbox', 'His cheese sandwich', 'His pencil'], correctIndex: 2, explanation: 'Tim says: "Someone took my sandwich."', kompetenzbereich: 'specific_information' },
          { question: 'What colour was the lunchbox?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctIndex: 1, explanation: 'Tim says: "It was a cheese sandwich in a blue box."', kompetenzbereich: 'specific_information' },
          { question: 'When did Tim put the sandwich on his desk?', options: ['7 o\'clock', '8 o\'clock', '9 o\'clock', '10 o\'clock'], correctIndex: 1, explanation: 'Tim says: "I put it on my desk at 8 o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'What did the person near the desk wear?', options: ['A blue jacket', 'A red hat', 'A green scarf', 'A yellow bag'], correctIndex: 1, explanation: 'Tom says: "A person with a red hat walked past."', kompetenzbereich: 'specific_information' },
          { question: 'Where does Tim look for the sandwich?', options: ['In the garden', 'Under desks, cupboards, and he opens the window', 'In the library', 'In the playground'], correctIndex: 1, explanation: 'Tim says: "I look under the desks. I check the cupboards. I open the window..."', kompetenzbereich: 'specific_information' },
          { question: 'Who actually has the sandwich?', options: ['Sarah', 'Tom', 'Bello the dog', 'The teacher'], correctIndex: 2, explanation: 'Sarah says: "Bello has got the sandwich in his mouth!"', kompetenzbereich: 'specific_information' },
          { question: 'How does Tim feel about Bello taking his sandwich?', options: ['Very angry', 'He thinks Bello is too cute to be angry with', 'He wants to punish Bello', 'He is sad'], correctIndex: 1, explanation: 'Tim says: "You are too cute to be angry with."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "thief" mean?', options: ['Dieb', 'Polizist', 'Lehrer', 'Freund'], correctIndex: 0, explanation: '"Thief" = someone who steals — "Dieb".', kompetenzbereich: 'vocabulary_context' },
          { question: 'What verbs does Tim use to describe his search?', options: ['Run, jump, sing', 'Look, check, open', 'Eat, drink, sleep', 'Read, write, draw'], correctIndex: 1, explanation: 'Tim says: "I look... I check... I open..."', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 7: I love Noodles
  {
    unit: 7, title: 'I love Noodles', theme: 'food',
    tasks: [
      {
        id: 'listen-1-unit7-task1', unit: 7, tier: 'Starter',
        title: 'What\'s for Lunch?',
        scene: 'The school cafeteria at lunch time',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U7_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U7_TXT1.txt',
        imagePath: '/assets/listening/more1/U7_TXT1.png',
        transcriptText: `Speaker 1 (Tim): I am so hungry! What is for lunch today?\n\nSpeaker 2 (Sarah): Let me see the menu. Today we have got pizza, salad, and noodles.\n\nSpeaker 1: I love noodles! I want the noodles with chicken and carrots.\n\nSpeaker 3 (Emma): I don\'t like meat. I want the salad with tomatoes and cheese.\n\nSpeaker 4 (Tom): I want pizza! Pizza is my favourite food. I can eat pizza every day.\n\nSpeaker 1: Can I have some apple juice too?\n\nSpeaker 2: Yes, there is apple juice, orange juice, and water.\n\nSpeaker 1: Great! Let us eat together. A good lunch makes a happy student!`,
        questions: [
          { question: 'Where does this conversation take place?', options: ['In the classroom', 'In the school cafeteria', 'At home', 'In the park'], correctIndex: 1, explanation: 'The scene is the school cafeteria at lunch time.', kompetenzbereich: 'global_understanding' },
          { question: 'What three foods are on the menu?', options: ['Burgers, fries, and soup', 'Pizza, salad, and noodles', 'Sandwiches, cake, and fruit', 'Rice, fish, and ice cream'], correctIndex: 1, explanation: 'Sarah says: "Today we have got pizza, salad, and noodles."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim want?', options: ['Pizza', 'Salad', 'Noodles with chicken and carrots', 'Just carrots'], correctIndex: 2, explanation: 'Tim says: "I want the noodles with chicken and carrots."', kompetenzbereich: 'specific_information' },
          { question: 'Why does Emma not want meat?', options: ['She is allergic', 'She doesn\'t like meat', 'She is vegetarian', 'She already ate meat'], correctIndex: 1, explanation: 'Emma says: "I don\'t like meat."', kompetenzbereich: 'specific_information' },
          { question: 'What is Tom\'s favourite food?', options: ['Noodles', 'Salad', 'Pizza', 'Chicken'], correctIndex: 2, explanation: 'Tom says: "Pizza is my favourite food."', kompetenzbereich: 'specific_information' },
          { question: 'What three drinks are available?', options: ['Apple juice, orange juice, and water', 'Milk, water, and cola', 'Tea, coffee, and juice', 'Lemonade, milk, and water'], correctIndex: 0, explanation: 'Sarah says: "There is apple juice, orange juice, and water."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim say about a good lunch?', options: ['It makes you sleepy', 'A good lunch makes a happy student', 'Lunch is not important', 'You should skip lunch'], correctIndex: 1, explanation: 'Tim says: "A good lunch makes a happy student!"', kompetenzbereich: 'global_understanding' },
          { question: 'What does "hungry" mean in German?', options: ['hungrig', 'durstig', 'müde', 'glücklich'], correctIndex: 0, explanation: '"Hungry" = "hungrig" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does Sarah look at to tell the menu?', options: ['A book', 'The menu', 'A poster', 'Her phone'], correctIndex: 1, explanation: 'Sarah says: "Let me see the menu."', kompetenzbereich: 'specific_information' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 8: Clothes
  {
    unit: 8, title: 'Clothes', theme: 'clothing',
    tasks: [
      {
        id: 'listen-1-unit8-task1', unit: 8, tier: 'Starter',
        title: 'Getting Dressed for the Party',
        scene: 'A bedroom, getting ready for a party',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U8_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U8_TXT1.txt',
        imagePath: '/assets/listening/more1/U8_TXT1.png',
        transcriptText: `Speaker 1 (Sarah): Hurry up, Emma! The party starts in one hour. What are you going to wear?\n\nSpeaker 2 (Emma): I don\'t know! I have got a blue dress and a pink dress. Which one is better?\n\nSpeaker 1: I think the blue dress looks nice with your white shoes.\n\nSpeaker 2: Good idea! And I will wear my silver necklace.\n\nSpeaker 1: What about a jacket? It is cold outside. Wear your red jacket.\n\nSpeaker 2: Yes, my red jacket is warm. What are you wearing, Sarah?\n\nSpeaker 1: I am wearing my green trousers, a yellow T-shirt, and my favourite purple hat.\n\nSpeaker 2: You look great! Now let us go to the party!`,
        questions: [
          { question: 'How much time until the party?', options: ['Thirty minutes', 'One hour', 'Two hours', 'Ten minutes'], correctIndex: 1, explanation: 'Sarah says: "The party starts in one hour."', kompetenzbereich: 'specific_information' },
          { question: 'What two dresses does Emma have?', options: ['A green dress and a red dress', 'A blue dress and a pink dress', 'A yellow dress and a white dress', 'A purple dress and a black dress'], correctIndex: 1, explanation: 'Emma says: "I have got a blue dress and a pink dress."', kompetenzbereich: 'specific_information' },
          { question: 'Which dress does Sarah recommend?', options: ['The pink one', 'The blue one', 'A different dress', 'Both'], correctIndex: 1, explanation: 'Sarah says: "The blue dress looks nice with your white shoes."', kompetenzbereich: 'specific_information' },
          { question: 'What kind of necklace will Emma wear?', options: ['A gold necklace', 'A silver necklace', 'A pearl necklace', 'No necklace'], correctIndex: 1, explanation: 'Emma says: "I will wear my silver necklace."', kompetenzbereich: 'specific_information' },
          { question: 'Why does Emma need a jacket?', options: ['It is raining', 'It is cold outside', 'It is formal', 'She wants to match'], correctIndex: 1, explanation: 'Sarah says: "It is cold outside. Wear your red jacket."', kompetenzbereich: 'specific_information' },
          { question: 'What colour is Emma\'s jacket?', options: ['Blue', 'Green', 'Red', 'Yellow'], correctIndex: 2, explanation: 'Emma says: "My red jacket is warm."', kompetenzbereich: 'specific_information' },
          { question: 'What is Sarah wearing?', options: ['A dress and shoes', 'Green trousers, a yellow T-shirt, and a purple hat', 'Blue jeans and a white shirt', 'A skirt and a jacket'], correctIndex: 1, explanation: 'Sarah says: "I am wearing my green trousers, a yellow T-shirt, and my favourite purple hat."', kompetenzbereich: 'specific_information' },
          { question: 'What does "necklace" mean in German?', options: ['Ring', 'Halskette', 'Armband', 'Ohrring'], correctIndex: 1, explanation: '"Necklace" = "Halskette" in German.', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many items of clothing does Sarah describe?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1, explanation: 'Trousers, T-shirt, and hat = 3 items.', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 9: Shopping
  {
    unit: 9, title: 'Shopping', theme: 'pets',
    tasks: [
      {
        id: 'listen-1-unit9-task1', unit: 9, tier: 'Starter',
        title: 'At the Pet Shop',
        scene: 'A pet shop, a family looking at animals',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U9_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U9_TXT1.txt',
        imagePath: '/assets/listening/more1/U9_TXT1.png',
        transcriptText: `Speaker 1 (Tim): Mum, look at all the animals! Can we get a pet?\n\nSpeaker 2 (Mum): Which animal do you like, Tim?\n\nSpeaker 1: I love the little brown dog. He is so cute! He has got big ears and a short tail.\n\nSpeaker 3 (Emma): I want the grey cat! She has got green eyes and soft fur.\n\nSpeaker 2: We can only get one pet. You must choose together.\n\nSpeaker 1: But I want a dog...\n\nSpeaker 3: And I want a cat...\n\nSpeaker 2: Wait, look at this small white rabbit. It is quiet and does not need walks. It can live in a cage in the garden.\n\nSpeaker 1 & 3 (together): Yes! A rabbit! We agree on a rabbit!\n\nSpeaker 2: Good choice! Let us buy a cage and food for our new rabbit.`,
        questions: [
          { question: 'Where is the family?', options: ['At the supermarket', 'At the pet shop', 'At the park', 'At the zoo'], correctIndex: 1, explanation: 'The scene is a pet shop.', kompetenzbereich: 'global_understanding' },
          { question: 'What dog does Tim like?', options: ['A big black dog', 'A little brown dog', 'A white puppy', 'A spotted dog'], correctIndex: 1, explanation: 'Tim says: "I love the little brown dog."', kompetenzbereich: 'specific_information' },
          { question: 'What colour are the cat\'s eyes?', options: ['Blue', 'Brown', 'Green', 'Yellow'], correctIndex: 2, explanation: 'Emma says: "She has got green eyes."', kompetenzbereich: 'specific_information' },
          { question: 'How many pets can the family get?', options: ['Two', 'Three', 'One', 'None'], correctIndex: 2, explanation: 'Mum says: "We can only get one pet."', kompetenzbereich: 'specific_information' },
          { question: 'What pet does the mum suggest?', options: ['A fish', 'A bird', 'A small white rabbit', 'A hamster'], correctIndex: 2, explanation: 'Mum says: "Look at this small white rabbit."', kompetenzbereich: 'specific_information' },
          { question: 'Why does Mum suggest the rabbit?', options: ['It is cheap', 'It is quiet and does not need walks', 'It can sing', 'It likes to run'], correctIndex: 1, explanation: 'Mum says: "It is quiet and does not need walks."', kompetenzbereich: 'specific_information' },
          { question: 'Do Tim and Emma agree on the rabbit?', options: ['No, they still want a dog and cat', 'Yes, they agree together', 'They do not decide', 'They leave without a pet'], correctIndex: 1, explanation: 'Both say: "Yes! A rabbit! We agree on a rabbit!"', kompetenzbereich: 'global_understanding' },
          { question: 'What does the family need to buy with the rabbit?', options: ['A collar', 'A cage and food', 'A bed', 'Toys only'], correctIndex: 1, explanation: 'Mum says: "Let us buy a cage and food."', kompetenzbereich: 'specific_information' },
          { question: 'What does "cute" mean in German?', options: ['süß / niedlich', 'groß', 'laut', 'wild'], correctIndex: 0, explanation: '"Cute" = "süß / niedlich" in German.', kompetenzbereich: 'vocabulary_context' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 10: In a Shop
  {
    unit: 10, title: 'In a Shop', theme: 'numbers, demonstratives, shopping',
    tasks: [
      {
        id: 'listen-1-unit10-task1', unit: 10, tier: 'Starter',
        title: 'Buying School Supplies',
        scene: 'A stationery shop',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U10_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U10_TXT1.txt',
        imagePath: '/assets/listening/more1/U10_TXT1.png',
        transcriptText: `Speaker 1 (Tim): I need to buy some school supplies. Excuse me, how much is this red pencil?\n\nSpeaker 2 (Shopkeeper): That red pencil is fifty cents. These blue pencils are the same price.\n\nSpeaker 1: I want two red pencils and one blue pencil, please. That is one euro and fifty cents.\n\nSpeaker 2: Correct! Anything else?\n\nSpeaker 1: How much are those erasers over there?\n\nSpeaker 2: Those erasers are thirty cents each. And these rulers are one euro.\n\nSpeaker 1: I will take one eraser and one ruler, please. So, two red pencils, one blue pencil, one eraser, and one ruler.\n\nSpeaker 2: That will be three euros and thirty cents, please.\n\nSpeaker 1: Here you are. Thank you! I am ready for school now.`,
        questions: [
          { question: 'Where is Tim?', options: ['At the supermarket', 'At a stationery shop', 'At a bakery', 'At a library'], correctIndex: 1, explanation: 'The scene is a stationery shop.', kompetenzbereich: 'global_understanding' },
          { question: 'How much does one red pencil cost?', options: ['30 cents', '50 cents', '1 euro', '2 euros'], correctIndex: 1, explanation: 'The shopkeeper says: "That red pencil is fifty cents."', kompetenzbereich: 'specific_information' },
          { question: 'How many red pencils does Tim buy?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 1, explanation: 'Tim says: "I want two red pencils."', kompetenzbereich: 'specific_information' },
          { question: 'How much does an eraser cost?', options: ['20 cents', '30 cents', '50 cents', '1 euro'], correctIndex: 1, explanation: 'The shopkeeper says: "Those erasers are thirty cents each."', kompetenzbereich: 'specific_information' },
          { question: 'How much is one ruler?', options: ['50 cents', '1 euro', '1 euro 50', '2 euros'], correctIndex: 1, explanation: 'The shopkeeper says: "These rulers are one euro."', kompetenzbereich: 'specific_information' },
          { question: 'What is the total price Tim pays?', options: ['2 euros 30 cents', '3 euros 30 cents', '4 euros', '5 euros'], correctIndex: 1, explanation: 'The shopkeeper says: "That will be three euros and thirty cents."', kompetenzbereich: 'specific_information' },
          { question: 'What demonstrative does the shopkeeper use for the pencils?', options: ['Those', 'This', 'That', 'These'], correctIndex: 2, explanation: 'He says: "That red pencil" and "These blue pencils."', kompetenzbereich: 'vocabulary_context' },
          { question: 'What does "shopkeeper" mean?', options: ['Verkäufer / Ladenbesitzer', 'Kunde', 'Lehrer', 'Bäcker'], correctIndex: 0, explanation: '"Shopkeeper" = the person who works in a shop — "Verkäufer".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many items does Tim buy in total?', options: ['Three', 'Four', 'Five', 'Six'], correctIndex: 2, explanation: 'Two red pencils, one blue pencil, one eraser, one ruler = 5 items.', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 11: What's the Time?
  {
    unit: 11, title: "What's the Time?", theme: 'free time, time expressions',
    tasks: [
      {
        id: 'listen-1-unit11-task1', unit: 11, tier: 'Starter',
        title: 'A Day at School',
        scene: 'A classroom, the teacher asks about daily routines',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U11_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U11_TXT1.txt',
        imagePath: '/assets/listening/more1/U11_TXT1.png',
        transcriptText: `Speaker 1 (Teacher): Good morning, class. Let us talk about time. Tim, what time do you get up?\n\nSpeaker 2 (Tim): I get up at seven o\'clock in the morning.\n\nSpeaker 1: And what do you do after you get up?\n\nSpeaker 2: I brush my teeth, I get dressed, and I eat breakfast at half past seven.\n\nSpeaker 1: What time does school start?\n\nSpeaker 2: School starts at eight o\'clock. I walk to school with my sister.\n\nSpeaker 1: Sarah, when do you have lunch?\n\nSpeaker 3 (Sarah): I have lunch at twelve o\'clock in the school cafeteria.\n\nSpeaker 1: And after school?\n\nSpeaker 3: I play with my friends at the playground until four o\'clock. Then I go home and do my homework.\n\nSpeaker 1: Emma, what time do you go to bed?\n\nSpeaker 4 (Emma): I go to bed at eight o\'clock. I am always tired after a long day!\n\nSpeaker 1: Very good, everyone. You all have good daily routines!`,
        questions: [
          { question: 'What time does Tim get up?', options: ['Six o\'clock', 'Seven o\'clock', 'Half past seven', 'Eight o\'clock'], correctIndex: 1, explanation: 'Tim says: "I get up at seven o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim do after waking up?', options: ['Plays games', 'Brushes teeth, gets dressed, and eats breakfast', 'Reads a book', 'Watches TV'], correctIndex: 1, explanation: 'Tim says: "I brush my teeth, I get dressed, and I eat breakfast."', kompetenzbereich: 'specific_information' },
          { question: 'What time does school start?', options: ['Half past seven', 'Eight o\'clock', 'Half past eight', 'Nine o\'clock'], correctIndex: 1, explanation: 'Tim says: "School starts at eight o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'When does Sarah have lunch?', options: ['Eleven o\'clock', 'Twelve o\'clock', 'One o\'clock', 'Half past twelve'], correctIndex: 1, explanation: 'Sarah says: "I have lunch at twelve o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'What does Sarah do after school?', options: ['Goes straight home', 'Plays with friends at the playground until four', 'Goes shopping', 'Takes a nap'], correctIndex: 1, explanation: 'Sarah says: "I play with my friends at the playground until four o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'What time does Emma go to bed?', options: ['Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock', 'Ten o\'clock'], correctIndex: 1, explanation: 'Emma says: "I go to bed at eight o\'clock."', kompetenzbereich: 'specific_information' },
          { question: 'What does Emma say about why she goes to bed?', options: ['She is not tired', 'She is always tired after a long day', 'She wants to read', 'Her parents make her'], correctIndex: 1, explanation: 'Emma says: "I am always tired after a long day!"', kompetenzbereich: 'global_understanding' },
          { question: 'How does Tim get to school?', options: ['By bus', 'He walks with his sister', 'By car', 'By bike'], correctIndex: 1, explanation: 'Tim says: "I walk to school with my sister."', kompetenzbereich: 'specific_information' },
          { question: 'What does the teacher say at the end?', options: ['You need to sleep more', 'You all have good daily routines', 'School is too long', 'Try harder'], correctIndex: 1, explanation: 'The teacher says: "You all have good daily routines!"', kompetenzbereich: 'global_understanding' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 12: The Birthday Cake
  {
    unit: 12, title: 'The Birthday Cake', theme: 'rooms, months, ordinal numbers',
    tasks: [
      {
        id: 'listen-1-unit12-task1', unit: 12, tier: 'Starter',
        title: 'Planning a Birthday Party',
        scene: 'A living room, a family plans a birthday',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U12_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U12_TXT1.txt',
        imagePath: '/assets/listening/more1/U12_TXT1.png',
        transcriptText: `Speaker 1 (Tim): Mum, my birthday is on the fifteenth of June. Can we have a party?\n\nSpeaker 2 (Mum): Of course! Let us plan it. Which room should we use?\n\nSpeaker 1: The living room is big. We can put balloons and a birthday cake there.\n\nSpeaker 2: Good idea. The kitchen is for preparing the food. We will make sandwiches and a chocolate cake.\n\nSpeaker 3 (Sarah, Tim's sister): I can decorate the hallway. I will put colourful paper on the walls!\n\nSpeaker 2: And your bedroom, Tim — please clean it. Your friends will want to see your toys.\n\nSpeaker 1: Okay, I will clean my bedroom. What about the garden?\n\nSpeaker 2: If the weather is nice, we can play games in the garden. It is summer, so it should be warm.\n\nSpeaker 3: How many friends can Tim invite?\n\nSpeaker 2: Six friends. That way, we have eight people including us. Perfect for the living room!`,
        questions: [
          { question: 'When is Tim\'s birthday?', options: ['The first of June', 'The fifteenth of June', 'The twenty-fifth of June', 'The fifth of July'], correctIndex: 1, explanation: 'Tim says: "My birthday is on the fifteenth of June."', kompetenzbereich: 'specific_information' },
          { question: 'Which room will they have the party in?', options: ['The kitchen', 'The bedroom', 'The living room', 'The bathroom'], correctIndex: 2, explanation: 'Tim says: "The living room is big."', kompetenzbereich: 'specific_information' },
          { question: 'What will they make in the kitchen?', options: ['Pizza', 'Sandwiches and a chocolate cake', 'Ice cream', 'Noodles'], correctIndex: 1, explanation: 'Mum says: "We will make sandwiches and a chocolate cake."', kompetenzbereich: 'specific_information' },
          { question: 'Who wants to decorate the hallway?', options: ['Tim', 'Mum', 'Sarah', 'Dad'], correctIndex: 2, explanation: 'Sarah says: "I can decorate the hallway."', kompetenzbereich: 'specific_information' },
          { question: 'What does Mum ask Tim to do?', options: ['Buy presents', 'Clean his bedroom', 'Invite friends', 'Decorate the living room'], correctIndex: 1, explanation: 'Mum says: "Please clean it. Your friends will want to see your toys."', kompetenzbereich: 'specific_information' },
          { question: 'What might they do in the garden?', options: ['Eat lunch', 'Play games', 'Sleep', 'Study'], correctIndex: 1, explanation: 'Mum says: "We can play games in the garden."', kompetenzbereich: 'specific_information' },
          { question: 'How many friends can Tim invite?', options: ['Four', 'Five', 'Six', 'Eight'], correctIndex: 2, explanation: 'Mum says: "Six friends."', kompetenzbereich: 'specific_information' },
          { question: 'How many people total including the family?', options: ['Six', 'Seven', 'Eight', 'Nine'], correctIndex: 2, explanation: 'Mum says: "Eight people including us."', kompetenzbereich: 'specific_information' },
          { question: 'What does "decorate" mean in German?', options: ['dekorieren', 'kochen', 'aufräumen', 'backen'], correctIndex: 0, explanation: '"Decorate" = "dekorieren" in German.', kompetenzbereich: 'vocabulary_context' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 13: Help!
  {
    unit: 13, title: 'Help!', theme: 'emergency services, accidents',
    tasks: [
      {
        id: 'listen-1-unit13-task1', unit: 13, tier: 'Starter',
        title: 'Calling for Help',
        scene: 'A street, someone has fallen off their bike',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U13_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U13_TXT1.txt',
        imagePath: '/assets/listening/more1/U13_TXT1.png',
        transcriptText: `Speaker 1 (Tim): Help! My friend fell off his bike! He is on the ground.\n\nSpeaker 2 (Adult passer-by): Stay calm! Is he awake?\n\nSpeaker 1: Yes, he is awake, but his arm hurts a lot. He cannot move it.\n\nSpeaker 2: I will call an ambulance. Can you tell me where we are?\n\nSpeaker 1: We are on Park Street, next to the big tree near the school.\n\nSpeaker 2: Good. The ambulance is coming. Do not move him. Keep him warm with your jacket.\n\nSpeaker 1: Okay, I am putting my jacket over him. He says his head does not hurt, only his arm.\n\nSpeaker 2: That is a good sign. The ambulance will be here in five minutes.\n\nSpeaker 1: Thank you for helping! I was so scared.\n\nSpeaker 2: You did the right thing by calling for help. Always stay calm in an emergency.`,
        questions: [
          { question: 'What happened to Tim\'s friend?', options: ['He fell off his bike', 'He got lost', 'He was in a fight', 'He fell asleep'], correctIndex: 0, explanation: 'Tim says: "My friend fell off his bike!"', kompetenzbereich: 'specific_information' },
          { question: 'What body part hurts?', options: ['His leg', 'His arm', 'His head', 'His back'], correctIndex: 1, explanation: 'Tim says: "His arm hurts a lot."', kompetenzbereich: 'specific_information' },
          { question: 'What does the adult do first?', options: ['Runs away', 'Calls an ambulance', 'Lifts the boy', 'Gives him water'], correctIndex: 1, explanation: 'The adult says: "I will call an ambulance."', kompetenzbereich: 'specific_information' },
          { question: 'Where are they?', options: ['School Street', 'Park Street, next to a big tree near the school', 'Main Road', 'Garden Street'], correctIndex: 1, explanation: 'Tim says: "We are on Park Street, next to the big tree near the school."', kompetenzbereich: 'specific_information' },
          { question: 'What should Tim NOT do to the injured friend?', options: ['Talk to him', 'Keep him warm', 'Move him', 'Call for help'], correctIndex: 2, explanation: 'The adult says: "Do not move him."', kompetenzbereich: 'specific_information' },
          { question: 'How does Tim keep his friend warm?', options: ['With a blanket', 'He puts his jacket over him', 'He builds a fire', 'He gives him hot tea'], correctIndex: 1, explanation: 'Tim says: "I am putting my jacket over him."', kompetenzbereich: 'specific_information' },
          { question: 'How long until the ambulance arrives?', options: ['Two minutes', 'Five minutes', 'Ten minutes', 'Fifteen minutes'], correctIndex: 1, explanation: 'The adult says: "The ambulance will be here in five minutes."', kompetenzbereich: 'specific_information' },
          { question: 'What does the adult say is important in an emergency?', options: ['Run fast', 'Stay calm', 'Scream loudly', 'Take photos'], correctIndex: 1, explanation: 'The adult says: "Always stay calm in an emergency."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "ambulance" mean?', options: ['Krankenwagen', 'Feuerwehr', 'Polizei', 'Taxi'], correctIndex: 0, explanation: '"Ambulance" = "Krankenwagen" in German.', kompetenzbereich: 'vocabulary_context' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 14: It's my Favourite
  {
    unit: 14, title: "It's my Favourite", theme: 'TV programmes, books',
    tasks: [
      {
        id: 'listen-1-unit14-task1', unit: 14, tier: 'Starter',
        title: 'Favourite TV Shows and Books',
        scene: 'In the classroom, students discuss their favourite entertainment',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U14_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U14_TXT1.txt',
        imagePath: '/assets/listening/more1/U14_TXT1.png',
        transcriptText: `Speaker 1 (Teacher): Good morning, class! Today we are talking about our favourite things. Tim, what is your favourite TV programme?\n\nSpeaker 2 (Tim): I love watching nature shows. There is a programme about sharks and dolphins. I watch it every Saturday morning.\n\nSpeaker 1: Sarah, what about you?\n\nSpeaker 3 (Sarah): I like cartoons! My favourite cartoon has a funny cat and a clever mouse. They are always playing tricks on each other.\n\nSpeaker 4 (Emma): I love adventure films. There is a film about pirates looking for treasure on an island. It is very exciting!\n\nSpeaker 5 (Tom): I prefer books. My favourite book is about a wizard who goes to a magic school. I read it three times!\n\nSpeaker 1: Wonderful! It is good to have different interests. Reading, watching TV, and films — they all help you learn new things!`,
        questions: [
          { question: 'What kind of TV programme does Tim like?', options: ['Cartoons', 'Nature shows', 'Adventure films', 'News'], correctIndex: 1, explanation: 'Tim says: "I love watching nature shows."', kompetenzbereich: 'specific_information' },
          { question: 'When does Tim watch his favourite programme?', options: ['Every morning', 'Every Saturday morning', 'Every Sunday', 'Every evening'], correctIndex: 1, explanation: 'Tim says: "I watch it every Saturday morning."', kompetenzbereich: 'specific_information' },
          { question: 'What does Sarah like?', options: ['Nature shows', 'Cartoons with a funny cat and clever mouse', 'Adventure films', 'Books about wizards'], correctIndex: 1, explanation: 'Sarah says: "I like cartoons! My favourite has a funny cat and a clever mouse."', kompetenzbereich: 'specific_information' },
          { question: 'What kind of films does Emma enjoy?', options: ['Comedy films', 'Adventure films about pirates', 'Horror films', 'Documentaries'], correctIndex: 1, explanation: 'Emma says: "I love adventure films... about pirates."', kompetenzbereich: 'specific_information' },
          { question: 'What is Tom\'s favourite book about?', options: ['A detective', 'A wizard at a magic school', 'A talking animal', 'A space explorer'], correctIndex: 1, explanation: 'Tom says: "About a wizard who goes to a magic school."', kompetenzbereich: 'specific_information' },
          { question: 'How many times has Tom read his favourite book?', options: ['Once', 'Twice', 'Three times', 'Four times'], correctIndex: 2, explanation: 'Tom says: "I read it three times!"', kompetenzbereich: 'specific_information' },
          { question: 'What does the teacher say at the end?', options: ['Everyone should read the same book', 'It is good to have different interests', 'TV is better than books', 'Books are boring'], correctIndex: 1, explanation: 'The teacher says: "It is good to have different interests."', kompetenzbereich: 'global_understanding' },
          { question: 'What does "prefer" mean?', options: ['bevorzugen', 'vergessen', 'ablehnen', 'wiederholen'], correctIndex: 0, explanation: '"Prefer" = to like one thing more than another — "bevorzugen".', kompetenzbereich: 'vocabulary_context' },
          { question: 'How many students share their favourites in this dialogue?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 2, explanation: 'Tim, Sarah, Emma, and Tom = 4 students share.', kompetenzbereich: 'digital_reading' },
        ]
      },
    ]
  },
  // ════════════════════════════════════════════════════ UNIT 15: What are you Going to Do?
  {
    unit: 15, title: 'What are you Going to Do?', theme: 'future plans',
    tasks: [
      {
        id: 'listen-1-unit15-task1', unit: 15, tier: 'Starter',
        title: 'Summer Holiday Plans',
        scene: 'The last day of school, students talk about holidays',
        type: 'dialogue',
        audioPath: '/assets/listening/more1/U15_TXT1.wav',
        transcriptPath: '/assets/listening/more1/U15_TXT1.txt',
        imagePath: '/assets/listening/more1/U15_TXT1.png',
        transcriptText: `Speaker 1 (Tim): Finally, school is over! What are you going to do this summer?\n\nSpeaker 2 (Sarah): I am going to visit my grandparents. They live near the sea. I am going to swim every day!\n\nSpeaker 1: That sounds fun! I am going to go camping with my family. We are going to sleep in a tent.\n\nSpeaker 3 (Emma): I am going to learn to ride a horse. My aunt has got two horses on her farm.\n\nSpeaker 4 (Tom): I am going to stay at home and play video games. I do not want to go anywhere!\n\nSpeaker 1: But Tom, summer is for adventures! You should come camping with us.\n\nSpeaker 4: Maybe I will. It could be fun to see the stars at night.\n\nSpeaker 2: Whatever you do, I hope everyone has a great summer! See you in September!`,
        questions: [
          { question: 'What is Sarah going to do this summer?', options: ['Go camping', 'Visit her grandparents near the sea', 'Learn to ride a horse', 'Stay at home'], correctIndex: 1, explanation: 'Sarah says: "I am going to visit my grandparents. They live near the sea."', kompetenzbereich: 'specific_information' },
          { question: 'What activity does Sarah plan to do at the sea?', options: ['Fish', 'Swim every day', 'Build sandcastles', 'Sail a boat'], correctIndex: 1, explanation: 'Sarah says: "I am going to swim every day!"', kompetenzbereich: 'specific_information' },
          { question: 'What is Tim going to do?', options: ['Visit grandparents', 'Go camping with his family', 'Learn to ride a horse', 'Stay at home'], correctIndex: 1, explanation: 'Tim says: "I am going to go camping with my family."', kompetenzbereich: 'specific_information' },
          { question: 'Where will Tim sleep?', options: ['In a hotel', 'In a tent', 'In a cabin', 'Under the stars without a tent'], correctIndex: 1, explanation: 'Tim says: "We are going to sleep in a tent."', kompetenzbereich: 'specific_information' },
          { question: 'What is Emma going to learn?', options: ['To swim', 'To ride a horse', 'To cook', 'To play guitar'], correctIndex: 1, explanation: 'Emma says: "I am going to learn to ride a horse."', kompetenzbereich: 'specific_information' },
          { question: 'What is Tom\'s plan?', options: ['Travel abroad', 'Go camping', 'Stay at home and play video games', 'Learn a new sport'], correctIndex: 2, explanation: 'Tom says: "I am going to stay at home and play video games."', kompetenzbereich: 'specific_information' },
          { question: 'What does Tim say summer is for?', options: ['Sleeping', 'Adventures', 'Homework', 'Watching TV'], correctIndex: 1, explanation: 'Tim says: "Summer is for adventures!"', kompetenzbereich: 'global_understanding' },
          { question: 'What might Tom do if he goes camping?', options: ['Swim', 'Ride horses', 'See the stars at night', 'Play video games in a tent'], correctIndex: 2, explanation: 'Tom says: "It could be fun to see the stars at night."', kompetenzbereich: 'specific_information' },
          { question: 'When will they see each other again?', options: ['In August', 'In September', 'In October', 'Next year'], correctIndex: 1, explanation: 'Sarah says: "See you in September!"', kompetenzbereich: 'specific_information' },
        ]
      },
    ]
  },
]

export function getListeningUnit(unit: number): ListeningUnit | undefined {
  return MORE1_LISTENING_DATA.find((u) => u.unit === unit)
}
export function getListeningTask(unit: number, taskId: string): ListeningTask | undefined {
  const u = getListeningUnit(unit)
  if (!u) return undefined
  return u.tasks.find((t) => t.id === taskId)
}
