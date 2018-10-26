let w = window.innerWidth;
let h = window.innerHeight;
let stars = [];
let n = 250;

let origin;
let spawnpoint;
let mouseVec;
let mouseTracking = true;
let mouseVecAngle = 225;

// global bass value, computated by wallpaperAudioListener()
let bass = 0;
// show top right bass indicator
let bassRef = true;
// bass queue to negate stuttering/flickering
// bQSize = n, smooth out the bass value using the last n values
let bQSize = 1;
let bQueue = [];

window.wallpaperPropertyListener = {
    applyUserProperties: function (p) {
        // amount of stars
        if (p.amount) {
            n = p.amount.value;
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
    // combine the left and right channel into workArray
    let array1 = audioArray.slice(0, 64);
    let array2 = audioArray.slice(64, 128);
    let workArray = array1.map((a, i) => (a + array2[i]) / 2);
    // workArray = [ normalizeBands = [ bassBands, ... ], ... ]
    // normalize over the first {normalizeBands} bands
    // retreive bass from first {bassBands} bands
    let normalizeBands = 32;
    let bassBands = 4;
    let top = 0.01;
    for (let i = 0; i < normalizeBands; i++) {
        if (workArray[i] > top) {
            top = workArray[i];
        };
    }
    // clamp values to 1
    for (let i = 0; i < workArray.length; i++) {
        if (workArray[i] > 1) {
            workArray[i] = 1;
        };
    }
    // smooth bass over previous values
    bass = workArray.slice(0, bassBands).reduce((a, b) => a + b, 0) / (bassBands * top);
    // if (bQueue.length >= bQSize) {
    //     bQueue.pop();
    // }
    // bQueue.push(bass);
    // let cumulativeBass = 0,
    //     div = 0;
    // for (let i = 0; i < bQueue.length; i++) {
    //     cumulativeBass += (i + 1) * bQueue[i];
    //     div += (i + 1);
    // }
    // bass = cumulativeBass / div;
    // curve bass values
    // let bassMod = (x) => {
    //     x < 0.1 ? x = 0 : x = x;
    //     x < 0.5 ? x = pow(x * 2, 2) / 2 : x = pow(x, 0.5);
    //     return x;
    // }
    // bass = bassMod(bass);

    // if (arr[0] && arr[1]) {
    //     arr[1] = arr[0];
    //     arr[0] = bass;
    //     bass = arr[0] * 0.67 + arr[1] * 0.33;
    // } else if (arr[0]) {
    //     arr[1] = arr[0];
    //     arr[0] = bass;
    //     bass = arr[0];
    // } else {
    //     arr[0] = bass;
    //     bass = arr[0];
    // }
};

// ----------------------- star -----------------------
class star {
    constructor(x, y) {
        // positional attributes
        this.z = pow(random(), 2); // inverse square law
        this.angleMod = random(-2, 2);
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1).mult(this.z).rotate(this.angleMod);

        this.turbo = 0;
        this.done = false;

        // visual attributes
        this.alphaUB = map(this.z, 0, 1, 125, 200) + random(-50, 50);
        this.alpha = 0;
        this.rBase = 2;
        this.r = this.rBase;
    }

    // star methods
    shoot() {
        // calculate angle change
        const diff = mouseVec.copy().mult(this.z).rotate(this.angleMod).sub(this.vel).mult(0.02);
        this.vel = this.vel.add(diff).normalize().mult(this.z);

        this.pos.add(this.vel);

        // if there is turbo
        if (this.turbo > 0) {
            // positional attributes
            let turboVec = this.vel.copy();
            let turboSpeed = 10; // def: 8
            turboVec.mult(turboSpeed * this.turbo);
            this.pos.add(turboVec);

            // visual attributes
            // let altAlpa = abs(30 - 25 * this.turbo);
            // (this.alpha + this.alphaUB / altAlpa < this.alphaUB) ?
            // this.alpha += this.alphaUB / altAlpa: this.alpha = this.alphaUB;
            // this.r = this.rBase + this.turbo;
        }
    }

    show() {
        fill(this.alpha, this.alpha, this.alpha);

        let rnd = random(30, 60);
        (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
        this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;

        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    turboMod() {
        const falloff = (x) => (x - 0.01) / 1.05;
        if (this.turbo <= bass || falloff(this.turbo) < bass) {
            this.turbo = bass;
        } else {
            this.turbo = falloff(this.turbo);
        }
    }
}

// ----------------------- p5 setup() and draw() -----------------------
function setup() {
    angleMode(DEGREES);
    colorMode(RGB);
    frameRate(30);
    createCanvas(w, h);
    noStroke();

    //origin = createVector(w / 2, 0);
    origin = createVector(w / 2, -w / 6);
    mouseVec = createVector(w, h).sub(origin).normalize();

    //tryWallpaperApi();
}

function draw() {
    mouseTracking ?
        mouseVec = createVector(mouseX, mouseY).sub(origin).normalize() :
        mouseVec = createVector(-1, 0).rotate(mouseVecAngle);

    // background coloring on turbo values
    let maxTurbo = 0;
    for (let i = 0; i < stars.length; i++) {
        stars[i].turboMod();
        if (stars[i].turbo > maxTurbo) {
            maxTurbo = stars[i].turbo;
        };
    }

    if (maxTurbo > 0) {
        background(0, 255 - 255 * maxTurbo);
    } else {
        background(0);
    }

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
        let i = round(random(0, stars.length - 1));
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
    console.table(bQueue);
}
// resize function
window.addEventListener('resize', function () {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    setup();
})
