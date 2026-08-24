export interface BankQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  difficulty: "easy" | "medium" | "hard";
  type?: "multiple-choice" | "true-false";
}

export const QUESTION_BANKS: Record<string, BankQuestion[]> = {
  movies: [
    {
      text: "Which film won Best Picture at the 1994 Academy Awards?",
      options: ["Pulp Fiction", "Forrest Gump", "The Shawshank Redemption", "Quiz Show"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Who directed the movie Inception?",
      options: ["Christopher Nolan", "Steven Spielberg", "James Cameron", "Ridley Scott"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "What is the name of the fictional African country in Black Panther?",
      options: ["Zamunda", "Wakanda", "Genovia", "Latveria"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "In The Matrix, what color pill does Neo take?",
      options: ["Blue", "Green", "Red", "Yellow"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which actor played Jack Dawson in Titanic?",
      options: ["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Johnny Depp"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What year was the first Star Wars film released?",
      options: ["1975", "1977", "1979", "1980"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which movie features the quote 'Here's looking at you, kid'?",
      options: ["Casablanca", "Gone with the Wind", "Citizen Kane", "The Maltese Falcon"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "Who played the Joker in The Dark Knight?",
      options: ["Jack Nicholson", "Heath Ledger", "Joaquin Phoenix", "Jared Leto"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is the highest-grossing film of all time (unadjusted)?",
      options: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "In Jurassic Park, what kind of DNA is used to fill gaps in dinosaur DNA?",
      options: ["Snake", "Frog", "Lizard", "Bird"],
      correctIndex: 1,
      difficulty: "hard",
    },
    {
      text: "Which studio produced Toy Story, the first feature-length CGI film?",
      options: ["DreamWorks", "Pixar", "Blue Sky", "Illumination"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Who directed Parasite (2019)?",
      options: ["Bong Joon-ho", "Park Chan-wook", "Hirokazu Kore-eda", "Wong Kar-wai"],
      correctIndex: 0,
      difficulty: "medium",
    },
  ],
  music: [
    {
      text: "Which artist released the album Thriller?",
      options: ["Prince", "Michael Jackson", "Madonna", "Whitney Houston"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "How many strings does a standard guitar usually have?",
      options: ["4", "5", "6", "7"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which Beatles album features the song Hey Jude?",
      options: ["Abbey Road", "It was a single, not on a UK studio album initially", "Revolver", "Rubber Soul"],
      correctIndex: 1,
      difficulty: "hard",
    },
    {
      text: "What is Freddie Mercury's birth name?",
      options: ["Farrokh Bulsara", "Frederick Mercury", "Francis Bulsara", "Farrokh Mercury"],
      correctIndex: 0,
      difficulty: "hard",
    },
    {
      text: "Which instrument does Yo-Yo Ma famously play?",
      options: ["Violin", "Piano", "Cello", "Flute"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What genre is most associated with Johnny Cash?",
      options: ["Jazz", "Country", "Reggae", "Disco"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which singer is known as the 'Queen of Pop'?",
      options: ["Beyoncé", "Madonna", "Lady Gaga", "Britney Spears"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What year did Spotify officially launch?",
      options: ["2006", "2008", "2010", "2012"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which composer wrote The Four Seasons?",
      options: ["Bach", "Mozart", "Vivaldi", "Handel"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "Adele's album 21 includes which hit single?",
      options: ["Hello", "Rolling in the Deep", "Someone Like You only on 21 — wait Rolling in the Deep", "Easy On Me"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which band performed Bohemian Rhapsody?",
      options: ["The Rolling Stones", "Queen", "Led Zeppelin", "Pink Floyd"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What does DJ stand for?",
      options: ["Digital Jockey", "Disc Jockey", "Dance Judge", "Drum Jazz"],
      correctIndex: 1,
      difficulty: "easy",
    },
  ],
  sports: [
    {
      text: "How many players are on a soccer team on the field at once?",
      options: ["9", "10", "11", "12"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Italy", "Argentina", "Brazil"],
      correctIndex: 3,
      difficulty: "easy",
    },
    {
      text: "In tennis, what is a score of zero called?",
      options: ["Nil", "Love", "Blank", "Zero"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "How many points is a touchdown worth in American football (without the extra point)?",
      options: ["3", "6", "7", "8"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which athlete has won the most Olympic gold medals?",
      options: ["Usain Bolt", "Michael Phelps", "Simone Biles", "Carl Lewis"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "What sport uses a shuttlecock?",
      options: ["Tennis", "Squash", "Badminton", "Table tennis"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "How long is an Olympic swimming pool?",
      options: ["25 meters", "50 meters", "75 meters", "100 meters"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which NBA team has won the most championships?",
      options: ["Los Angeles Lakers", "Chicago Bulls", "Boston Celtics", "Golden State Warriors"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "In baseball, how many strikes make an out?",
      options: ["2", "3", "4", "5"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Where were the first modern Olympic Games held in 1896?",
      options: ["Paris", "London", "Athens", "Rome"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "What is the maximum break in snooker?",
      options: ["100", "147", "155", "200"],
      correctIndex: 1,
      difficulty: "hard",
    },
    {
      text: "Which country invented cricket?",
      options: ["India", "Australia", "England", "South Africa"],
      correctIndex: 2,
      difficulty: "medium",
    },
  ],
  science: [
    {
      text: "What planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Mercury"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is H2O more commonly known as?",
      options: ["Salt", "Water", "Oxygen", "Hydrogen"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "How many bones are in the adult human body?",
      options: ["186", "206", "226", "256"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "What force keeps planets in orbit around the Sun?",
      options: ["Magnetism", "Friction", "Gravity", "Inertia alone"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which gas do plants absorb from the air for photosynthesis?",
      options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the speed of light approximately?",
      options: ["300,000 km/s", "150,000 km/s", "30,000 km/s", "3,000 km/s"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "Who proposed the theory of general relativity?",
      options: ["Newton", "Einstein", "Hawking", "Galileo"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What particle has a negative charge?",
      options: ["Proton", "Neutron", "Electron", "Photon"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the hardest natural substance on Earth?",
      options: ["Quartz", "Diamond", "Topaz", "Corundum"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "DNA stands for what?",
      options: ["Deoxyribonucleic acid", "Dynamic nuclear acid", "Dinitrogen acid", "Deoxy nutrient acid"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "Which planet has the most moons (as currently known)?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      correctIndex: 1,
      difficulty: "hard",
    },
  ],
  history: [
    {
      text: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "The Great Wall is primarily associated with which country?",
      options: ["Japan", "Korea", "China", "Mongolia"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which ancient civilization built the pyramids at Giza?",
      options: ["Romans", "Greeks", "Egyptians", "Mayans"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "In what year did the Berlin Wall fall?",
      options: ["1987", "1989", "1991", "1993"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Who was known as the Maid of Orléans?",
      options: ["Marie Antoinette", "Joan of Arc", "Catherine de' Medici", "Eleanor of Aquitaine"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which empire was ruled by Julius Caesar?",
      options: ["Greek", "Persian", "Roman", "Ottoman"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "The Titanic sank in which year?",
      options: ["1905", "1912", "1918", "1923"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Who wrote the Declaration of Independence (principal author)?",
      options: ["John Adams", "Benjamin Franklin", "Thomas Jefferson", "James Madison"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "Which war was fought between the North and South in the United States?",
      options: ["Revolutionary War", "Civil War", "War of 1812", "Spanish-American War"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Machu Picchu was built by which civilization?",
      options: ["Aztec", "Maya", "Inca", "Olmec"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "Who was the British Prime Minister for most of World War II?",
      options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
      correctIndex: 1,
      difficulty: "medium",
    },
  ],
  geography: [
    {
      text: "What is the capital of France?",
      options: ["Lyon", "Marseille", "Paris", "Nice"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctIndex: 3,
      difficulty: "easy",
    },
    {
      text: "Mount Everest is located in which mountain range?",
      options: ["Andes", "Alps", "Himalayas", "Rockies"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which country has the most time zones?",
      options: ["USA", "Russia", "France", "China"],
      correctIndex: 2,
      difficulty: "hard",
    },
    {
      text: "What is the longest river in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which desert is the largest hot desert in the world?",
      options: ["Gobi", "Kalahari", "Sahara", "Arabian"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the capital of Japan?",
      options: ["Osaka", "Kyoto", "Tokyo", "Nagoya"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which continent is the driest?",
      options: ["Africa", "Australia", "Antarctica", "Asia"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "How many countries are in the United Kingdom?",
      options: ["2", "3", "4", "5"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which African country was formerly called Abyssinia?",
      options: ["Egypt", "Ethiopia", "Sudan", "Kenya"],
      correctIndex: 1,
      difficulty: "hard",
    },
    {
      text: "What is the smallest country in the world by area?",
      options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "The Great Barrier Reef is off the coast of which country?",
      options: ["New Zealand", "Indonesia", "Australia", "Philippines"],
      correctIndex: 2,
      difficulty: "easy",
    },
  ],
  food: [
    {
      text: "Which country is sushi originally from?",
      options: ["China", "Korea", "Japan", "Thailand"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the main ingredient in guacamole?",
      options: ["Tomato", "Avocado", "Pepper", "Onion"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which pasta shape's name means 'little worms' in Italian?",
      options: ["Penne", "Fusilli", "Vermicelli", "Farfalle"],
      correctIndex: 2,
      difficulty: "hard",
    },
    {
      text: "What type of pastry is used to make profiteroles?",
      options: ["Puff pastry", "Shortcrust", "Choux pastry", "Filo"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "Which fruit is traditionally used to make wine?",
      options: ["Apple", "Grape", "Cherry", "Plum"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is mozzarella traditionally made from?",
      options: ["Cow milk only", "Buffalo milk", "Goat milk", "Sheep milk"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which spice comes from the Crocus flower?",
      options: ["Turmeric", "Saffron", "Paprika", "Cinnamon"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "What does 'al dente' mean when cooking pasta?",
      options: ["Very soft", "Firm to the bite", "Overcooked", "Cold"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which country invented pizza as we know it today?",
      options: ["Greece", "France", "Italy", "USA"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the primary ingredient in hummus?",
      options: ["Lentils", "Chickpeas", "Black beans", "Peas"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Espresso originated in which country?",
      options: ["France", "Italy", "Spain", "Portugal"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which nut is used to make marzipan?",
      options: ["Walnut", "Cashew", "Almond", "Hazelnut"],
      correctIndex: 2,
      difficulty: "medium",
    },
  ],
  tech: [
    {
      text: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Utility"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "Who co-founded Apple with Steve Jobs?",
      options: ["Bill Gates", "Steve Wozniak", "Larry Page", "Elon Musk"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "In what year was the first iPhone released?",
      options: ["2005", "2006", "2007", "2008"],
      correctIndex: 2,
      difficulty: "medium",
    },
    {
      text: "What does 'www' stand for?",
      options: ["World Wide Web", "Web World Wide", "Wide World Web", "World Web Wide"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "Which company developed the Android operating system?",
      options: ["Apple", "Microsoft", "Google", "Samsung"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the name of Elon Musk's space company?",
      options: ["Blue Origin", "SpaceX", "Virgin Galactic", "NASA"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Binary code uses which two digits?",
      options: ["0 and 1", "1 and 2", "A and B", "Yes and No"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "What does USB stand for?",
      options: ["Universal Serial Bus", "United System Board", "Universal System Bridge", "Ultra Speed Bus"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "Which programming language is known for its use in data science and AI?",
      options: ["COBOL", "Python", "Assembly", "Pascal"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What company owns Instagram?",
      options: ["Google", "Twitter", "Meta", "Microsoft"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What does AI stand for in technology?",
      options: ["Automated Internet", "Artificial Intelligence", "Advanced Interface", "Applied Innovation"],
      correctIndex: 1,
      difficulty: "easy",
    },
  ],
  animals: [
    {
      text: "What is the fastest land animal?",
      options: ["Lion", "Cheetah", "Horse", "Gazelle"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "How many legs does a spider have?",
      options: ["6", "8", "10", "12"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is a baby kangaroo called?",
      options: ["Cub", "Joey", "Pup", "Calf"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which mammal can fly?",
      options: ["Flying squirrel", "Bat", "Sugar glider", "Colugo"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is the largest animal on Earth?",
      options: ["African elephant", "Blue whale", "Giraffe", "Sperm whale"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "A group of lions is called a what?",
      options: ["Herd", "Pack", "Pride", "Flock"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which bird is known for mimicking human speech?",
      options: ["Eagle", "Parrot", "Owl", "Penguin"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "How many hearts does an octopus have?",
      options: ["1", "2", "3", "4"],
      correctIndex: 2,
      difficulty: "hard",
    },
    {
      text: "What is the only continent without native reptiles?",
      options: ["Europe", "Antarctica", "Australia", "North America"],
      correctIndex: 1,
      difficulty: "medium",
    },
    {
      text: "Which animal has black-and-white stripes?",
      options: ["Tiger", "Zebra", "Panda only", "Skunk only"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What do you call an animal that eats only plants?",
      options: ["Carnivore", "Herbivore", "Omnivore", "Insectivore"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which sea creature has five arms?",
      options: ["Jellyfish", "Starfish", "Crab", "Lobster"],
      correctIndex: 1,
      difficulty: "easy",
    },
  ],
  "pop-culture": [
    {
      text: "Which streaming service released Stranger Things?",
      options: ["Hulu", "Disney+", "Netflix", "Amazon Prime"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What social media app is known for short videos and was formerly Musical.ly?",
      options: ["Instagram", "Snapchat", "TikTok", "Vine"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which Hogwarts house has a lion as its symbol?",
      options: ["Slytherin", "Hufflepuff", "Ravenclaw", "Gryffindor"],
      correctIndex: 3,
      difficulty: "easy",
    },
    {
      text: "Who created the Marvel Cinematic Universe character Iron Man on screen first?",
      options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What does 'FOMO' stand for?",
      options: ["Fear Of Missing Out", "Friends On My Own", "Full Of More Options", "Feeling Of Major Overwhelm"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "Which reality show features contestants competing to be the last one standing on an island?",
      options: ["The Bachelor", "Survivor", "Big Brother", "The Amazing Race"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "In Friends, what is the name of Ross and Monica's dog when they were kids?",
      options: ["Chi-Chi", "Marcel", "Fluffy", "Buddy"],
      correctIndex: 0,
      difficulty: "hard",
    },
    {
      text: "Which company makes the Switch gaming console?",
      options: ["Sony", "Microsoft", "Nintendo", "Sega"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the name of the coffee shop in Friends?",
      options: ["Central Perk", "Monk's Café", "Luke's Diner", "MacLaren's"],
      correctIndex: 0,
      difficulty: "easy",
    },
    {
      text: "Which artist sang the viral hit 'Baby Shark'?",
      options: ["Pinkfong", "Justin Bieber", "Psy", "Blackpink"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "What color is the main character's hoodie often associated with in Squid Game?",
      options: ["Blue tracksuits for players", "Green", "Red", "Yellow"],
      correctIndex: 0,
      difficulty: "medium",
    },
    {
      text: "Which platform was originally called 'Twitters' concept of microblogging?",
      options: ["Facebook", "Twitter (X)", "LinkedIn", "Reddit"],
      correctIndex: 1,
      difficulty: "easy",
    },
  ],
  general: [
    {
      text: "How many days are in a leap year?",
      options: ["364", "365", "366", "367"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the tallest mountain in the world?",
      options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "How many continents are there?",
      options: ["5", "6", "7", "8"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What do bees collect to make honey?",
      options: ["Pollen", "Nectar", "Dew", "Sap"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "Which color is made by mixing red and blue?",
      options: ["Green", "Orange", "Purple", "Brown"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "How many sides does a hexagon have?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is the largest planet in our solar system?",
      options: ["Saturn", "Neptune", "Jupiter", "Uranus"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which instrument measures temperature?",
      options: ["Barometer", "Thermometer", "Altimeter", "Hygrometer"],
      correctIndex: 1,
      difficulty: "easy",
    },
    {
      text: "What is the currency of Japan?",
      options: ["Yuan", "Won", "Yen", "Ringgit"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "How many letters are in the English alphabet?",
      options: ["24", "25", "26", "27"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "What is the opposite of north?",
      options: ["East", "West", "South", "Northeast"],
      correctIndex: 2,
      difficulty: "easy",
    },
    {
      text: "Which vitamin is produced when skin is exposed to sunlight?",
      options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
      correctIndex: 2,
      difficulty: "medium",
    },
  ],
};

/** Clean up a couple awkwardly worded bank items for polish */
export function getCleanBank(categoryId: string): BankQuestion[] {
  const bank = QUESTION_BANKS[categoryId] ?? QUESTION_BANKS.general;
  return bank.map((q) => {
    if (q.text.includes("Adele")) {
      return {
        ...q,
        text: "Which hit single is on Adele's album 21?",
        options: ["Hello", "Rolling in the Deep", "Easy On Me", "Skyfall"] as [string, string, string, string],
        correctIndex: 1,
      };
    }
    if (q.text.includes("Squid Game")) {
      return {
        ...q,
        text: "In Squid Game, what color tracksuits do the players wear?",
        options: ["Green", "Blue", "Red", "Yellow"] as [string, string, string, string],
        correctIndex: 0,
      };
    }
    if (q.text.includes("Twitter")) {
      return {
        ...q,
        text: "Which platform was originally known as Twitter?",
        options: ["Facebook", "X", "LinkedIn", "Reddit"] as [string, string, string, string],
        correctIndex: 1,
      };
    }
    if (q.text.includes("Friends, what is the name of Ross")) {
      return {
        ...q,
        text: "In Friends, what was the name of Ross's pet monkey?",
        options: ["Marcel", "Chi-Chi", "Fluffy", "Buddy"] as [string, string, string, string],
        correctIndex: 0,
      };
    }
    if (q.text.includes("Hey Jude")) {
      return {
        ...q,
        text: "Which band recorded the song Hey Jude?",
        options: ["The Rolling Stones", "The Beatles", "The Who", "The Beach Boys"] as [string, string, string, string],
        correctIndex: 1,
      };
    }
    return q;
  });
}
