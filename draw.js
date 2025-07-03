let displayName;
let showDisplayNameTooltip = false;
let displayNameTooltipOpacity = 0;

let imgZoom;

let buttons = {};
let buttonsHighlightOpacity = [0,0,0,0,0,0,0,0,0,0,0];

let scaleFactor = 1.0;
const targetWidth = 300;
const targetHeight = 800;

let unloadingOpacity = 1;
let unload = false;
let loadingOpacity = 0;

let enterGuess;
let enterHighlightOpacity = 0;

function updateLoadingTransition() {
	if (unload && unloadingOpacity) {
		unloadingOpacity = max(unloadingOpacity - 0.03, 0);
	}
	if (!unloadingOpacity) {
		loadingOpacity = min(loadingOpacity + 0.03, 1);
	}
}

function mouseClicked() {
	for (let i = -1; i < 10; i++) {
		if (!gameEnded && buttons[i].enabled && mouseInside(buttons[i])) {
			if (i === -1) {
				backspacePressed();
			} else {
				numberPressed(i);
			}
		}
	} 
	if (mouseInside(enterGuess)) {
		submitGuess();
	}
}

function drawGuesses(s=scaleFactor, x=width/2, y=scaleFactor*520) {
	for (let i = 0; i < numGuesses; i++) {
		noStroke();
		fill(200);
		rect(x, y + i*s*60, s*310, s*50, s*6);

		const guessResult = {
			pos: createVector(x+s*118, y+i*s*60),
			width: s*55, 
			height: s*30,
		};

		if (loadingOpacity && i < guessResults.length) {
			const lastGuess = gameWon && i === guessResults.length-1;
			fill(lastGuess ? color(255, 0, 0, loadingOpacity*255) : color(150, loadingOpacity*255));
			rect(x, y + i*s*60, s*310, s*50, s*6);
			fill(250, loadingOpacity*255);
			rect(x, y + i*s*60, s*302, s*42, s*4);
			fill(lastGuess ? color(255, 0, 0, loadingOpacity*255) : color(100, loadingOpacity*255));
			textSize(s*27);
			textAlign(CENTER);
			textFont(secondaryMonoFont);
			text("$", x - s*135, y + i*s*60 + s*9);
			textFont(monoFont);
			fill(130, loadingOpacity*255);
			textAlign(LEFT);
			textSize(s*27);
			text(formatPrice(state.guesses[i]), x - s*120, y + i*s*60 + s*9);

			switch (abs(guessResults[i])) {
				case 2:
					stroke(150, 80, 80, loadingOpacity*255);
					fill(255, 130, 130, loadingOpacity*255);
					break;
				case 1:
					stroke(150, 150, 100, loadingOpacity*255);
					fill(250, 250, 80, loadingOpacity*255);
					break;
				case 0:
					stroke(80, 150, 80, loadingOpacity*255);
					fill(130, 255, 130, loadingOpacity*255);
					break;
			}
			strokeWeight(3*s);
			rect(guessResult.pos.x, guessResult.pos.y, guessResult.width, guessResult.height, s*5);

			strokeWeight(2.5*s);
			stroke(50);
			switch (guessResults[i] / (abs(guessResults[i]) || 1)) {
				case 0:
					line(guessResult.pos.x-s*7.5, guessResult.pos.y-s/2, guessResult.pos.x-s*5, guessResult.pos.y+s*4);
					line(guessResult.pos.x-s*5, guessResult.pos.y+s*4, guessResult.pos.x+s*12, guessResult.pos.y-s*3);
					break;
				case 1:
					line(guessResult.pos.x, guessResult.pos.y-s*7, guessResult.pos.x, guessResult.pos.y+s*7);
					line(guessResult.pos.x, guessResult.pos.y+s*7, guessResult.pos.x+s*5, guessResult.pos.y+s*2);
					line(guessResult.pos.x, guessResult.pos.y+s*7, guessResult.pos.x-s*5, guessResult.pos.y+s*2);
					break;
				case -1:
					line(guessResult.pos.x, guessResult.pos.y-s*7, guessResult.pos.x, guessResult.pos.y+s*7);
					line(guessResult.pos.x, guessResult.pos.y-s*7, guessResult.pos.x+s*5, guessResult.pos.y-s*2);
					line(guessResult.pos.x, guessResult.pos.y-s*7, guessResult.pos.x-s*5, guessResult.pos.y-s*2);
					break;
			}
		}
		else if (loadingOpacity && i === guessResults.length && !gameEnded) {
			enterGuess = {
				pos: guessResult.pos,
				width: guessResult.width,
				height: guessResult.height,
				enabled: data && 
					!gameEnded &&
					guess
			};
			fill(255, 0, 0, loadingOpacity*255);
			rect(x, y + i*s*60, s*310, s*50, s*6);
			fill(250, loadingOpacity*255);
			rect(x, y + i*s*60, s*302, s*42, s*4);
			fill(255, 0, 0, loadingOpacity*255);
			textSize(s*27);
			textAlign(CENTER);
			textFont(secondaryMonoFont);
			text("$", x - s*135, y + i*s*60 + s*9);
			textFont(monoFont);
			fill(guess ? 60 : 200, loadingOpacity*255);
			textAlign(LEFT);
			textSize(s*27);
			text(formatPrice(guess), x - s*120, y + i*s*60 + s*9);

			fill(220);
			stroke(200);
			if (enterGuess.enabled) {
				stroke(200-loadingOpacity*50);
				fill(220+loadingOpacity*20);
				if (mouseInside(enterGuess)) {
					fill(250);
					stroke(255, 0, 0);
				}
			}
			strokeWeight(3*s);
			rect(enterGuess.pos.x, enterGuess.pos.y, enterGuess.width, enterGuess.height, s*5);
			strokeWeight(2.5*s);
			line(enterGuess.pos.x-s*15, enterGuess.pos.y+s*3, enterGuess.pos.x+s*15, enterGuess.pos.y+s*3);
			line(enterGuess.pos.x+s*15, enterGuess.pos.y-s*4, enterGuess.pos.x+s*15, enterGuess.pos.y+s*3);
			line(enterGuess.pos.x-s*15, enterGuess.pos.y+s*3, enterGuess.pos.x-10*s, enterGuess.pos.y+s*4+s*3);
			line(enterGuess.pos.x-s*15, enterGuess.pos.y+s*3, enterGuess.pos.x-10*s, enterGuess.pos.y-s*4+s*3);
		}
	}
}

function formatPrice(guess) {
	return guess.toLocaleString('en-GB');
}

function drawButtons(s=scaleFactor, x=width/2, y=scaleFactor*760) {
	for (let i = -1; i < 10; i++) {
		buttons[i] = {
			pos: createVector(x-s*113 + i*s*28.4, y),
			width: s*23, 
			height: s*30,
			enabled: data && 
				!gameEnded &&
				(i !== -1 || guess) &&
				(i !== 0 || guess) &&
				(i === -1 || guess < maxGuess)
		};
		fill(220);
		stroke(200);
		if (buttons[i].enabled) {
			stroke(200-loadingOpacity*20);
			if (mouseInside(buttons[i])) {
				fill(250);
				stroke(255, 0, 0);
			}
		}
		strokeWeight(3*s);
		rect(buttons[i].pos.x, y, buttons[i].width, buttons[i].height, s*5);

		if (buttonsHighlightOpacity[i+1]) {
			fill(255, 0, 0, buttonsHighlightOpacity[i+1]*255);
			stroke(255, 0, 0, buttonsHighlightOpacity[i+1]*255);
			rect(buttons[i].pos.x, y, buttons[i].width, buttons[i].height, s*5);
			buttonsHighlightOpacity[i+1] = max(buttonsHighlightOpacity[i+1] - 0.1, 0);
		}

		fill(150);
		stroke(150);
		if (buttons[i].enabled) {
			stroke(150-loadingOpacity*110, (1-buttonsHighlightOpacity[i+1])*255);
			fill(150-loadingOpacity*110, (1-buttonsHighlightOpacity[i+1])*255);
			if (mouseInside(buttons[i])) {
				fill(255, 0, 0, 200);
				stroke(255, 0, 0, 200);
			}
		}
		textSize(s*18);
		if (i === -1) {
			strokeWeight(2.5*s);
			line(buttons[i].pos.x-s*6, y, buttons[i].pos.x+s*6, y);
			line(buttons[i].pos.x-s*6, y, buttons[i].pos.x-2*s, y+s*4);
			line(buttons[i].pos.x-s*6, y, buttons[i].pos.x-2*s, y-s*4);
			if (buttonsHighlightOpacity[i+1]) {
				stroke(255, buttonsHighlightOpacity[i+1]*255);
				line(buttons[i].pos.x-s*6, y, buttons[i].pos.x+s*6, y);
				line(buttons[i].pos.x-s*6, y, buttons[i].pos.x-2*s, y+s*4);
				line(buttons[i].pos.x-s*6, y, buttons[i].pos.x-2*s, y-s*4);
			}
		} else {
			noStroke();
			textFont(secondaryMonoFont);
			textAlign(CENTER);
			text(i, buttons[i].pos.x, buttons[i].pos.y + s*5.5);
			if (buttonsHighlightOpacity[i+1]) {
				fill(255, buttonsHighlightOpacity[i+1]*255);
				text(i, buttons[i].pos.x, buttons[i].pos.y + s*5.5);
			}
		}
	}
}

function drawInstruction(s=scaleFactor, x=width/2, y=scaleFactor*480) {
	noStroke();
	textSize(s*15);
	textAlign(CENTER);
	textFont(secondaryMonoFont);
	fill(0, loadingOpacity*140);
	if (unloadingOpacity) {
		fill(0, unloadingOpacity*140);
		text("...", x, y);
	} else if (!gameEnded) {
		text(`Adiviná el precio del producto (${guessResults.length+1}/${numGuesses})`, x, y);
	} else if (gameWon) {
		text(`Ganaste! El precio era $${formatPrice(price)} (´㉨\`)`, x, y);
	} else {
		text(`Perdiste! El precio era $${formatPrice(price)} (´㉨\`)`, x, y);
	}
}

function drawImgZoom(s=scaleFactor*0.1, x=width/2+scaleFactor*132.5, y=scaleFactor*122) {
	if (loadingOpacity) {
		imgZoom = {
			pos: createVector(x + s*35, y + s*20),
			width: s*200,
			height: s*200
		};
		imgLink.position(imgZoom.pos.x - imgZoom.width/2, imgZoom.pos.y - imgZoom.height/2);
		imgLink.size(imgZoom.width, imgZoom.height);
		stroke(mouseInside(imgZoom) ? color(255, 0, 0, loadingOpacity*255) : color(200, loadingOpacity*255));
		strokeWeight(s*20);
		noFill();
		line(x-s*40, y+s*90, x+s*14, y+s*34);
		ellipse(x+s*50, y, s*100, s*100);
	}
}

function drawLogo(s=scaleFactor, x=width/2, y=scaleFactor*55, bgCol=color(220, 0, 0), col=color(255), dleCol=color(255), dleStrokeCol=color(0)) {
	push();
	translate(createVector(x, 0));
	scale(1.0 + 0.02 * sin(frameCount));
	rotate(2 * sin(frameCount / 2));
	push();
	shearX(-20);
	translate(createVector(-s*73.25, 0));
	drawCotoC(s, 0, y, bgCol, col);
	translate(createVector(s*60, 0));
	drawCotoO(s, 0, y, bgCol, col);
	translate(createVector(s*60, 0));
	drawCotoT(s, 0, y, bgCol, col);
	translate(createVector(s*60, 0));
	drawCotoO(s, 0, y, bgCol, col);
	pop();
	drawDle(s*0.5, 0, y, dleCol, dleStrokeCol);
	pop();
}

function drawCotoC(s, x, y, bgCol=color(220, 0, 0), col=color(255)) {
	const r = 5;
	const size = 70;
	noStroke();
	fill(bgCol);
	rect(x, y, s*0.8*size, s*size, s*2*r);

	fill(col);
	rect(x + s*-0.225*size, y, s*0.2*size, s*0.85*size, s*r);
	rect(x, y + s*-0.3375*size, s*0.65*size, s*0.175*size, s*r);
	rect(x, y + s*0.3375*size, s*0.65*size, s*0.175*size, s*r);
}

function drawCotoO(s, x, y, bgCol=color(220, 0, 0), col=color(255)) {
	const r = 5;
	const size = 70;
	noStroke();
	fill(bgCol);
	rect(x, y, s*0.8*size, s*size, s*2*r);
	fill(col);
	rect(x, y, s*0.65*size, s*0.85*size, s*r);
	fill(bgCol);
	rect(x, y, s*0.25*size, s*0.5*size, s*r/2);
}

function drawCotoT(s, x, y, bgCol=color(220, 0, 0), col=color(255)) {
	const r = 5;
	const size = 70;
	noStroke();
	fill(bgCol);
	rect(x, y, s*0.8*size, s*size, s*2*r);

	fill(col);
	rect(x, y, s*0.2*size, s*0.85*size, s*r);
	rect(x, y - s*0.3375*size, s*0.65*size, s*0.175*size, s*r);
}

function drawDle(s, x, y, dleCol, dleStrokeCol) {
	rotate(-15);
	textFont(dleFont);
	textAlign(CENTER);

	fill(dleStrokeCol);
	textSize(s*130);
	noStroke();
	text("D", x+s*155, y+s*140);
	text("L", x+s*200, y+s*140);
	text("E", x+s*240, y+s*155);

	textSize(s*120);
	fill(dleCol);
	stroke(dleStrokeCol);
	strokeWeight(s*3);
	text("D", x+s*155, y+s*130);
	text("L", x+s*200, y+s*130);
	text("E", x+s*240, y+s*145);
}

function drawDate(s=scaleFactor, x=width/2+scaleFactor*140, y=scaleFactor*35) {
	fill(255, 0, 0, 200);
	noStroke();
	textFont(monoFont);
	textSize(s*13);
	textAlign(CENTER);
	text(day, x, y);
	text(month, x, y + s*18);
	stroke(255, 0, 0, 200);
	strokeWeight(s);
	line(x-s*6, y+s*4, x+s*6, y+s*4);
}

function drawImg(s=scaleFactor, x=width/2, y=scaleFactor*132.5) {
	const imgSize = 300;
  fill(255, 0, 0);
	noStroke();
  rect(
    x,
    y + s*(imgSize / 2 - 40),
    s*(imgSize + 8),
    s*(imgSize - 30 + 8),
    s*(imgSize / 40)
  );
	fill(255);
	rect(x, y + s*(imgSize / 2 - 40), s*imgSize, s*(imgSize - 30), s*(imgSize / 50));
	if (unloadingOpacity) {
		textAlign(CENTER);
		textFont(regularFont);
		textSize(s*30);
		fill(0, unloadingOpacity*(60+50*sin(frameCount*6)));
		text("Cargando...", x, y + s*(imgSize / 2 - 30));
	} else {
		image(img, x, y + s*(imgSize / 2 - 40), s*(imgSize - 32), s*(imgSize - 32));
		fill(255, (1-loadingOpacity)*255);
		rect(x, y + s*(imgSize / 2 - 40), s*(imgSize - 32), s*(imgSize - 32));
	}
}

function drawDisplayName(s=scaleFactor, x=width/2, y=scaleFactor*375) {
	displayName = {
		pos: createVector(x, y+s*50),
		width: s*(300 + 8),
		height: s*60
	};

	loadingOpacity ? fill(avgR, avgG, avgB, loadingOpacity*75) : noFill();
	stroke(0, 80);
	strokeWeight(s);
	rect(x, displayName.pos.y, displayName.width, displayName.height, s*6);
	textSize(s*16);
	textAlign(CENTER);
	textFont(monoFont);
	strokeWeight(s);
	stroke(0, loadingOpacity*100);
	fill(0, loadingOpacity*200);

	if (unloadingOpacity) {
		stroke(0, unloadingOpacity*100);
		fill(0, unloadingOpacity*200);
		text("...", x, y+s*57.5);
	} else {
		const maxCharsPerLine = 29;
		const lines = bestLineSplit(data.displayName.trim().replace(/[\n\r\t]/g, "").replace(/\s+/g, " "), maxCharsPerLine);
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].length > maxCharsPerLine) {
				lines[i] = lines[i].slice(0, lines[i].length-3) + "...";
				showDisplayNameTooltip = true;
			}
		}
		if (lines.length > 1) {
			text(lines[0], x, y+s*45);
			text(lines[1], x, y+s*67);
		} else {
			text(lines[0], x, y+s*55);
			if (lines.length > 2) {
				showDisplayNameTooltip = true;
			}
		}
	} 
}

function bestLineSplit(text, maxCharsPerLine) {
	const words = text.split(" ");
	let lines = [];
	let line = [];
	let lineLength = 0;
	for (let word of words) {
		if (lineLength + word.length <= maxCharsPerLine) {
			line.push(word);
			lineLength += word.length + 1;
		} else {
			if (line) {
				lines.push(line.join(" "));
			}
			line = [word];
			lineLength = word.length + 1;
		}
	}
	if (line) {
		lines.push(line.join(" "));
	}
	return lines;
}

function drawDisplayNameTooltip(s=scaleFactor, x=width/2, y=scaleFactor*370) {
	if (showDisplayNameTooltip && data && mouseInside(displayName)) {
		displayNameTooltipOpacity = min(1, displayNameTooltipOpacity+0.02);
	} else {
		displayNameTooltipOpacity = max(0, displayNameTooltipOpacity-0.03);
	}
	
	if (data && displayNameTooltipOpacity) {
		const maxCharsPerLine = 36;
		const lines = bestLineSplit(data.displayName.trim().replace(/[\n\r\t]/g, "").replace(/\s+/g, " "), maxCharsPerLine);
		const numLines = lines.length;
		noStroke();
		fill(255, displayNameTooltipOpacity*180);
		rect(x, y - s*(22.5 + 15*numLines)/2, s*280, s*(15 + 15*numLines), s*6);
		stroke(0, displayNameTooltipOpacity*30);
		strokeWeight(s);
		fill(avgR, avgG, avgB, displayNameTooltipOpacity*75);
		rect(x, y - s*(22.5 + 15*numLines)/2, s*280, s*(15 + 15*numLines), s*6);
		fill(0, displayNameTooltipOpacity*200);
		textSize(s*12);
		textAlign(LEFT);
		textFont(monoFont);
		for (let i = 0; i < numLines; i++) {
			text(lines[i], x, y + s*15*(i - numLines), s*300, s*20);
		}
	}
}

function mouseInside(element) {
	return (
		mouseX < element.pos.x + element.width/2 &&
		mouseX > element.pos.x - element.width/2 &&
		mouseY < element.pos.y + element.height/2 &&
		mouseY > element.pos.y - element.height/2
	)
}

function drawDebug() {
  const content =
    "data: " +
    JSON.stringify(data || {}).replaceAll(",", ", ") +
    "\n" +
    "history: " +
    JSON.stringify(history || {}) +
    "\n" +
    "state: " +
    JSON.stringify(state || {}) +
    "\n" +
    "price: " +
    price +
    "\n" +
    "guessResults: [" +
    guessResults +
    "]\n" +
    "guess: " +
    guess +
    "\n" +
    "gameEnded: " +
    gameEnded +
    "\n" +
    "gameLost: " +
    gameLost +
    "\n" +
    "gameWon: " +
    gameWon;

  fill(0, 127);
  stroke(255, 127);
  strokeWeight(1);
  textSize(10);
	textLeading(12);
  textAlign(LEFT);
  textFont("Courier New");
  text(content, width / 2 + 5, height / 2 + 5, width - 5, height - 5);
}
