let angleOff = 0;
let pressVec;

// ----------------------- p5 setup() and draw() -----------------------
function setup() {
  w = window.innerWidth;
  h = window.innerHeight;
  origin = createVector(w / 2, 0);
  setupMouseVec();
  followVec = mouseVec.copy();

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
  // background coloring on turbo values
  let totalTurbo = 0;
  for (let i = 0; i < stars.length; i++) {
    stars[i].turboMod();
    totalTurbo += stars[i].turbo;
  }
  const curveUp = x => pow(x, 0.1);
  let x = curveUp(totalTurbo / stars.length); // bass
  let bgAlpha = 255 - 130 * x;
  bgAlpha > 0 ? background(0, bgAlpha) : background(0);

  // vector creation
  setupMouseVec();
  const diff = mouseVec.copy().sub(followVec).mult((totalTurbo / stars.length) * turnrate);
  followVec = followVec.add(diff).normalize();

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

  updateSettings();
  updateStars();
}

// ----------------------- other methods -----------------------
function updateSettings() {
  n = settings['number of stars'];
  turboSpeed = settings['sound speed']; // default: 8
  tracking = settings['tracking behavior'] == 'set angle' ? 0 : settings['tracking behavior'] == 'mouse' ? 1 : 2;
}

function updateStars() {
  for (let i = 0; i < stars.length;) {
    if (stars[i].dead) {
      stars.splice(i, 1);
    } else {
      i++;
    }
  }
  let i = 0;
  while (i < 2) { // add at most 10 stars in one frame
    if (stars.length < n) {
      let x = int(random(0, w));
      let y = int(random(0, h));
      stars = [...stars, new star(x, y)] //.push(new star(x, y));
    }
    i++;
  }
  let x = stars.length - n;
  let randoms = [];
  while (x > 0) {
    let r = floor(random(stars.length));
    // re-do if that random value has already been used
    while (randoms.indexOf(r) != -1) {
      r = floor(random(stars.length));
    }
    randoms.push(r);
    stars[r].alive = stars[r].lifetime;
    x--;
  }
  // if (stars.length > n) {
  //   stars.pop();
  // }
}

function snapAllStars() {
  followVec = mouseVec.copy();
  for (let i = 0; i < stars.length; i++) {
    stars[i].snap();
  }
}

function setupMouseVec() {
  if (tracking == 0) {
    mouseVec = createVector(-1, 0).rotate(mouseVecAngle);
  } else if (tracking == 1) {
    mouseVec = createVector(mouseX, mouseY).sub(origin).normalize()
  } else if (tracking == 2) {
    let xOff = sin(time) + 1;
    let yOff = cos(time) + 1;
    let angle = noise(xOff, yOff) * 360 + angleOff;
    mouseVec = createVector(0, 1).rotate(angle);
    time += noiseRate;
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
  pressVec = createVector(mouseX, mouseY);
}

function mouseReleased() {
  relVec = createVector(mouseX, mouseY).sub(pressVec);
  if (relVec.mag() > 800) {
    let between = mouseVec.angleBetween(relVec);
    relVec.rotate(1);
    if (mouseVec.angleBetween(relVec) < between) {
      angleOff -= between;
    } else {
      angleOff += between;
    }
    angleOff = angleOff % 360
    setupMouseVec();
    // if (relVec.mag() > 1000) {
    //   snapAllStars();
    // }
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
