window.wallpaperPropertyListener = {
  applyUserProperties: function(properties) {
    if (properties.spacing) {
      n = properties.spacing.value;
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
    }
    if (properties.huep) {
      huep = 5.0 / ( 10.0 / ( properties.huep.value + 6 ));
    }
    if (properties.hueLoop) {
      hueLoop = properties.hueLoop.value / 10.0;
    }

    if (properties.sat1) {
      sat1 = properties.sat1.value;
    }
    if (properties.sat2) {
      sat2 = properties.sat2.value;
    }
    if (properties.satd) {
      satd = properties.satd.value * 100;
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
    }
    if (properties.ap) {
      ap = 5.0 / ( 10.0 / ( properties.ap.value + 6 ));
    }

    if (properties.rot1) {
      rot1 = properties.rot1.value;
    }
    if (properties.rot2) {
      rot2 = properties.rot2.value;
    }
    if (properties.rotd) {
      rotd = properties.rotd.value * 100;
    }
    if (properties.rotp) {
      rotp = 5.0 / ( 10.0 / ( properties.rotp.value + 6 ));
    }
    if (properties.rotLoop) {
      rotLoop = properties.rotLoop.value / 10.0;
    }
  }
};

// -----------------------------------------------------
// global variables

let w = window.innerWidth;
let h = window.innerHeight;
let dots = [];

// customizable variables

// size / radius ( 0 - inf )
let rad1 = 20;
let rad2 = 30;
let radd = 300;
let radp = 4;

// shift ( 0 - inf )
let sh1 = -50;
let sh2 = 0;
let shd = 300;
let shp = 2;

// roundoff ( 0 - 100% )
let rou1 = 20;
let rou2 = 100;
let roud = 400;
let roup = 0.4;

// hue ( 0 - 360 )
let hue1 = 180;
let hue2 = 160;
let hued = 300;
let huep = 2;
let hueLoop = 0;

// sat ( 0 - 100 )
let sat1 = 50;
let sat2 = 80;
let satd = 300;
let satp = 2;

// lum ( 0 - 100 )
let lum1 = 20;
let lum2 = 80;
let lumd = 300;
let lump = 2;

// alpha ( 0.0 - 1.0 )
let a1 = 1.0;
let a2 = 1.0;
let ad = 500;
let ap = 5;

// rotation ( 0 - inf )
let rot1 = 0;
let rot2 = 360;
let rotd = 800;
let rotp = 0.9;
let rotLoop = 0.5;

let n = 25;
let hex = true;
let circleMask = 3000.0;
