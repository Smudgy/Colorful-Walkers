// ----------------------- star -----------------------
class star {
  constructor(x, y) {
    // physical/positional attributes
    this.width = random();
    this.z = pow(this.width, 3); // inverse square law
    this.angleMod = random(-3, 3);
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.vel = followVec.copy().mult(this.z).rotate(this.angleMod);
    //this.vel = createVector(0, 1).mult(this.z).rotate(this.angleMod);

    // functional attributes
    this.turbo = 0; // [0, 1]
    this.alive = 0;
    this.lifetime = random(120, 720); // random lifetime
    this.dead = false;

    // visual attributes
    this.alphaUB = map(this.width, 0, 1, 100, 170) + random(-80, 80);
    this.alpha = 0;

    this.rBase = 1 + this.z;
    this.r = this.rBase;
  }

  // star methods
  shoot() {
    this.updatePrevPos();

    // calculate angle change from the global variable followVec
    this.vel = followVec.copy().rotate(this.angleMod).normalize().mult(this.z);

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
    if (this.alive < this.lifetime) { // star is alive
      this.draw();
      // initial fade-in
      let rnd = random(30, 60);
      (this.alpha + this.alphaUB / rnd < this.alphaUB) ?
      this.alpha += this.alphaUB / rnd: this.alpha = this.alphaUB;
    } else if (this.alpha > 0) { // star is dying..
      this.draw();
      // death fade-out
      const fadeout = x => (x - 0.05) / 1.05; // x => (x - 0.01) / 1.05;
      (fadeout(this.alpha) > 0) ?
      this.alpha = fadeout(this.alpha): this.alpha = 0;
    } else { // star is dead
      this.dead = true;
    }
    this.alive++;
  }
  draw() {
    const col = color(this.alpha, this.alpha, this.alpha);
    // draw the 'star'
    noStroke();
    fill(col);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
    // draw trajectory
    stroke(col);
    strokeWeight(this.r);
    strokeCap(ROUND);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
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