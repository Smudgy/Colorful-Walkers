let w;
let h;
let stars = [];

let origin; // tracking == 1
let spawnpoint;
let mouseVec;
let followVec;
let time = 0;

// global audio array, computated by wallpaperAudioListener()
let nrofBands = 32; // currently not in use
let normTop = 0.1;
let noiseGate = 0.1;
let bandCount = 0;

let audArr = new Array(nrofBands); // currently not in use
let bass = 0;

// objects to be manipulated
let settings = {
  'number of stars': 250,
  'sound speed': 30,
  tracking: 1,
  reset: function () {
    settings['number of stars'] = 250;
    settings["sound speed"] = 30;
    settings[tracking] = 1;
  }
}

let n = settings["number of stars"];
let turboSpeed = settings["sound speed"]; // default: 8
let tracking = 1; // 0 = set angle, 1 = mouse tracking, 2 = perlin noise tracking
let noiseRate = 0.1; // tracking == 2
let mouseVecAngle = 225; // tracking == 0
let turnrate = Math.pow(20 / 100.0, 2);

// ----------------------- gui setup -----------------------

function setupGui() {
  let gui = new dat.GUI();
  let folder1 = gui.addFolder('stars');
  gui.add(settings, 'number of stars', 0, 1000, 25);
  // gui.add(text, 'speed', -5, 5);
  // gui.add(text, 'displayOutline');
  // gui.add(text, 'explode');
  gui.show();
}

// ----------------------- WallpaperAudioListener -----------------------

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

// ----------------------- onload -----------------------

window.onload = function () {
  setupGui();
  window.wallpaperRegisterAudioListener(wallpaperAudioListener);
};