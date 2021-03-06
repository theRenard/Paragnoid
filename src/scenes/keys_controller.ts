import { Scene } from 'phaser';
import Game from '~/scenes/game';
import WEAPON_PLAYER_TYPES from '~/sprites/player/weapons_player_types.json';
import eventManager from '~/emitters/event-manager';
import debug from '~/utils/debug';
import Sound from '~/scenes/sound';

type VirtualJoystickPlugin = Phaser.Plugins.BasePlugin & {
  add: (Scene, any) => VirtualJoystickPlugin;
  on: (event: string, callback: Function, context: Scene) => VirtualJoystickPlugin;
  createCursorKeys: () => Phaser.Types.Input.Keyboard.CursorKeys;
}

let aPressed = false;
let xPressed = false;
let bPressed = false;
let l2Pressed = false;

export default class KeysController extends Scene {
  private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joyStick!: VirtualJoystickPlugin;
  private joyStickKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    [key: string]: Phaser.Input.Keyboard.Key;
  }

  private gameInstance!: Game;
  constructor() {
    super({
      key: 'keys-controller',
      active: false,
    });
  }

  create() {
    this.gameInstance = this.scene.get('game') as Game;

    const plugin = this.plugins.get('rexVirtualJoystick') as VirtualJoystickPlugin;
    this.joyStick = plugin.add(this, {
      x: -200,
      y: -200,
      radius: 0,
      // base: this.add.circle(0, 0, 100, 0x888888),
      // thumb: this.add.circle(0, 0, 50, 0xcccccc),
      // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
      // forceMin: 16,
      enable: true
    });
    // scene.sys.game.device.os.desktop

    // assegna comandi
    this.cursor = this.input.keyboard.createCursorKeys();
    this.joyStickKeys = this.joyStick.createCursorKeys();
    this.keys = {
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      zero: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
      z: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      m: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      n: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
      l: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      k: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      j: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  update() {

    const { player, playerWeaponsGroup } = this.gameInstance;
    const { speed } = player;
    const duration = WEAPON_PLAYER_TYPES[player.weapon].LEVELS[player.level].DURATION
    const up = this.cursor.up?.isDown || this.input.gamepad?.pad1?.leftStick.y < 0 || this.keys.w?.isDown;
    const right = this.cursor.right?.isDown || this.input.gamepad?.pad1?.leftStick.x > 0 || this.keys.d?.isDown;
    const down = this.cursor.down?.isDown || this.input.gamepad?.pad1?.leftStick.y > 0 || this.keys.s?.isDown;
    const left = this.cursor.left?.isDown || this.input.gamepad?.pad1?.leftStick.x < 0 || this.keys.a?.isDown;
    const prevWeapon = Phaser.Input.Keyboard.JustDown(this.keys.k) || this.input.gamepad?.pad1?.B && !bPressed;
    const nextWeapon = Phaser.Input.Keyboard.JustDown(this.keys.l) || this.input.gamepad?.pad1?.X && !xPressed;
    const shortFireWeapon = WEAPON_PLAYER_TYPES[player.weapon].LEVELS[player.level].DURATION === -1;
    const fire = Phaser.Input.Keyboard.JustDown(this.keys.space) || this.input.gamepad?.pad1?.A && !aPressed;
    const longFire = Phaser.Input.Keyboard.DownDuration(this.keys.space, duration) || this.input.gamepad?.pad1?.A;
    const shield = Phaser.Input.Keyboard.DownDuration(this.keys.z, 10000) || this.input.gamepad?.pad1?.L2;
    // ACCELERAZIONE E ANIMAZIONE ORIZONTALE
    if (left) {
      player.setAccelerationX(-speed);
    } else if (right) {
      player.setAccelerationX(speed);
    }

    // ACCELERAZIONE E ANIMAZIONE VERTICALE
    if (up) {
      player.setAccelerationY(-speed);
    } else if (down) {
      player.setAccelerationY(speed);
    }

    if (!up && !down && !left && !right) {
      player.setAccelerationY(0);
      player.setAccelerationX(0);
    }

    // TASTI AUMENTO DIMINUZIONE LIVELLO ARMI PER DEBUG
    if (Phaser.Input.Keyboard.JustDown(this.keys.m) && debug) {
      player.increaseLevelWeapon();

    } else if (Phaser.Input.Keyboard.JustDown(this.keys.n) && debug) {
      player.decreaseLevelWeapon();
    }


    if (prevWeapon) {
      player.prevWeapon();
      bPressed = true;
    }

    if (nextWeapon) {
      player.nextWeapon();
      xPressed = true;
    }

    if (shield && !l2Pressed) {
      player.shieldUp();
      l2Pressed = true;
    }

    if (!shield && l2Pressed) {
      player.shieldDown();
      l2Pressed = false;
    }

    //  PLAYER SHOOT FUNCTION
    if (shortFireWeapon) {

      if (fire) {
        playerWeaponsGroup.fire(player.fireXposition, player.fireYposition, player.weapon, player.level);
        aPressed = true;
      }

    } else {

      if (longFire) {
          playerWeaponsGroup.fire(player.fireXposition, player.fireYposition, player.weapon, player.level);
        }

    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.one) && debug) {
      eventManager.emit('sky-is-over');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.two) && debug) {
      eventManager.emit('space-is-over');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.zero)) {
      const soundScene = this.scene.get('sound') as Sound;
      soundScene.sound.mute = !soundScene.sound.mute;
      console.log('Sound is on', !soundScene.sound.mute);
    }

    // reset pressed state at the end of update cycle
    if (!this.input.gamepad?.pad1?.A) aPressed = false;
    if (!this.input.gamepad?.pad1?.B) bPressed = false;
    if (!this.input.gamepad?.pad1?.X) xPressed = false;
  }
}

