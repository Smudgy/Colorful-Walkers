let w;
let h;
let stars = [];
let n = 250;

let origin;
let spawnpoint;
let mouseVec;
let followVec;
let turnrate = Math.pow(20 / 100.0, 2);;
let turboSpeed = 8; // default: 8
let tracking = 1; // 0 = set angle, 1 = mouse tracking, 2 = perlin noise tracking
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
