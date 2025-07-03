let guess = 0;
const maxGuess = 999999999;

function keyPressed() {
  if (!gameEnded) {
    const numStart = keyCode >= 96 ? 96 : 48;
    if (numStart <= keyCode && keyCode < numStart + 10) { // numbers
      numberPressed(keyCode - numStart);
    } else if (keyCode === 8) { // backspace
      backspacePressed();
    } else if (keyCode === 13) { // enter
      submitGuess(price);
    }
    // clamp
    guess = constrain(guess, 0, maxGuess);
  }
}

function numberPressed(number) {
  guess = parseInt(guess + `${number}`);
  if (buttons[number].enabled) {
    buttonsHighlightOpacity[number+1] = 1;
  }
}

function backspacePressed() {
  guess = Math.floor(guess/10);
  if (buttons[-1].enabled) {
    buttonsHighlightOpacity[0] = 1;
  }
}

function resetGuess() {
  guess = 0;
}

function getRatioCategory(x, y) {
  const ratio = x / y;
  const thresholds = [0, 0.75, 0.95, 1.05, 1.25];
  for (let i = 0; i < thresholds.length; i++) {
    if (i === 4 || thresholds[i + 1] > ratio) {
      return i - 2;
    }
  }
}

function updateGameFlags() {
  gameWon = state.guesses && guessResults[guessResults.length - 1] === 0;
  gameLost = !gameWon && state.guesses.length >= numGuesses;
  gameEnded = gameWon || gameLost;
}

function submitGuess(target) {
  if (!gameEnded && guess) {
    updateState();
    guessResults.push(getRatioCategory(guess, target));
    resetGuess();
    updateGameFlags();
    if (gameEnded) {
      updateHistory();
    }
    if (enterGuess.enabled) {
      enterHighlightOpacity = 1;
    }
  }
}

function updateState() {
  state.guesses.push(guess);
  localStorage.setItem("state", JSON.stringify(state));
}

function updateHistory() {
  history[currentDay] = gameWon ? state.guesses.length : -1;
  localStorage.setItem("history", JSON.stringify(history));
}
