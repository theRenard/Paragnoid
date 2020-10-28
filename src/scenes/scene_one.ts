import {
  Physics,
  Scene
} from 'phaser';

export default class SceneOne extends Scene {
  player;
  cursor;
  constructor() {
    super('scene-one')
  }
  preload() {
    this.load.spritesheet ('spacecraft', "assets/spacecraft.png", {frameWidth: 50, frameHeight: 50});

  }
  create() {

    this.player = this.physics.add.sprite (100, 450, "spacecraft");
    this.player.setCollideWorldBounds (true);

    this.anims.create ({
      key: "goright",
      frames: this.anims.generateFrameNumbers ("spacecraft", {start: 0, end: 7}),
      frameRate: 20
    });

    this.anims.create ({
      key: "goleft",
      frames: this.anims.generateFrameNumbers("spacecraft", { start: 0, end: 7 }),
      frameRate: 20
    })
    this.anims.create({
      key: "goup",
      frames: this.anims.generateFrameNumbers("spacecraft", {
        start: 0,
        end: 7
      }),
      frameRate: 20
    });
    this.anims.create({
      key: "godown",
      frames: this.anims.generateFrameNumbers("spacecraft", {
        start: 0,
        end: 7
      }),
      frameRate: 20
    });

    this.cursor = this.input.keyboard.createCursorKeys();

  }

  update() {

    this.player.setVelocity(0);

    if (this.cursor.left.isDown) {
      this.player.setVelocityX (-160);
      this.player.anims.play ("goleft", true);
      }

      else if (this.cursor.right.isDown) {
        this.player.setVelocityX (160);
        this.player.anims.play ("goright", true);
      }

      else if (this.cursor.up.isDown) {
        this.player.setVelocityY (-160);
        this.player.anims.play ("goup", true);
      }

      //else {
        //this.player.setVelocityY (160);
        //this.player.anims.play ("godown", true);
      }
   }
}