let w;
let h;
let stars = [];

let spawnpoint;
let mouseVec;
let followVec;
let time = 0;

let angleOff = 0;
let pressVec;
let bgColor;

// global audio array, computated by wallpaperAudioListener()
let nrofBands = 32; // currently not in use
let normTop = 0.1;
let noiseGate = 0.1;
let bandCount = 0;

let audArr = new Array(nrofBands); // currently not in use
let bass = 0;

// ----------------------- settings -----------------------
const dSettings = { //  impl. and gui
  'number of stars': 250, // T T
  'sound speed': 30, // T T
  'follow mouse': false, // T T
  'angle change rate': 0.1, // F T
  'star turn rate': 0.4, // F T
  'background color': [20, 20, 20], // T T
  'fade background': true, // T T
  'bg fade color': [0, 0, 0], // T T
  'star color': [255, 255, 255], // T T
  'star trails': 80, // T T
}

// intial check for save; load if present
let settings = JSON.parse(localStorage.getItem('stargaze_settings'));
if (settings === null) {
  // none existed, use default settings
  settings = dSettings;
}

const guiFunctions = {
  reset: function () {
    for (const key of Object.keys(dSettings)) {
      settings[key] = dSettings[key];
    }
  },
  save: function () {
    localStorage.setItem('stargaze_settings', JSON.stringify(settings));
  },
  load: function () {
    // try to find previous save
    loaded = JSON.parse(localStorage.getItem('stargaze_settings'));
    if (loaded !== null) {
      for (const key of Object.keys(loaded)) {
        settings[key] = loaded[key];
      }
    }
  }
}

let n = settings['number of stars'];
let turboSpeed = settings['sound speed']; // default: 8
let tracking = settings['tracking behavior'];
let noiseRate = 0.1; // !tracking
let turnrate = Math.pow(20 / 100.0, 2);
let origin; // tracking

// ----------------------- gui setup -----------------------

let controllers = [];
let folders = [];
let fadeColor;
let bAngleChangeRate;
let hidden = false;
let hideTimer;

function setupGui() {
  let gui = new dat.GUI({
    width: 300,
    useLocalStorage: true
  });
  gui.addColor(settings, 'background color').listen();
  gui.addColor(settings, 'star color').listen();

  controllers[1] = gui.add(settings, 'fade background').listen();
  fadeColor = gui.addFolder(" ");
  fadeColor.addColor(settings, 'bg fade color').listen();
  fadeColor.open();
  if (!settings['fade background']) {
    fadeColor.hide();
  }

  controllers[0] = gui.add(settings, 'follow mouse').listen();
  bAngleChangeRate = gui.addFolder("  ");
  bAngleChangeRate.add(settings, 'angle change rate', 0, 1, 0.1).listen();
  bAngleChangeRate.open();
  if (settings['follow mouse']) {
    bAngleChangeRate.hide();
  }

  gui.add(settings, 'sound speed', 0, 100, 1).listen();
  gui.add(settings, 'number of stars', 0, 1000, 25).listen();
  gui.add(settings, 'star trails', 0, 100, 1).listen();

  gui.add(guiFunctions, 'save');
  gui.add(guiFunctions, 'load');
  gui.add(guiFunctions, 'reset');
  gui.show();
  // gui.remember(settings);

  // controller handlers
  controllers[0].onChange((val) => {
    if (!val) {
      bAngleChangeRate.show();
      bAngleChangeRate.open();
      return;
    }
    bAngleChangeRate.hide();
  });

  controllers[1].onChange((val) => {
    if (val) {
      fadeColor.show();
      fadeColor.open();
      return;
    }
    fadeColor.hide();
  });
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
