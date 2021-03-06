import { Scene } from "phaser";
import Game from '~/scenes/game';
import { LEFT_KILL_ZONE, RIGHT_KILL_ZONE, RIGHT_SPAWN_ZONE, TOP_KILL_ZONE, BOTTOM_KILL_ZONE } from '~/utils/spawn_kill_areas';
import { POWERUPS, FLARES } from '~/configurations/images.json';
import eventManager from '~/emitters/event-manager';

export enum PowerUpTypes {
  ENERGY         = 'ENERGY',
  UPGRADE_WEAPON = 'UPGRADE_WEAPON',
}

const powerUpColors = {
  [PowerUpTypes.ENERGY]: 'blue',
  [PowerUpTypes.UPGRADE_WEAPON]: 'red',
  __WEAPON: 'yellow',
}

const powerUpTextures = {
  [PowerUpTypes.ENERGY]: 'energy.png',
  [PowerUpTypes.UPGRADE_WEAPON]: 'nuclear.png',
  __WEAPON: 'yellow',
}

export type PowerUpType = keyof typeof PowerUpTypes;

export class Powerup extends Phaser.Physics.Arcade.Sprite {
  private path?: { t: number, vec: Phaser.Math.Vector2 };
  private curve?: Phaser.Curves.Spline | null;
  private tween?: Phaser.Tweens.Tween | null;
  private points?: number[];
  private flares!: Phaser.GameObjects.Particles.ParticleEmitter;
  public powerUpType!: PowerUpType;
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, POWERUPS);
  }

  make(type: PowerUpType) {
    // RESET PREVIOUS PATH
    this.curve = null;
    this.tween = null;
    this.setDepth(1);

    // SET POWERUP TYPE
    this.powerUpType = type;
    this.setFrame(powerUpTextures[this.powerUpType]);

    // POSITION
    const y = Phaser.Math.Between(0, this.scene.scale.height);
    const x = this.scene.scale.width + 100;
    this.setOrigin(0.5, 0.5);
    this.body.reset(x, y);

    // DIRECTION
    this.path = { t: 0, vec: new Phaser.Math.Vector2() };
    this.points = [
      RIGHT_SPAWN_ZONE, Phaser.Math.Between(200, 400),
      Phaser.Math.Between(200, 1000), Phaser.Math.Between(200, 400),
      Phaser.Math.Between(200, 1000), Phaser.Math.Between(200, 400),
      Phaser.Math.Between(200, 1000), Phaser.Math.Between(200, 400),
      Phaser.Math.Between(200, 1000), LEFT_KILL_ZONE
    ];
    this.curve = new Phaser.Curves.Spline(this.points);
    this.tween = this.scene.tweens.add({
      targets: this.path,
      t: 1,
      duration: 10000,
      repeat: 0
    });

    // BEHAVIOR
    this.body.immovable = true;
    this.body.enable = true;
    this.setActive(true);
    this.setVisible(true);

    // PARTICLES
    this.flares = this.scene.add.particles(FLARES).setDepth(0).createEmitter({
      frame: powerUpColors[type],
      x: 200,
      y: 300,
      alpha: 0.3,
      lifespan: 500,
      speed: { min: -100, max: 100 },
      scale: { start: 0.4, end: 0 },
      quantity: 2,
      blendMode: 'ADD',
      on: true,
    });
  }

  kill() {
    eventManager.emit('play-BONUS');
    this.body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0);
    this.flares.explode(20, this.x, this.y);
  }

	preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.path && this.curve) {
      this.curve.getPoint(this.path.t, this.path.vec);
      const { x, y } = this.path.vec;
      this.x = x;
      this.y = y;
    }

    this.rotation += 0.0012 * delta

    this.flares.setPosition(this.x, this.y);

    if (this.x < LEFT_KILL_ZONE
      || this.x > RIGHT_KILL_ZONE
      || this.y < TOP_KILL_ZONE
      || this.y > BOTTOM_KILL_ZONE) {
        this.kill();
		}
	}

}

export default class Powerups extends Phaser.Physics.Arcade.Group {
  constructor(scene: Scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      frameQuantity: 5,
      key: POWERUPS,
      setXY: {x: -100, y: -100},
      setScale: {x: 0.4, y: 0.4},
      active: false,
      visible: false,
      classType: Powerup
    });

  }

  energy() {
    const powerup = this.getFirstDead(false) as Powerup;
    if (powerup) powerup.make(PowerUpTypes.ENERGY);
  }

  upgradeWeapon() {
    const powerup = this.getFirstDead(false) as Powerup;
    if (powerup) powerup.make(PowerUpTypes.UPGRADE_WEAPON);
  }

}
