import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import * as C from '~/constants.json';
import { Scene } from 'phaser';
import { PlayerWeapon, EnemyWeapon } from '~/sprites_and_groups/weapon';
import WeaponGroup from '~/sprites_and_groups/weaponGroup';
import Enemies from '~/sprites_and_groups/enemies';
import Player from '~/sprites_and_groups/player';
import Explosions from '~/sprites_and_groups/explosions';
import playerEnemyCollision from '~/colliders/handlerPlayerEnemyCollisions';
import missileEnemyCollision from '~/colliders/handlerMissileEnemyCollisions';
import Timeline from '~/game_timeline/timeline';
import Lives from '../sprites_and_groups/Lives';
import ENEMY_TYPES from '~/sprites_and_groups/enemy_types.json';
import WEAPON_ENEMY_TYPES from '~/sprites_and_groups/weapons_enemy_types.json';
import ENEMY_PATHS from '~/sprites_and_groups/enemy_paths.json';

type EnemyType = keyof typeof ENEMY_TYPES;
type WeaponEnemyType = keyof typeof WEAPON_ENEMY_TYPES;
type PathTypes = keyof typeof ENEMY_PATHS;

export default class Game extends Scene {
  public player!: Player;
  public enemies!: Enemies;
  public playerWeaponsGroup!: WeaponGroup;
  public enemyWeaponsGroup!: WeaponGroup;
  public PlayerWeapon1Level1Group!: WeaponGroup;
  public PlayerWeapon1Level2Group!: WeaponGroup;
  public PlayerWeapon1Level3Group!: WeaponGroup;
  public PlayerWeapon1Level4Group!: WeaponGroup;
  public explosions!: Explosions;
  public colliderPlayerEnemy!: Phaser.Physics.Arcade.Collider;
  public colliderPlayerWeapons!: Phaser.Physics.Arcade.Collider;
  public colliderEnemyWeapons!: Phaser.Physics.Arcade.Collider;
  public colliderEnemyWeapons1Lvl1!: Phaser.Physics.Arcade.Collider;
  public colliderEnemyWeapons1Lvl2!: Phaser.Physics.Arcade.Collider;
  public colliderEnemyWeapons1Lvl3!: Phaser.Physics.Arcade.Collider;
  public colliderEnemyWeapons1Lvl4!: Phaser.Physics.Arcade.Collider;
  public score = 0;
  public scoreText!: Phaser.GameObjects.DynamicBitmapText;
  public lives!: Lives;
  private timeline!: Timeline;

  constructor() {
    super({
      key: 'game',
      active: false,
    });
  }

  preload() {
    this.load.plugin('rexVirtualJoystick', VirtualJoystickPlugin, true);
    this.load.spritesheet(C.SPACECRAFT, C.SPACECRAFT_ASSET_PATH, {
      frameWidth: 50,
      frameHeight: 22
    });
    this.load.spritesheet(C.EXPLOSION, C.EXPLOSION_ASSET_PATH, {
      frameWidth: 60,
      frameHeight: 60
    });

    // Carica tutti gli sprite di Enemies
    Object.keys(ENEMY_TYPES).forEach((E) => {
      const ENEMY = E as EnemyType;
      this.load.image(ENEMY_TYPES[ENEMY].TEXTURE_NAME, ENEMY_TYPES[ENEMY].SPRITE_ASSET_PATH);
    });

    // Carica tutti gli sprite e i suoni di Weapons
    Object.keys(WEAPON_ENEMY_TYPES).forEach((W) => {
      const WEAPON = W as WeaponEnemyType;
      this.load.image(WEAPON_ENEMY_TYPES[WEAPON].TEXTURE_NAME, WEAPON_ENEMY_TYPES[WEAPON].SPRITE_ASSET_PATH);
      this.load.audio(WEAPON_ENEMY_TYPES[WEAPON].AUDIO_NAME, WEAPON_ENEMY_TYPES[WEAPON].AUDIO_ASSET_PATH);
    });

    this.load.bitmapFont(C.PV_FONT_NAME, C.PV_FONT_PATH, C.PV_FONT_XML_PATH);
  }

  create() {

    this.player = new Player(this, 100, this.scale.height / 2, C.SPACECRAFT);
    this.playerWeaponsGroup = new WeaponGroup(this, PlayerWeapon);
    this.enemyWeaponsGroup = new WeaponGroup(this, EnemyWeapon);
    this.PlayerWeapon1Level1Group = new WeaponGroup(this, PlayerWeapon);
    this.PlayerWeapon1Level2Group = new WeaponGroup(this, PlayerWeapon);
    this.PlayerWeapon1Level3Group = new WeaponGroup(this, PlayerWeapon);
    this.PlayerWeapon1Level4Group = new WeaponGroup(this, PlayerWeapon);
    this.enemies = new Enemies(this);
    this.explosions = new Explosions(this, C.EXPLOSION);
    this.timeline = new Timeline(this);

    this.scoreText = this.add.dynamicBitmapText(16, 16, C.PV_FONT_NAME, 'Score: 0', 14 );

    this.lives = new Lives(this, C.SPACECRAFT);

    Object.keys(WEAPON_ENEMY_TYPES).forEach((W) => {
      const WEAPON = W as WeaponEnemyType;
      this.sound.add(WEAPON_ENEMY_TYPES[WEAPON].AUDIO_NAME, {loop: false});
    });

    const handlerPlayerEnemyCollisions = playerEnemyCollision(this) as ArcadePhysicsCallback;
    const handlerMissileEnemyCollisions = missileEnemyCollision(this) as ArcadePhysicsCallback;

    this.colliderPlayerEnemy = this.physics.add.collider(this.player, this.enemies, handlerPlayerEnemyCollisions.bind(this));
    this.colliderPlayerWeapons = this.physics.add.collider(this.player, this.enemyWeaponsGroup, handlerPlayerEnemyCollisions.bind(this));
    this.colliderEnemyWeapons = this.physics.add.collider (this.enemies, this.playerWeaponsGroup, handlerMissileEnemyCollisions.bind(this));
    this.colliderEnemyWeapons1Lvl1 = this.physics.add.collider (this.enemies, this.PlayerWeapon1Level1Group, handlerMissileEnemyCollisions.bind(this));
    this.colliderEnemyWeapons1Lvl2 = this.physics.add.collider (this.enemies, this.PlayerWeapon1Level2Group, handlerMissileEnemyCollisions.bind(this));
    this.colliderEnemyWeapons1Lvl3 = this.physics.add.collider (this.enemies, this.PlayerWeapon1Level3Group, handlerMissileEnemyCollisions.bind(this));
    this.colliderEnemyWeapons1Lvl4 = this.physics.add.collider (this.enemies, this.PlayerWeapon1Level4Group, handlerMissileEnemyCollisions.bind(this));

    // inizia il gioco
    this.timeline.start();

  }

}
