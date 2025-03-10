let tiles = [];
let font;
let toggleFilters = false;
let bgnColor;
let fgnColor;
let sampleFactor;
let mosaicMaxSides = 6;
let mouseDiaspora = 65;
let minMosaicSize = 5;
let maxMosaicSize = 15;

function preload() {
  font = loadFont("assets/SourceSans3-VariableFont_wght.ttf");
  copyFont = loadFont("assets/AnonymousPro-Regular.ttf");
  headingFont = loadFont("assets/ZenDots-Regular.ttf");
}

function setup() {
  const container = select("#canvas-container"); // Select the div
  createCanvas(800, 800).parent(container); // Create canvas inside the div
  buildUI();

  noStroke();
  createTiles();
  bgnColor = "#77ee99";
  fgnColor = 255;
}

function draw() {
  background(bgnColor);

  // Dibujar los mosaicos
  for (let tile of tiles) {
    tile.update(mouseX, mouseY);
    tile.display();
  }

  if (toggleFilters) {
    //filter(INVERT );
    filter(GRAY);
  }

  textFont(copyFont);
  stroke(255, 255, 255);
  fill(fgnColor);
  textSize(26);
  text("INTERNATIONAL CONFERENCE ON LIVE CODING", 122, 444);

  textFont(headingFont);
  fill(fgnColor);
  textSize(45.5);
  text("BARCELONA 2025", 122, 492);

  textFont(font);
  textSize(20);
  fill(255, 255, 0);
  text("TYPOGRAPHY RESOLUTION: " + sampleFactor.value(), 10, height - 15);
  text("MAX MOSAIC SIZE: " + maxMosaicSize.value(), 10, height - 35);
  text("MIN MOSAIC SIZE: " + minMosaicSize.value(), 10, height - 55);
  text("MOSAIC MAX SLIDES: " + mosaicMaxSides.value(), 10, height - 75);
}

// Crear los mosaicos que forman las letras
function createTiles() {
  let points = font.textToPoints("ICLC", 100, height / 2, 300, {
    sampleFactor: sampleFactor.value(), // Densidad de puntos
    simplifyThreshold: 0,
  });

  tiles = [];
  for (let pt of points) {
    tiles.push(new MosaicTile(pt.x, pt.y));
  }
  //   save("mySVG.svg"); // give file name
}

// Clase para los mosaicos
class MosaicTile {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;
    this.x = x + random(-10, 10); // Posición inicial con ligera variación
    this.y = y + random(-10, 10);
    this.size = random(minMosaicSize.value(), maxMosaicSize.value()); // Tamaño aleatorio
    this.sides = int(random(3, mosaicMaxSides.value())); // Número aleatorio de lados (entre 3 y 5)
    this.rotation = random(TWO_PI); // Rotación aleatoria inicial
    this.color = random([
      color(0, 82, 142),
      color(246, 149, 0),
      color(204, 0, 36),
      color(0, 128, 64),
      color(255, 255, 0),
      color(255, 204, 0),
      color(255, 255, 255),
    ]);
    this.offsetX = random(-0.5, 10.5); // Movimiento horizontal suave
    this.offsetY = random(-10.5, 0.5); // Movimiento vertical suave
    this.breathingAmount = random(0.2, 0.005); // Cantidad de "respiración" aleatoria
    this.breathingSpeed = random(0.01, 0.003); // Velocidad de respiración
    this.breathingDirection = -1; // Dirección de la respiración

    // Nueva propiedad para el "reset" a posición original
    this.timeToReset = random(2, 9) * 1000; // Tiempo en milisegundos (entre 2 y 9 segundos)
    this.lastResetTime = millis();
    this.isAtOriginalPosition = false;

    // Asignar un ángulo aleatorio único para cada mosaico
    this.randomAngle = random(-PI, PI); // Ángulo aleatorio único por mosaico
  }

  update(mouseX, mouseY) {
    // Verificar si es el momento de "resetear" la posición
    if (
      millis() - this.lastResetTime >= this.timeToReset &&
      !this.isAtOriginalPosition
    ) {
      this.x = this.originX;
      this.y = this.originY;
      //this.size = random(5, 15); // Resetear tamaño aleatorio
      this.isAtOriginalPosition = true;
      this.lastResetTime = millis();
    }

    // Mantener la posición original durante un tiempo (entre 2 y 9 segundos)
    if (this.isAtOriginalPosition && millis() - this.lastResetTime >= 1000) {
      this.isAtOriginalPosition = false;
      this.timeToReset = random(2, 9) * 1000; // Resetea el tiempo para el siguiente ciclo
    }

    // Movimiento suave dentro de un área limitada
    if (!this.isAtOriginalPosition) {
      this.x += this.offsetX;
      this.y += this.offsetY;

      // Limitar el movimiento para que no se aleje demasiado
      this.x = constrain(this.x, this.originX - 15, this.originX + 15);
      this.y = constrain(this.y, this.originY - 15, this.originY + 15);
    }

    // Efecto de paralaje al mover el mouse
    let distance = dist(mouseX, mouseY, this.originX, this.originY);
    if (distance < mouseDiaspora.value()) {
      this.x += (this.originX - mouseX) * 0.2151;
      this.y += (this.originY - mouseY) * 0.121611;
      this.rotation = this.rotate * sin(TWO_PI);
    }

    this.rotation *= cos(this.rotation * TWO_PI);

    // Efecto de respiración
    if (!this.isAtOriginalPosition) {
      this.size += this.breathingDirection * this.breathingSpeed;
      if (this.size >= this.breathingAmount || this.size <= 5) {
        this.breathingDirection *= -1; // Invertir la dirección de la respiración
      }
    }
  }

  display() {
    // Dibujar la sombra
    fill(0, 86); // Sombra con color oscuro y un poco de transparencia
    beginShape();
    for (let i = 0; i < this.sides; i++) {
      let angle = map(i, 0, this.sides, 0, TWO_PI + this.randomAngle); // Usar el ángulo aleatorio único
      let sx = this.x + cos(angle) * this.size + 3; // Desplazamiento para la sombra
      let sy = this.y + sin(angle) * this.size + 3; // Desplazamiento para la sombra
      vertex(sx, sy);
    }
    endShape(CLOSE);

    // Dibujar el mosaico
    fill(this.color);
    strokeWeight(0.5);
    stroke(brightness(this.color), 55);
    beginShape();
    for (let i = 0; i < this.sides; i++) {
      let angle = map(i, 0, this.sides, 0, TWO_PI + this.randomAngle); // Usar el ángulo aleatorio único
      let sx = this.x + sin(angle) * this.size * 1.2;
      let sy = this.y + cos(angle) * this.size * 1.234;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
}

function buildUI() {
  let uiContainer = select("#ui-container"); // Select the div

  createP().parent(uiContainer);

  let a_button = createButton("TOGGLE BN");
  a_button.mousePressed(function () {
    toggleFilters = !toggleFilters;
  });
  a_button.parent(uiContainer); // Attach to div

  let w_btn = createButton("TOGGLE BACKGROUND");
  w_btn.mousePressed(function () {
    if (bgnColor == 0) {
      bgnColor = 255;
      fgnColor = 0;
    } else {
      bgnColor = 0;
      fgnColor = 255;
    }
  });
  w_btn.parent(uiContainer);

  let recreate = createButton("REDRAW");
  recreate.mousePressed(function () {
    createTiles();
  });
  recreate.parent(uiContainer);

  createP().parent(uiContainer);
  createSpan("TYPOGRAPHY RESOLUTION ").parent(uiContainer);
  sampleFactor = createSlider(0.0, 1.0, 0.18, 0.01).parent(uiContainer);

  createP().parent(uiContainer);
  createSpan("MOSAIC MAX SLIDES").parent(uiContainer);
  mosaicMaxSides = createSlider(6, 20, 6, 1).parent(uiContainer);

  createP().parent(uiContainer);
  createSpan("MOUSE DIASPORA STRENGTH").parent(uiContainer);
  mouseDiaspora = createSlider(10, 220, 65, 1).parent(uiContainer);

  createP().parent(uiContainer);
  createSpan("MIN MOSAIC SIZE").parent(uiContainer);
  minMosaicSize = createSlider(1, 100, 5, 1).parent(uiContainer);

  createP().parent(uiContainer);
  createSpan("MAX MOSAIC SIZE").parent(uiContainer);
  maxMosaicSize = createSlider(1, 100, 15, 1).parent(uiContainer);
}
