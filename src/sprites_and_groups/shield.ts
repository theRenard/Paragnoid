import Game from '~/scenes/game';
import { BLUE_PARTICLE, SPACECRAFT_FRAME_WIDTH, SPACECRAFT_FRAME_HEIGH } from '~/constants.json';

export default class Shield {
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private energy = 0;
  private scene: Game;
  private manager!: Phaser.GameObjects.Particles.ParticleEmitterManager;

  constructor(scene: Game) {
    this.scene = scene;
    this.createShield();
  }

  createShield() {
    this.manager = this.scene.add.particles(BLUE_PARTICLE);
    this.emitter = this.manager
      .createEmitter({
        x: 0,
        y: 0,
        blendMode: 'ADD',
        scale: { start: 0.1, end: 0 },
        speed: { min: -100, max: 100 },
        quantity: 3,
        visible: false,
      })
      .setEmitZone({
        source: new Phaser.Geom.Circle(0, 0, 100),
        type: 'edge',
        quantity: 50,
      });
  }

  get particleQuantity() {
    return this.energy / 10;
  }

  get isUp() {
    return this.energy > 0;
  }

  takeHit(damage: number) {
    console.log(`Shield took hit of: ${damage}`);
    this.energy -= damage;
    this.updateShieldLevel();
    if (this.energy <= 0) this.shieldDown();
  }

  forceShieldUp() {
    this.energy = 300;
    this.updateShieldLevel();
    this.shieldUp();
  }

  shieldUp() {
    this.scene.player.setBodySize(200, 200);
    this.emitter.setVisible(true);
  }

  updateShieldLevel() {
    this.emitter.setQuantity(this.particleQuantity);
  }

  resetShield() {
    this.emitter.setVisible(false);
  }

  shieldDown() {
    this.emitter.setVisible(false);
    this.scene.player.setBodySize(SPACECRAFT_FRAME_WIDTH, SPACECRAFT_FRAME_HEIGH);
  }

  moveShield(x: number, y: number) {
    this.manager.setPosition(x, y);
  }


}