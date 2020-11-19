import * as C from '~/constants.json';
import { KEYS, DIRECTIONS } from '~/globals';
import { SPACECRAFT } from '~/constants.json';

import Game from '../scenes/game';
import { Scene } from 'phaser';


type VirtualJoystickPlugin = Phaser.Plugins.BasePlugin & {
  add: (Scene, any) => VirtualJoystickPlugin;
  on: (event: string, callback: Function, context: Scene) => VirtualJoystickPlugin;
  createCursorKeys: () => Phaser.Types.Input.Keyboard.CursorKeys;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  public cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  public joyStick!: VirtualJoystickPlugin;
  public joyStickKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  public spaceKey!: Phaser.Input.Keyboard.Key;
  public MKey!: Phaser.Input.Keyboard.Key;
  public NKey!: Phaser.Input.Keyboard.Key;
  public VelocityX = 0;
  public VelocityY = 0;
  private lastHorizontalKeyPressed: KEYS.LEFT | KEYS.RIGHT | null = null;
  private lastVerticalKeyPressed: KEYS.UP | KEYS.DOWN | null = null;
  public PlayerLevel = 2;
  public provaangolo!: Phaser.GameObjects.DynamicBitmapText;

  constructor(scene: Game, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);


    scene.anims.create({
      key: DIRECTIONS.GO_RIGHT,
      frames: scene.anims.generateFrameNumbers(SPACECRAFT, {
        start: 0,
        end: 6
      }),
      frameRate: 20
    });

    scene.anims.create({
      key: DIRECTIONS.GO_LEFT,
      frames: scene.anims.generateFrameNumbers(SPACECRAFT, {
        start: 28,
        end: 35
      }),
      frameRate: 20
    })

    scene.anims.create({
      key: DIRECTIONS.GO_UP,
      frames: scene.anims.generateFrameNumbers(SPACECRAFT, {
        start: 14,
        end: 20
      }),
      frameRate: 20
    });

    scene.anims.create({
      key: DIRECTIONS.GO_DOWN,
      frames: scene.anims.generateFrameNumbers(SPACECRAFT, {
        start: 7,
        end: 13
      }),
      frameRate: 20
    });

    scene.anims.create({
      key: DIRECTIONS.STOP,
      frames: scene.anims.generateFrameNumbers(SPACECRAFT, {
        start: 21,
        end: 27
      }),
      frameRate: 20
    });


    const plugin = this.scene.plugins.get('rexVirtualJoystick') as VirtualJoystickPlugin;
    this.joyStick = plugin.add(this.scene, {
      x: 100,
      y: 500,
      radius: 70,
      // base: this.add.circle(0, 0, 100, 0x888888),
      // thumb: this.add.circle(0, 0, 50, 0xcccccc),
      // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
      // forceMin: 16,
      enable: true
    });
    // scene.sys.game.device.os.desktop

    // assegna comandi
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.joyStickKeys = this.joyStick.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.MKey =this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.NKey =this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
  }

 kill() {
    this.body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0);
  }

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);

    const scene = this.scene as Game;

    const up = this.cursor.up?.isDown || this.joyStickKeys.up?.isDown;
    const right = this.cursor.right?.isDown || this.joyStickKeys.right?.isDown;
    const down = this.cursor.down?.isDown || this.joyStickKeys.down?.isDown;
    const left = this.cursor.left?.isDown || this.joyStickKeys.left?.isDown;

    // ACCELERAZIONE E ANIMAZIONE ORIZONTALE
    if (left) {
      this.VelocityX -= C.SPACECRAFT_ACC_X_DELTA;
      this.anims.play(DIRECTIONS.GO_LEFT, true);
      this.lastHorizontalKeyPressed = KEYS.LEFT;
    } else if (right) {
      this.VelocityX += C.SPACECRAFT_ACC_X_DELTA;
      this.play(DIRECTIONS.GO_RIGHT, true);
      this.lastHorizontalKeyPressed = KEYS.RIGHT;
    }

    // ACCELERAZIONE E ANIMAZIONE VERTICALE
    if (up) {
      this.VelocityY -= C.SPACECRAFT_ACC_Y_DELTA;
      this.play(DIRECTIONS.GO_UP, true);
      this.lastVerticalKeyPressed = KEYS.UP;
    } else if (down) {
      this.VelocityY += C.SPACECRAFT_ACC_Y_DELTA;
      this.play(DIRECTIONS.GO_DOWN, true);
      this.lastVerticalKeyPressed = KEYS.DOWN;
    }

    if (!up && !down && !left && !right) {
      this.play(DIRECTIONS.STOP, true);
    }

    // DECELERAZIONE ORIZONTALE
    if (this.lastHorizontalKeyPressed === KEYS.RIGHT && this.VelocityX > 0 && !right) {
      this.VelocityX -= C.SPACECRAFT_DEC_X_DELTA;
    }

    if (this.lastHorizontalKeyPressed === KEYS.LEFT && this.VelocityX < 0 && !left) {
      this.VelocityX += C.SPACECRAFT_DEC_X_DELTA;
    }

    // DECELERAZIONE VERTICALE
    if (this.lastVerticalKeyPressed === KEYS.DOWN && this.VelocityY > 0 && !down) {
      this.VelocityY -= C.SPACECRAFT_DEC_Y_DELTA;
    }

    if (this.lastVerticalKeyPressed === KEYS.UP && this.VelocityY < 0 && !up) {
      this.VelocityY += C.SPACECRAFT_DEC_Y_DELTA;
    }

    // SPOSTAMENTO SPRITE
    scene.player.setVelocityX(this.VelocityX);
    scene.player.setVelocityY(this.VelocityY);

    // TASTI AUMENTO DIMINUZIONE LIVELLO PER DEBUG
    if (Phaser.Input.Keyboard.JustDown(this.MKey) && scene.playerWeaponsGroup){
      this.PlayerLevel += 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.NKey) && scene.playerWeaponsGroup) {
      this.PlayerLevel -= 1;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && scene.playerWeaponsGroup) {
      if (this.PlayerLevel === 1 || this.PlayerLevel == 0) {
        scene.PlayerWeapon1Level1Group.fireBulletPlayer(scene.player.x, scene.player.y, 0);
        //this.provaangolo = this.scene.add.dynamicBitmapText(200, 200, C.PV_FONT_NAME, 'Livello:'+ this.PlayerLevel, 14 );
      } else if (this.PlayerLevel === 2){
        //this.provaangolo = this.scene.add.dynamicBitmapText(200, 200, C.PV_FONT_NAME, 'Livello:'+ this.PlayerLevel, 14 );
        scene.PlayerWeapon1Level2Group.fireBulletPlayer(scene.player.x, scene.player.y, -15);
        scene.PlayerWeapon1Level3Group.fireBulletPlayer(scene.player.x, scene.player.y, 15);
      } else if (this.PlayerLevel === 3){
        //this.provaangolo = this.scene.add.dynamicBitmapText(200, 200, C.PV_FONT_NAME, 'Livello:'+ this.PlayerLevel, 14 );
        scene.PlayerWeapon1Level1Group.fireBulletPlayer(scene.player.x, scene.player.y, 0); 
        scene.PlayerWeapon1Level2Group.fireBulletPlayer(scene.player.x, scene.player.y, -15);
        scene.PlayerWeapon1Level3Group.fireBulletPlayer(scene.player.x, scene.player.y, 15);
      } else if (this.PlayerLevel === 4) {
        scene.PlayerWeapon1Level1Group.fireBulletPlayer(scene.player.x, scene.player.y+30, 0); 
        scene.PlayerWeapon1Level2Group.fireBulletPlayer(scene.player.x, scene.player.y, 0);
        scene.PlayerWeapon1Level3Group.fireBulletPlayer(scene.player.x, scene.player.y-30, 0);
      } else {
        scene.PlayerWeapon1Level1Group.fireBulletPlayer(scene.player.x, scene.player.y, 0);
      }
      
      
    }
  }
}
