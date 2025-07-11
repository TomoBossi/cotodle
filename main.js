const isMobile = window.navigator.userAgent.match(/Android/i) ||
	window.navigator.userAgent.match(/webOS/i) ||
	window.navigator.userAgent.match(/iPhone/i) ||
	window.navigator.userAgent.match(/iPad/i) ||
	window.navigator.userAgent.match(/iPod/i) ||
	window.navigator.userAgent.match(/BlackBerry/i) ||
	window.navigator.userAgent.match(/Windows Phone/i) ||
	window.navigator.userAgent.match(/IEMobile/i) ||
	window.navigator.userAgent.match(/Opera Mini/i);

let history = JSON.parse(localStorage.getItem("history") ?? "{}");
let state = JSON.parse(
  localStorage.getItem("state") ?? '{"day":0,"guesses":[]}'
);

let dleFont;
let monoFont;
let regularFont;
let secondaryMonoFont;

let numGuesses = 4;
let guessResults = [];

let gameEnded = false;
let gameWon = false;
let gameLost = false;

let data = null;
let img = null;
let avgR = 0;
let avgG = 0;
let avgB = 0;
let imgLink = null;
let price = null;
let currentDay = 0;

const date = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit"});
const [ month, day ] = date.split("/");

async function setup() {
  createCanvas(windowWidth, windowHeight);
	reScale();
  smooth();
  angleMode(DEGREES);
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);

	dleFont = await loadFont("Brick.otf");
  monoFont = await loadFont("JuliaMonoRegular.ttf");
  regularFont = await loadFont("AlatsiRegular.ttf");
  secondaryMonoFont = await loadFont("Monofonto.otf");

  fetch("https://script.google.com/macros/s/AKfycbw9XyUAP4BB0vyujACzknRlqIkYsslcpbmMh6TtT8vCkdKr-yD0oSVA_YyVfvBKOPHuwg/exec")
    .then((response) => response.json())
    .then(async (json) => {
      currentDay = json.day;
      // price = json.discount
      //   ? min(
			// 			parseInt(json.activePrice),
      //       parseInt(json.discount.precioDescuento.replace("$", ""))
      //     )
      //   : parseInt(json.activePrice);
			price = parseInt(json.activePrice);
      if (currentDay === state.day) {
        for (let guess of state.guesses) {
          guessResults.push(getRatioCategory(guess, price));
        }
      } else {
        localStorage.removeItem("state");
        state = {
          day: currentDay,
          guesses: [],
        };
      }
      updateGameFlags();
			imgLink = createA(json.imageUrl.replace("large", "full"), "", "_blank");
			imgLink.attribute("title", "Abrir en una nueva pestaña")
      img = await loadImage(json.imageUrl);

			img.loadPixels();
			let s = 0;
			for (let y = 0; y < img.height; y++) {
				for (let x = 0; x < img.width; x++) {
					const i = (y * img.width + x) * 4;
					const pR = img.pixels[i + 0];
					const pG = img.pixels[i + 1];
					const pB = img.pixels[i + 2];
					if (pR+pG+pB !== 3*255) {
						avgR += pR;
						avgG += pG;
						avgB += pB;
						s++;
					}
				}
			}
			img.updatePixels();
			avgR /= s;
			avgG /= s;
			avgB /= s;

      data = json;
			unload = true;
    });
}

function draw() {
  background(240);
	updateLoadingTransition();
	drawImg();
	drawImgZoom();
  drawLogo();
	drawDate();
	drawDisplayName();
	drawDisplayNameTooltip();
	drawInstruction();
	drawGuesses();
	drawButtons();
  // drawDebug();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
	reScale();
}

function reScale() {
	if (width < scaleFactor*targetWidth || height < scaleFactor*targetHeight) {
		scaleFactor = min(width/targetWidth, height/targetHeight);
	} else if (width > scaleFactor*targetWidth && height > scaleFactor*targetHeight) {
		scaleFactor = min(width/targetWidth, height/targetHeight);
	}
}
