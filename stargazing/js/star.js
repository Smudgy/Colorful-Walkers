// ----------------------- star -----------------------
class star {
  constructor(x, y) {
    // physical/positional attributes
    this.width = random();
    this.z = pow(this.width, 3); // inverse square law
    this.angleMod = random(-2, 2);
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.vel = mouseVec.copy().mult(this.z).rotate(this.angleMod);
    //this.vel = createVector(0, 1).mult(this.z).rotate(this.angleMod);

    // functional attributes
    this.turbo = 0; // [0, 1] 

    // visual attributes
    this.alphaUB = map(this.width, 0, 1, 125, 200) + random(-50, 50);
    this.alpha = 0;
    this.rBase = 1 + this.z;
    this.r = this.rBase;
  }

  // star methods
  shoot() {
    this.updatePrevPos();

    // calculate angle change from the global variable mouseVec
    const diff = mouseVec.copy().mult(this.z).rotate(this.angleMod).sub(this.vel).mult(turnrate);
    this.vel = this.vel.add(diff).normalize().mult(this.z);

    this.pos.add(this.vel);

    // if there is turbo
    if (this.turbo > 0) {
      // positional attributes
      let turboVec = this.vel.copy();
      turboVec.mult(turboSpeed * this.turbo);
      this.pos.add(turboVec);

      // visual attributes
      // let altAlpa = abs(30 - 25 * this.turbo);
      // (this.alpha + this.alphaUB / altAlpa < this.alphaUB) ?
      // this.alpha += this.alphaUB / altAlpa: this.alpha = this.alphaUB;
      this.r = this.rBase;
    }
  }

  snap() {
    this.vel = mouseVec.copy().mult(this.z).rotate(this.angleMod);
  }

  show() {
    fill(this.alpha);
    noStroke();
    // draw the 'star'
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
    stroke(this.alpha);
    strokeWeight(this.r);
    // draw trajectory
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

    // initial fade-in
    let rnd = random(30, 60);
    (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
    this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;

  }

  turboMod() {
    const falloff = x => (x - 0.01) / 1.1; // x => (x - 0.01) / 1.05;
    if (this.turbo <= bass || falloff(this.turbo) < bass) {
      this.turbo = bass;
    } else {
      this.turbo = falloff(this.turbo);
    }
  }

  updatePrevPos() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
}
