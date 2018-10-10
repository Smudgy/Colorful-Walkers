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

    // clamp higher values to 1
    let top = 0;
    for (let i = 0; i < workArray.length; i++) {
        if (workArray[i] > 1) {
            workArray[i] = 1;
        };
        if (top != 1 && workArray[i] > top) {
            top = workArray[i];
        };
    }

    // retreive bass from the workArray
    const nrofBands = 5;
    bass = workArray.slice(0, nrofBands).reduce((a, b) => a + b, 0) / (nrofBands * top);

    //more frequencies means less bass interaction / more stops on tremble (32-48)
    // const normalize = audioArray.slice(0, 32).concat(audioArray.slice(64, 64 + 32));
    // const threshold = audioArray.slice(0, 16).concat(audioArray.slice(64, 64 + 16));

    // if (Math.max.apply(Math, threshold) > 0.02) {
    //     let ratio = Math.max.apply(Math, normalize);
    //     for (freqBand of audioArray) {
    //         freqBand = freqBand / ratio;
    //     }
    // }

    // let lowFreqs = audioArray.slice(0, 5).concat(audioArray.slice(64, 64 + 5));
    // let sum = lowFreqs.reduce((a, b) => a + b, 0);
    // let bass = sum / lowFreqs.length;

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
        this.pos = createVector(x, y);
        this.velD = createVector(1, 1).normalize()
            .mult(this.z).rotate(random(-4, 4));
        this.turbo = 0;

        // visual attributes
        this.alphaUB = map(this.z, 0, 1, 100, 180) + random(-65, 65);
        this.alpha = 0;
        this.r = 2; //random(1, 2);
    }

    // star methods
    shoot() {
        this.pos.add(this.velD);

        if (this.turbo > 0) {
            // positional attributes
            //this.velC = createVector(this.pos.x, this.pos.y).sub(origin).normalize();
            let turboVec = this.velD.copy();
            turboVec.mult(10 * this.turbo);
            this.pos.add(turboVec);

            // visual attributes
            let altAlpa = abs(30 - 25 * this.turbo);
            (this.alpha + this.alphaUB / altAlpa < this.alphaUB) ?
            this.alpha += this.alphaUB / altAlpa: this.alpha = this.alphaUB;
            this.r = 2 + this.turbo;
        }
    }

    show() {
        fill(255, 255, 255, this.alpha);
        let rnd = random(30, 60);
        (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
        this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    turboMod() {
        let falloff = 1.1;
        if (this.turbo <= bass || this.turbo / falloff < bass) {
            //this.turbo += 1;
            this.turbo = bass;
        } else {
            this.turbo /= falloff;
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

    // let aArr = [];
    // for (let i = 0; i < 128; i++) {
    //     aArr[i] = random(0, 2);
    // }
    // wallpaperAudioListener(aArr);

    spawnpoint = createVector(w / 2, h / 8);
}

function draw() {
    origin = createVector(w, h).sub(mouseX, mouseY);
    mouseVec = createVector(mouseX, mouseY).sub(origin).normalize().mult(0.4);

    // background coloring on turbo values
    let maxTurbo = 0;
    for (let star of stars) {
        star.turboMod();
        //(mouseIsPressed || bass > 0) ? star.hyper(true): star.hyper(false);
        star.turbo > maxTurbo ? maxTurbo = star.turbo : () => {};
    }
    if (maxTurbo > 0) {
        background(0, 255 - 150 * maxTurbo);
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

// resize function
window.addEventListener('resize', function () {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    setup();
})
