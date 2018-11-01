let w;
let h;
let stars = [];
let n = 250;

let origin;
let spawnpoint;
let mouseVec;
let mouseTracking = true;
let mouseVecAngle = 225;

// global audio array, computated by wallpaperAudioListener()
let nrofBands = 32;
let normTop = 0.1;
let noiseGate = 0.1;
let bandCount = 0;
let bassRef = true;

let audArr = new Array(nrofBands);
let bass = 0;

window.wallpaperPropertyListener = {
  applyUserProperties: function (p) {
    // amount of stars
    if (p.amount) {
      n = p.amount.value;
    }
    // show bass reference
    if (p.bassRef) {
      bassRef = p.bassRef.value;
    }
    // nrof of bands
    if (p.nrofBands) {
      nrofBands = p.nrofBands.value;
      stars = [];
    }
    // show bass reference
    if (p.showBass) {
      bassRef = p.showBass.value;
    }
    // mousetracking
    if (p.mouseTracking) {
      mouseTracking = p.mouseTracking.value;
    }
    if (p.mouseVecAngle) {
      mouseVecAngle = p.mouseVecAngle.value;
    }
  }
}

// ----------------------- WallpaperAudioListener -----------------------
// predefined wallpaper engine function
window.onload = function () {
  window.wallpaperRegisterAudioListener(wallpaperAudioListener);
};

function wallpaperAudioListener(audioArray) {
  /*  adioArray:
   *  128 slots: 
   *      0-63:       low -> high, left channel
   *      64-127:     low -> high, right channel
   */

  // Massaging the audioArray to make it fit for our usecase
  // combine the left and right channel into currentArray
  let array1 = audioArray.slice(0, 64);
  let array2 = audioArray.slice(64, 128);
  let currentArray = array1.map((a, i) => (a + array2[i]) / 2);

  calcAudArr(currentArray);

  let tmp = calcBass(currentArray);
  const falloff = x => (x - 0.01) / 1.05;
  if (bass < tmp && falloff(bass) > tmp) {
    bass = falloff(bass);
  } else {
    bass = tmp; // top >= normTop || rolloff(normTop) <= top
  }
};

function calcAudArr(arr) {
  let tinyArray = new Array(nrofBands);
  // reduce the array to size nrofBands
  tinyArray.fill(0);
  for (let i = 0; i < arr.length; i++) {
    let index = floor(i / (arr.length / nrofBands));
    tinyArray[index] += arr[i] / (arr.length / nrofBands);
  }

  // normalize
  let top = noiseGate;
  for (let i = 0; i < tinyArray.length; i++) {
    if (tinyArray[i] > top) {
      top = tinyArray[i];
    };
  }

  const rolloff = x => x / 1.5;
  if (top < normTop && rolloff(normTop) > top) {
    normTop = rolloff(normTop);
  } else {
    normTop = top; // top >= normTop || rolloff(normTop) <= top
  }

  if (normTop > noiseGate) {
    audArr = tinyArray.map(x => x / normTop);
  } else {
    audArr.fill(0);
  }
}

function calcBass(arr) {
  // only normalize over the first x bands
  let x = 32;
  let bassBands = 4;

  let top = noiseGate;
  for (let i = 0; i < x; i++) {
    if (arr[i] > top) {
      top = arr[i];
    };
  }
  // clamp values to 1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 1) {
      arr[i] = 1;
    };
  }
  // smooth bass over previous values
  return (arr.slice(0, bassBands).reduce((a, b) => a + b, 0) / (bassBands * top));
}

// ----------------------- star -----------------------
class star {
  constructor(x, y) {
    // physical/positional attributes
    this.width = random();
    this.z = pow(this.width, 3); // inverse square law
    this.angleMod = random(-2, 2);
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.vel = createVector(0, 1).mult(this.z).rotate(this.angleMod);

    // functional attributes
    this.turbo = 0; // [0, 1] 

    // visual attributes
    this.alphaUB = map(this.width, 0, 1, 125, 200) + random(-50, 50);
    this.alpha = 0;
    this.rBase = 1 + this.z;
    this.r = this.rBase;
  }

  // star methods
  shoot() {
    this.updatePrevPos();

    // calculate angle change from the global variable mouseVec
    const diff = mouseVec.copy().mult(this.z).rotate(this.angleMod).sub(this.vel).mult(0.02);
    this.vel = this.vel.add(diff).normalize().mult(this.z);

    this.pos.add(this.vel);

    // if there is turbo
    if (this.turbo > 0) {
      // positional attributes
      let turboVec = this.vel.copy();
      let turboSpeed = 8; // default: 8
      turboVec.mult(turboSpeed * this.turbo);
      this.pos.add(turboVec);

      // visual attributes
      // let altAlpa = abs(30 - 25 * this.turbo);
      // (this.alpha + this.alphaUB / altAlpa < this.alphaUB) ?
      // this.alpha += this.alphaUB / altAlpa: this.alpha = this.alphaUB;
      this.r = this.rBase;
    }
  }

  show() {
    fill(this.alpha);
    noStroke();
    // draw the 'star'
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
    stroke(this.alpha);
    strokeWeight(this.r);
    // draw trajectory
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

    // initial fade-in
    let rnd = random(30, 60);
    (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
    this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;

  }

  turboMod() {
    const falloff = x => (x - 0.01) / 1.1; // x => (x - 0.01) / 1.05;
    if (this.turbo <= bass || falloff(this.turbo) < bass) {
      this.turbo = bass;
    } else {
      this.turbo = falloff(this.turbo);
    }
  }

  updatePrevPos() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
}

// ----------------------- p5 setup() and draw() -----------------------
function setup() {
  w = window.innerWidth;
  h = window.innerHeight;
  origin = createVector(w / 2, -w / 6);
  mouseVec = createVector(w, h).sub(origin).normalize();

  angleMode(DEGREES);
  colorMode(RGB);
  frameRate(30);
  createCanvas(w, h);
  noStroke();

  //tryWallpaperApi();
}

function draw() {
  mouseTracking ?
    mouseVec = createVector(mouseX, mouseY).sub(origin).normalize() :
    mouseVec = createVector(-1, 0).rotate(mouseVecAngle);

  //background coloring on turbo values
  let totalTurbo = 0;
  for (let i = 0; i < stars.length; i++) {
    stars[i].turboMod();
    totalTurbo += stars[i].turbo;
  }
  const curveUp = x => pow(x, 0.5);
  let x = curveUp(totalTurbo / stars.length); // bass
  let bgAlpha = 255 - 255 * x;
  bgAlpha > 0 ? background(0, bgAlpha) : background(0);

  // shoot the stars!
  for (let star of stars) {
    star.shoot();
    star.show();
    if (star.pos.x > w) {
      star.pos.x = 0;
      star.pos.y = random(0, h);
    } else if (star.pos.x < 0) {
      star.pos.x = w;
      star.pos.y = random(0, h);
    }

    if (star.pos.y > h) {
      star.pos.x = random(0, w);
      star.pos.y = 0;
    } else if (star.pos.y < 0) {
      star.pos.x = random(0, w);
      star.pos.y = h;
    }
  }

  setStars();

  // draw rectangle for bass reference
  if (bassRef) {
    noStroke();
    fill(50);
    rect(w - 42, 10, 32, 200);
    fill(255);
    rect(w - 42, 10, 32, bass * 200);
  }
}

// ----------------------- other methods -----------------------
function setStars() {
  let i = 0;
  while (i < 10) {
    if (stars.length < n) {
      let x = int(random(0, w));
      let y = int(random(0, h));
      stars = [...stars, new star(x, y)] //.push(new star(x, y));
    }
    i++;
  }
  while (stars.length > n) {
    stars.pop();
  }
}

// gaussian curve approximation
function randn_bm() {
  let u = 0;
  let v = 0;
  while (u === 0) u = random(); //Converting [0,1) to (0,1)
  while (v === 0) v = random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

function mousePressed() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].turbo = 1;
  }
}

function tryWallpaperApi() {
  let aArr = [];
  for (let i = 0; i < 128; i++) {
    aArr[i] = random(0, 2);
  }
  wallpaperAudioListener(aArr);
  console.table(audArr);
}
// resize function
window.addEventListener('resize', function () {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  stars = [];
  setup();
})
