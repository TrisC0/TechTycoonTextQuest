const gameText = document.getElementById('game-text');
const gameInput = document.getElementById('game-input');

const people = {
  gates: {
    name: "Bill Gates",
    command: "gates",
    question: "What is the name of Microsoft's popular operating system?",
    answer: "windows"
  },
  wozniak: {
    name: "Steve Wozniak",
    command: "wozniak",
    question: "What fruit is the logo of the company Steve Wozniak co-founded?",
    answer: "apple"
  },
  musk: {
    name: "Elon Musk",
    command: "musk",
    question: "What is the name of the electric car company founded by Elon Musk?",
    answer: "tesla"
  },
  zuckerberg: {
    name: "Mark Zuckerberg",
    command: "zuckerberg",
    question: "What social network did Mark Zuckerberg create?",
    answer: "facebook"
  },
  page: {
    name: "Larry Page",
    command: "page",
    question: "What is the name of the search engine co-founded by Larry Page?",
    answer: "google"
  },
  lecun: {
    name: "Yann LeCun",
    command: "lecun",
    question: "What field of AI is Yann LeCun famous for? (Hint: two words, starts with 'deep')",
    answer: "deep learning"
  },
  jobs: {
    name: "Steve Jobs",
    command: "jobs",
    question: "What was the first name of the co-founder of Apple with the last name Jobs?",
    answer: "steve"
  }
};

const locations = {
  microsoft: {
    name: "Microsoft Campus",
    desc: "🏢 You're at Microsoft HQ in Redmond.",
    art: `
┌──────────────────────┐
│  🏢💾🧑‍💼           │
│   MICROSOFT CAMPUS   │
└──────────────────────┘`,
    exits: ['googleplex', 'tesla'],
    person: people.gates
  },
  googleplex: {
    name: "Googleplex",
    desc: "🔍 You're at Google HQ in Mountain View.",
    art: `
┌──────────────────────┐
│  🌈🤖🚲            │
│      GOOGLEPLEX      │
└──────────────────────┘`,
    exits: ['microsoft', 'meta', 'apple_park'],
    person: people.page
  },
  apple_park: {
    name: "Apple Park",
    desc: "🍏 You're at Apple Park in Cupertino.",
    art: `
┌──────────────────────┐
│  🍏🚀🏢            │
│      APPLE PARK      │
└──────────────────────┘`,
    exits: ['googleplex', 'jobs_garage'],
    person: people.wozniak
  },
  tesla: {
    name: "Tesla Factory",
    desc: "🚗 You're at the Tesla Factory in Fremont.",
    art: `
┌──────────────────────┐
│  🚗🔋🧑‍💼          │
│    TESLA FACTORY     │
└──────────────────────┘`,
    exits: ['microsoft', 'spacex'],
    person: people.musk
  },
  spacex: {
    name: "SpaceX HQ",
    desc: "🚀 You're at SpaceX HQ.",
    art: `
┌──────────────────────┐
│  🚀🛰️👨‍🚀         │
│      SPACEX HQ       │
└──────────────────────┘`,
    exits: ['tesla'],
    person: people.musk
  },
  meta: {
    name: "Meta (Facebook) HQ",
    desc: "👍 You're at Meta HQ in Menlo Park.",
    art: `
┌──────────────────────┐
│  👍🏢🌳             │
│   META HEADQUARTERS  │
└──────────────────────┘`,
    exits: ['googleplex', 'meta_ai'],
    person: people.zuckerberg
  },
  meta_ai: {
    name: "Meta AI Labs",
    desc: "🤖 You're at Meta AI Labs.",
    art: `
┌──────────────────────┐
│  🤖🧠🌐            │
│   META AI LABS       │
└──────────────────────┘`,
    exits: ['meta'],
    person: people.lecun
  },
  jobs_garage: {
    name: "Steve Jobs' Garage",
    desc: "🛠️ You're at Steve Jobs' Garage in Los Altos.",
    art: `
┌──────────────────────┐
│  🏠🛠️🍎           │
│   STEVE JOBS' GARAGE │
└──────────────────────┘`,
    exits: ['apple_park'],
    person: people.jobs
  }
};

const siliconValleyMap = `
MAP OF SILICON VALLEY:
   [Microsoft]──[Googleplex]──[Meta HQ]──[Meta AI]
         │           │               │
     [Tesla]      [Apple Park]──[Jobs' Garage]
         │
     [SpaceX HQ]

(You are at: LOCATION_NAME)
`;

let state = {
  currentLocation: null,
  visited: {},
  awaiting: null, // person command keyword if waiting for answer
  solved: {}      // person command keyword: true if solved
};

function showLocation() {
  const loc = locations[state.currentLocation];
  gameText.textContent = `${loc.art}\n${loc.desc}\n\nYou can talk to: ${loc.person.name}\nType: talk ${loc.person.command}\n`;
  showExits();
}

function showExits() {
  const loc = locations[state.currentLocation];
  gameText.textContent += `\nPaths available:`;
  loc.exits.forEach(exit => {
    gameText.textContent += `\n- ${locations[exit].name} (type 'go ${exit.replace('_', ' ')}')`;
  });
  gameText.textContent += `\n\nType 'look at map' to see valley map\nType 'where am I' to repeat location info`;
}

function showMap() {
  const loc = locations[state.currentLocation];
  const mapWithLocation = siliconValleyMap.replace("LOCATION_NAME", loc.name);
  gameText.textContent = mapWithLocation;
  showExits();
}

function processCommand(cmd) {
  cmd = cmd.trim().toLowerCase();

  // If user is answering a question
  if (state.awaiting) {
    const personKey = state.awaiting;
    const person = people[personKey];
    if (cmd === person.answer) {
      state.solved[personKey] = true;
      state.awaiting = null;
      gameText.textContent += `\n\nCorrect!`;
      if (Object.keys(people).every(p => state.solved[p])) {
        setTimeout(showVictory, 1000);
      } else {
        showLocation();
      }
    } else {
      gameText.textContent += `\n\nIncorrect. Try again!\n${person.name} asks: "${person.question}"\n(Type your answer)`;
    }
    return;
  }

  if (cmd === "look at map") {
    showMap();
    return;
  }
  if (cmd === "where am i") {
    showLocation();
    return;
  }
  if (cmd.startsWith('go ')) {
    const destination = cmd.slice(3).replace(' ', '_');
    if (locations[state.currentLocation].exits.includes(destination)) {
      state.currentLocation = destination;
      if (!state.visited[destination]) {
        state.visited[destination] = true;
        gameText.textContent = `Traveling to ${locations[destination].name}...`;
        setTimeout(() => showLocation(), 800);
      } else {
        showLocation();
      }
    } else {
      gameText.textContent += `\n\nNo direct path to ${locations[destination]?.name || destination}. Check your map!`;
      showExits();
    }
    return;
  }
  if (cmd.startsWith('talk ')) {
    const inputPerson = cmd.slice(5).toLowerCase().replace(/\s+/g, '');
    const loc = locations[state.currentLocation];
    if (loc.person) {
      const validCommands = [
        loc.person.command.toLowerCase(),
        loc.person.name.toLowerCase().replace(/\s+/g, ''),
        loc.person.name.split(' ').pop().toLowerCase()
      ];
      if (validCommands.includes(inputPerson)) {
        if (state.solved[loc.person.command]) {
          gameText.textContent += `\n\nYou've already answered ${loc.person.name}'s question!`;
        } else {
          gameText.textContent += `\n\n${loc.person.name} asks: "${loc.person.question}"\n(Type your answer)`;
          state.awaiting = loc.person.command;
        }
      } else {
        gameText.textContent += `\n\nYou can't talk to that person here. Try: talk ${loc.person.command}`;
      }
    } else {
      gameText.textContent += `\n\nThere's no one to talk to here.`;
    }
    return;
  }
  gameText.textContent += "\n\nInvalid command. Try: 'go [location]', 'talk [person]', 'look at map', or 'where am I'";
}

function showVictory() {
  gameText.textContent = `
 __     __          __          ___       _ 
 \\ \\   / /          \\ \\        / (_)     | |
  \\ \\_/ /__  _   _   \\ \\  /\\  / / _ _ __ | |
   \\   / _ \\| | | |   \\ \\/  \\/ / | | '_ \\| |
    | | (_) | |_| |    \\  /\\  /  | | | | |_|
    |_|\\___/ \\__,_|     \\/  \\/   |_|_| |_(_)

CONGRATULATIONS!
You've answered every tech legend's question and completed the Silicon Valley Tech Adventure!
`;
  gameInput.style.display = 'none';
}

gameInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const input = gameInput.value.trim();
    if (!state.currentLocation && input === "lets begin") {
      state.currentLocation = "microsoft";
      state.visited = { "microsoft": true };
      gameText.textContent = "Starting at Microsoft Campus...";
      setTimeout(() => showLocation(), 1000);
    } 
    else if (state.currentLocation || state.awaiting) {
      gameText.textContent += `\n\n> ${input}`;
      processCommand(input);
    }
    else {
      gameText.textContent += "\n\nType 'lets begin' to start your Silicon Valley adventure!";
    }
    gameInput.value = '';
    gameText.scrollTop = gameText.scrollHeight;
  }
});

// Initial welcome message
gameText.textContent = `SILICON VALLEY TECH ADVENTURE - by Tristan Coates
---------------------------------
Welcome to Silicon Valley! Type 'lets begin' to start your tech tour.

You'll visit real locations and meet tech legends:
- Bill Gates at Microsoft
- Larry Page at Googleplex
- Steve Wozniak at Apple Park
- Elon Musk at Tesla and SpaceX
- Mark Zuckerberg at Meta HQ
- Yann LeCun at Meta AI Labs
- Steve Jobs at his Garage

Type 'lets begin' to start.`;
