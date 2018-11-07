let w;
let h;
let stars = [];
let n = 250;

let origin;
let spawnpoint;
let mouseVec;
let turnrate = 0.2;
let turboSpeed = 8; // default: 8
let tracking = 0; // 0 = set angle, 1 = mouse tracking, 2 = perlin noise tracking
let mouseVecAngle = 225;
let offsetX = Math.random() * 1000;
let offsetY = Math.random() * 1000;

// global audio array, computated by wallpaperAudioListener()
let nrofBands = 32; // currently not in use
let normTop = 0.1;
let noiseGate = 0.1;
let bandCount = 0;
let reference = true;

let audArr = new Array(nrofBands); // currently not in use
let bass = 0;

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

// ----------------------- WallpaperPropertyListener -----------------------
// predefined wallpaper engine function
window.wallpaperPropertyListener = {
  applyUserProperties: function (p) {
    // amount of stars
    if (p.amount) {
      n = p.amount.value;
    }
    // show bass reference
    if (p.reference) {
      reference = p.reference.value;
    }
    // // nrof of bands
    // if (p.nrofBands) {
    //   nrofBands = p.nrofBands.value;
    //   stars = [];
    // }
    // show bass reference
    if (p.showBass) {
      bassRef = p.showBass.value;
    }

    // tracking
    if (p.tracking) {
      tracking = p.tracking.value;
      snapAllStars();
    }
    if (p.mouseVecAngle && tracking == 0) {
      mouseVecAngle = p.mouseVecAngle.value;
      mouseVec = createVector(-1, 0).rotate(mouseVecAngle);
      snapAllStars();
    }
    if (p.mouseOrigin && (tracking == 1 || tracking == 2)) {
      switch (p.mouseOrigin.value) {
        case 0: // TOP
          origin = createVector(w / 2, 0);
          break;
        case 1: // BOTTOM
          origin = createVector(w / 2, h);
          break;
        case 2: // RIGHT
          origin = createVector(w, h / 2);
          break;
        case 3: // LEFT
          origin = createVector(0, h / 2);
          break;
        case 4: // CENTER
          origin = createVector(w / 2, h / 2);
          break;
        default:
          origin = createVector(w / 2, -w / 6);
          break;
      }
      snapAllStars();
    }
    if (p.turnrate && (tracking == 1 || tracking == 2)) {
      turnrate = Math.pow(p.turnrate.value / 100.0, 2);
      if (turnrate < 30) {
        snapAllStars();
      }
    }
    if (p.turboSpeed) {
      turboSpeed = p.turboSpeed.value;
    }
  }
}

// ----------------------- p5 setup() and draw() -----------------------
function setup() {
  w = window.innerWidth;
  h = window.innerHeight;
  origin = createVector(w / 2, 0);

  // some default settings
  angleMode(DEGREES);
  colorMode(RGB);
  frameRate(30);
  createCanvas(w, h);
  noStroke();
  noiseDetail(4, 0.5);
  //tryWallpaperApi();
}

function draw() {
  if (tracking == 0) {
    mouseVec = createVector(-1, 0).rotate(mouseVecAngle);
  } else if (tracking == 1) {
    mouseVec = createVector(mouseX, mouseY).sub(origin).normalize()
  } else if (tracking == 2) {
    let noiseX = noise(offsetX);
    let noiseY = noise(offsetY);
    mouseVec = createVector(noiseX * w, noiseY * h).sub(origin).normalize()
    offsetX += 0.0005;
    offsetY += 0.0005;
  }

  //background coloring on turbo values
  let totalTurbo = 0;
  for (let i = 0; i < stars.length; i++) {
    stars[i].turboMod();
    totalTurbo += stars[i].turbo;
  }
  const curveUp = x => pow(x, 0.5);
  let x = curveUp(totalTurbo / stars.length); // bass
  let bgAlpha = 255 - 200 * x;
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

  // draw page information
  if (reference) {
    noStroke();
    fill(50);
    rect(w - 42, 10, 32, 200);
    fill(255);
    rect(w - 42, 10, 32, bass * 200);

    const x = w - 26;
    const y = 236;
    fill(50);
    ellipse(x, y, 32, 32);
    stroke(120);
    fill(120);
    strokeWeight(2);
    ellipse(x, y, 4, 4);
    line(x, y, x + 16 * mouseVec.x, y + 16 * mouseVec.y)
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

function snapAllStars() {
  for (star of stars) {
    star.snap();
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
