let w = window.innerWidth;
let h = window.innerHeight;
let stars = [];
let n = 500;

let origin;
let spawnpoint;
let mouseVec;

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
    // combine the left and right channel into workArray
    let array1 = audioArray.slice(0, 64);
    let array2 = audioArray.slice(64, 128);
    let workArray = array1.map((a, i) => (a + array2[i]) / 2);
    // workArray = [ normalizeBands = [ bassBands, ... ], ... ]
    // normalize over the first {normalizeBands} bands
    // retreive bass from first {bassBands} bands
    const normalizeBands = 32;
    const bassBands = 2;
    let top = 0.1;
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
    // assign bass
    bass = workArray.slice(0, bassBands).reduce((a, b) => a + b, 0) / (bassBands * top);
    // curve bass values
    let bassMod = (x) => x < 0.5 ? pow(x, 2) : pow(x, 0.5);
    bass = bassMod(bass);

    // array to avoid stuttering/flickering
    // let arr = [];
    // if (arr[0] && arr[1]) {
    //     arr[1] = arr[0];
    //     arr[0] = bassAvg;
    //     bass = arr[0] * 0.67 + arr[1] * 0.33;
    // } else if (arr[0]) {
    //     arr[1] = arr[0];
    //     arr[0] = bassAvg;
    //     bass = arr[0];
    // } else {
    //     arr[0] = bassAvg;
    //     bass = arr[0];
    // }

    // // noise reduction
    // if (bass < 0.05) {
    //     bass = 0;
    // }
};

// ----------------------- star -----------------------
class star {
    constructor(x, y) {
        // positional attributes
        this.z = random();
        this.angleMod = random(-2, 2);
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1).mult(this.z).rotate(this.angleMod);

        this.turbo = 0;

        // visual attributes
        this.alphaUB = map(this.z, 0, 1, 100, 180) + random(-65, 65);
        this.alpha = 0;
        this.rBase = random(1, 2);
        this.r = this.rBase;
    }

    // star methods
    shoot() {
        const v1 = mouseVec.copy().mult(this.z).rotate(this.angleMod);
        const diff = v1.copy().sub(this.vel);
        this.vel = this.vel.add(diff.mult(0.05));

        this.pos.add(this.vel);

        if (this.turbo > 0) {
            // positional attributes
            let turboVec = this.vel.copy();
            turboVec.mult(8 * this.turbo);
            this.pos.add(turboVec);

            // visual attributes
            // let altAlpa = abs(30 - 25 * this.turbo);
            // (this.alpha + this.alphaUB / altAlpa < this.alphaUB) ?
            // this.alpha += this.alphaUB / altAlpa: this.alpha = this.alphaUB;
            this.r = this.rBase + this.turbo;
        }
    }

    show() {
        fill(this.alpha, this.alpha, this.alpha);
        let rnd = random(30, 60);
        (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
        this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;
        noStroke();

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
    createCanvas(w, h);
    angleMode(DEGREES);
    rectMode(CENTER);
    colorMode(RGB);
    frameRate(60);

    origin = createVector(w / 2, 0);
    //tryWallpaperApi();
}

function draw() {
    mouseVec = createVector(mouseX, mouseY).sub(origin).normalize();

    // background coloring on turbo values
    let maxTurbo = 0;
    for (let star of stars) {
        star.turboMod();
        //(mouseIsPressed || bass > 0) ? star.hyper(true): star.hyper(false);
        star.turbo > maxTurbo ? maxTurbo = star.turbo : () => {};
    }
    if (maxTurbo > 0) {
        background(0, 255 - 80 * maxTurbo);
    } else {
        background(0);
    }

    // shoot the stars!
    for (let star of stars) {
        star.shoot();
        star.show();
        if (star.pos.x > w) {
            star.pos.x = 0;
        } else if (star.pos.x < 0) {
            star.pos.x = w;
        }

        if (star.pos.y > h) {
            star.pos.y = 0;
        } else if (star.pos.y < 0) {
            star.pos.y = h;
        }
    }
    addStars();
}

// ----------------------- other methods -----------------------
function addStars() {
    while (stars.length < n) {
        let x = int(random(0, w));
        let y = int(random(0, h));
        stars = [...stars, new star(x, y)] //.push(new star(x, y));
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
    for (star of stars) {
        star.turbo = 1;
    }
}

function tryWallpaperApi() {
    let aArr = [];
    for (let i = 0; i < 128; i++) {
        aArr[i] = random(0, 2);
    }
    wallpaperAudioListener(aArr);
}
// resize function
window.addEventListener('resize', function () {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    setup();
})
