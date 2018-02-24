window.wallpaperPropertyListener = {
  applyUserProperties: function(properties) {
    if (properties.bgColor) {
      let bgColor = properties.bgColor.value.split(' ');
      bgColor_r = Math.ceil(bgColor[0] * 255);
      bgColor_g = Math.ceil(bgColor[1] * 255);
      bgColor_b = Math.ceil(bgColor[2] * 255);
    }
    if (properties.spacing) {
      n = Math.max( properties.spacing.value, 25 );
      // clear the grid and make a new one
      dots = [];
      setup();
    }
    if (properties.hex) {
      hex = properties.hex.value;
      // clear the grid and make a new one
      dots = [];
      setup();
    }
    if (properties.circle) {
      circleMask = properties.circle.value * 50.0;
      // clear the grid and make a new one
      dots = [];
      setup();
      circleShow = true;
      // clear timer, make a new one
      clearTimeout( circleTimer );
      circleTimer = setTimeout(() => {circleShow = false;}, 1000);
    }

    if (properties.sh1) {
      sh1 = properties.sh1.value;
      // clear the grid and make a new one
      dots = [];
      setup();
    }
    if (properties.sh2) {
      sh2 = properties.sh2.value;
      // clear the grid and make a new one
      dots = [];
      setup();
    }
    if (properties.shd) {
      shd = properties.shd.value * 100;
      calcMaxDist();
    }
    if (properties.shp) {
      shp = 5.0 / ( 10.0 / ( properties.shp.value + 6 ));
    }

    if (properties.rad1) {
      rad1 = properties.rad1.value;
    }
    if (properties.rad2) {
      rad2 = properties.rad2.value;
    }
    if (properties.radd) {
      radd = properties.radd.value * 100;
      calcMaxDist();
    }
    if (properties.radp) {
      radp = 5.0 / ( 10.0 / ( properties.radp.value + 6 ));
    }

    if (properties.rou1) {
      rou1 = properties.rou1.value;
    }
    if (properties.rou2) {
      rou2 = properties.rou2.value;
    }
    if (properties.roud) {
      roud = properties.roud.value * 100;
      calcMaxDist();
    }
    if (properties.roup) {
      roup = 5.0 / ( 10.0 / ( properties.roup.value + 6 ));
    }

    if (properties.hue1) {
      hue1 = properties.hue1.value;
    }
    if (properties.hue2) {
      hue2 = properties.hue2.value;
    }
    if (properties.hued) {
      hued = properties.hued.value * 100;
      calcMaxDist();
    }
    if (properties.huep) {
      huep = 5.0 / ( 10.0 / ( properties.huep.value + 6 ));
    }
    if (properties.hueLoop) {
      hueLoop = properties.hueLoop.value / 10.0;
    }

    if (properties.rot1) {
      rot1 = properties.rot1.value;
    }
    if (properties.rot2) {
      rot2 = properties.rot2.value;
    }
    if (properties.rotd) {
      rotd = properties.rotd.value * 100;
      calcMaxDist();
    }
    if (properties.rotp) {
      rotp = 5.0 / ( 10.0 / ( properties.rotp.value + 6 ));
    }
    if (properties.rotLoop) {
      rotLoop = properties.rotLoop.value / 10.0;
    }

    if (properties.sat1) {
      sat1 = properties.sat1.value;
    }
    if (properties.sat2) {
      sat2 = properties.sat2.value;
    }
    if (properties.satd) {
      satd = properties.satd.value * 100;
      calcMaxDist();
    }
    if (properties.satp) {
      satp = 5.0 / ( 10.0 / ( properties.satp.value + 6 ));
    }

    if (properties.lum1) {
      lum1 = properties.lum1.value;
    }
    if (properties.lum2) {
      lum2 = properties.lum2.value;
    }
    if (properties.lumd) {
      lumd = properties.lumd.value * 100;
      calcMaxDist();
    }
    if (properties.lump) {
      lump = 5.0 / ( 10.0 / ( properties.lump.value + 6 ));
    }

    if (properties.a1) {
      a1 = properties.a1.value / 100.0;
    }
    if (properties.a2) {
      a2 = properties.a2.value / 100.0;
    }
    if (properties.ad) {
      ad = properties.ad.value * 100;
      calcMaxDist();
    }
    if (properties.ap) {
      ap = 5.0 / ( 10.0 / ( properties.ap.value + 6 ));
    }

    if (properties.rat1) {
      rat1 = rad1 * properties.rat1.value / 100;
    }
    if (properties.rat2) {
      rat2 = rad2 * properties.rat2.value / 100;
    }
    if (properties.ratd) {
      ratd = properties.ratd.value * 100;
      calcMaxDist();
    }
    if (properties.ratp) {
      ratp = 5.0 / ( 10.0 / ( properties.ratp.value + 6 ));
    }

    if (properties.poly) {
      poly = properties.poly.value;
      calcMaxDist();
    }

    if (properties.corn1) {
      corn1 = properties.corn1.value;
    }
    if (properties.corn2) {
      corn2 = properties.corn2.value;
    }
    if (properties.cornd) {
      cornd = properties.cornd.value * 100;
      calcMaxDist();
    }
    if (properties.cornp) {
      cornp = 5.0 / ( 10.0 / ( properties.cornp.value + 6 ));
    }

    if (properties.sinedot) {
      sinedot = properties.sinedot.value;
      sinedotShow = true;
    }
    if (properties.amp) {
      amp = properties.amp.value * 10;
      movingDot = new Sinedot( amp, freq, speed, delay );
      sinedotShow = true;
    }
    if (properties.freq) {
      freq = properties.freq.value / 10.0;
      movingDot = new Sinedot( amp, freq, speed, delay );
      sinedotShow = true;
    }
    if (properties.speed) {
      speed = properties.speed.value;
      movingDot = new Sinedot( amp, freq, speed, delay );
      sinedotShow = true;
    }
    if (properties.delay) {
      delay = properties.delay.value * 10;
      movingDot = new Sinedot( amp, freq, speed, delay );
      sinedotShow = true;
    }

    if (properties.mousetrigger) {
      mouseTrigger = properties.mousetrigger.value;
    }

    if (properties.fps) {
      fps = properties.fps.value;
    }
    if (properties.blend) {
      blend = properties.blend.value;
    }
  }
};

// -----------------------------------------------------
// global variables

let w = window.innerWidth;
let h = window.innerHeight;
let dots = [];
let fps = false;
let movingDot;
let blend = 1;
let circleTimer;
let bgColor_r = 20, bgColor_g = 20, bgColor_b = 20;

// customizable variables

// size / radius ( 0 - inf )
let rad1 = 20;
let rad2 = 30;
let radd = 500;
let radp = 4;

// shift ( 0 - inf )
let sh1 = -50;
let sh2 = 50;
let shd = 0;
let shp = 2;

// roundoff ( 0 - 100% )
let rou1 = 20;
let rou2 = 100;
let roud = 0;
let roup = 0.4;

// hue ( 0 - 360 )
let hue1 = 180;
let hue2 = 160;
let hued = 0;
let huep = 2;
let hueLoop = 0;

// sat ( 0 - 100 )
let sat1 = 50;
let sat2 = 80;
let satd = 0;
let satp = 2;

// lum ( 0 - 100 )
let lum1 = 20;
let lum2 = 80;
let lumd = 0;
let lump = 2;

// alpha ( 0.0 - 1.0 )
let a1 = 1.0;
let a2 = 1.0;
let ad = 0;
let ap = 5;

// Corners ( 1 - inf )
let corn1 = 3;
let corn2 = 8;
let cornd = 0;
let cornp = 2;

// rotation ( 0 - inf )
let rot1 = 45;
let rot2 = 360;
let rotd = 0;
let rotp = 1;
let rotLoop = 0;

// ratio of squares, w/h ( > 0 )
let rat1 = Math.sqrt( 1 );
let rat2 = Math.sqrt( 1 );
let ratd = 0;
let ratp = 1;

let n = 40;
let hex = true;
let circleMask = 900.0;
let poly = true;
let sinedot = true;
let sinedotShow = true;
let circleShow = false;
let mouseTrigger = true;
let amp = 85;
let freq = 1;
let speed = 6;
let delay = 120;
let maxDist = Math.max( radd, shd, roud, hued, satd, lumd, ad, cornd, rotd, ratd);

function calcMaxDist() {
  if ( poly ) {
    maxDist = Math.max( radd, shd, hued, satd, lumd, ad, cornd, rotd);
  } else {
    maxDist = Math.max( radd, shd, roud, hued, satd, lumd, ad, rotd, ratd);
  }
}
