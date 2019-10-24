var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var player;
var haunch;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('sky', 'assets/bettersky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('haunch', 'assets/haunch.png');
  this.load.image('bomb', 'assets/bomb.png', { frameWidth: 10, frameHeight: 26 });
  this.load.spritesheet('dino', 'assets/dino.png', { frameWidth: 24, frameHeight: 24 });
}

function create ()
{
  //  A simple background for our game
  this.add.image(400, 300, 'sky');

  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.(the original sprite is 400x32 in size)
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  // creating the ledges
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // The player and its settings
  player = this.physics.add.sprite(100, 450, 'dino').setScale(2);

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
      key: 'turn',
      frames: [ { key: 'dino', frame: 0 } ],
      frameRate: 20
  });

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('dino', { start: 14, end: 16 }),
      frameRate: 10,
      repeat: -1
  });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('dino', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dino', { start: 17, end: 23 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dino', { start: 17, end: 23 }),
      frameRate: 10,
      repeat: -1
  });

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  //  Some haunches to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  haunches = this.physics.add.group({
      key: 'haunch',
      repeat: 4,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  haunches.children.iterate(function (child) {

      //  Give each haunch a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  });

  bombs = this.physics.add.group();

  //  The score
  scoreText = this.add.text(16, 16, 'Haunches Eaten: 0', { fontSize: '24px', fill: '#000' });

  //  Collide the player and the haunches with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(haunches, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the haunches, if he does call the collectHaunch function
  this.physics.add.overlap(player, haunches, collectHaunch, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
  if (gameOver)
  {
      return;
  }

  if (cursors.left.isDown)
  {
      player.flipX = true
      
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
      player.flipX = false

      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('idle');
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
      player.setVelocityY(-330);
  }
}

function collectHaunch (player, haunch)
{
  haunch.disableBody(true, true);

  //  Add and update the score
  score += 1;
  scoreText.setText('Haunches Eaten: ' + score);

  if (haunches.countActive(true) === 0)
  {
      //  A new set of haunches to collect
      haunches.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;

  }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('death');

  gameOver = true;
}
