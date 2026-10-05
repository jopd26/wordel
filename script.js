const ANSWER = "SHORE";
const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const boardElement = document.getElementById("board");
const keyboardElement = document.getElementById("keyboard");
const messageElement = document.getElementById("message");

const rows = [];
const keyStatus = {};
let currentRow = 0;
let currentGuess = "";
let gameOver = false;

function buildBoard() {
  for (let rowIndex = 0; rowIndex < MAX_GUESSES; rowIndex += 1) {
    const row = document.createElement("div");
    row.className = "row";

    const cells = [];
    for (let cellIndex = 0; cellIndex < ANSWER.length; cellIndex += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
      cells.push(cell);
    }

    rows.push({ row, cells });
    boardElement.appendChild(row);
  }
}

function buildKeyboard() {
  KEY_ROWS.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";

    row.forEach((key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";

      if (key === "ENTER" || key === "⌫") {
        button.classList.add("wide");
      }

      button.textContent = key;
      button.addEventListener("click", () => handleKey(key));
      rowElement.appendChild(button);
    });

    keyboardElement.appendChild(rowElement);
  });
}

function setMessage(text, tone = "neutral") {
  messageElement.textContent = text;
  messageElement.style.color = tone === "success" ? "#6aaa64" : tone === "danger" ? "#f87171" : "#9ca3af";
}

function updateCurrentRow() {
  const currentCells = rows[currentRow].cells;
  currentCells.forEach((cell, index) => {
    const letter = currentGuess[index] || "";
    cell.textContent = letter;
    cell.classList.toggle("filled", Boolean(letter));
  });
}

function getLetterState(guess) {
  const result = Array(ANSWER.length).fill("absent");
  const answerLetters = ANSWER.split("");
  const remaining = [];

  for (let index = 0; index < ANSWER.length; index += 1) {
    if (guess[index] === answerLetters[index]) {
      result[index] = "correct";
    } else {
      remaining.push(answerLetters[index]);
    }
  }

  for (let index = 0; index < ANSWER.length; index += 1) {
    if (result[index] === "correct") continue;

    const letter = guess[index];
    const pos = remaining.indexOf(letter);

    if (pos !== -1) {
      result[index] = "present";
      remaining.splice(pos, 1);
    }
  }

  return result;
}

function paintRow(rowIndex, guess, state) {
  const row = rows[rowIndex];

  row.cells.forEach((cell, index) => {
    const letter = guess[index];
    cell.textContent = letter;
    cell.classList.add(state[index]);
  });
}

function updateKeyStatus(letter, status) {
  const existing = keyStatus[letter];
  const priority = { absent: 0, present: 1, correct: 2 };

  if (!existing || priority[status] > priority[existing]) {
    keyStatus[letter] = status;
  }

  Array.from(document.querySelectorAll(".key")).forEach((button) => {
    if (button.textContent === letter) {
      button.classList.add(status);
    }
  });
}

function finalizeRow(guess) {
  const states = getLetterState(guess);
  paintRow(currentRow, guess, states);

  guess.split("").forEach((letter, index) => {
    updateKeyStatus(letter, states[index]);
  });

  if (guess === ANSWER) {
    gameOver = true;
    setMessage("Are you Shore?", "success");
    window.alert("Are you SHORE?");
    return;
  }

  currentRow += 1;
  currentGuess = "";
  setMessage("Keep going!");
  updateCurrentRow();
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "ENTER") {
    if (currentGuess.length !== ANSWER.length) {
      setMessage("Need 5 letters.", "danger");
      return;
    }

    finalizeRow(currentGuess);
    return;
  }

  if (key === "⌫") {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
    return;
  }

  if (currentGuess.length >= ANSWER.length) return;

  const normalized = key.toUpperCase();
  if (!/^[A-Z]$/.test(normalized)) return;

  currentGuess += normalized;
  updateCurrentRow();
}

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key === "Enter") {
    handleKey("ENTER");
    return;
  }

  if (key === "Backspace") {
    handleKey("⌫");
    return;
  }

  if (/^[a-zA-Z]$/.test(key)) {
    handleKey(key.toUpperCase());
  }
});

buildBoard();
buildKeyboard();
updateCurrentRow();
setMessage("Guess the secret word.");
