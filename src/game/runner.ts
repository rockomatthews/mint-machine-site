import type PhaserType from "phaser";

type Callbacks = {
  onScore?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
};

type Options = {
  seed: string;
  width: number;
  height: number;
};

function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function createRunnerGame(
  Phaser: typeof PhaserType,
  mountEl: HTMLElement,
  opts: Options,
  cb: Callbacks
) {
  const rand = mulberry32(hash32(opts.seed));

  const ASSET_BASE = "/game/assets/platformer-pack-industrial/Spritesheet";

  class RunnerScene extends Phaser.Scene {
    score = 0;
    startedAt = 0;
    // Start easier; ramp up over time.
    speed = 210;
    player!: Phaser.Physics.Arcade.Sprite;
    ground!: Phaser.Physics.Arcade.StaticGroup;
    obstacles!: Phaser.Physics.Arcade.Group;
    coins!: Phaser.Physics.Arcade.Group;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    preload() {
      this.load.atlasXML(
        "industrial",
        `${ASSET_BASE}/platformIndustrial_sheet.png`,
        `${ASSET_BASE}/platformIndustrial_sheet.xml`
      );
      // Our logo as the player piece (mirrored)
      this.load.image("mm_logo", "/logo.png");
      // New coin sprite
      this.load.image("washington_coin", "/washingtoncoin.png");
    }

    create() {
      this.startedAt = this.time.now;

      // background
      this.cameras.main.setBackgroundColor(0x141517);

      // ground
      this.ground = this.physics.add.staticGroup();
      const tile = "platformIndustrial_001.png";
      const groundY = opts.height - 48;
      for (let x = 0; x < opts.width + 80; x += 70) {
        const g = this.ground.create(x, groundY, "industrial", tile);
        g.setOrigin(0, 0.5);
        g.refreshBody();
      }

      // player (mirrored logo)
      // Spawn a bit higher so jumps clear early obstacles (logo sprite is visually tall)
      this.player = this.physics.add.sprite(140, groundY - 120, "mm_logo");
      this.player.setFlipX(true);
      this.player.setScale(0.18);
      this.player.setCollideWorldBounds(true);
      this.player.setBounce(0);
      this.player.setDepth(2);

      // tighten hitbox to feel fair
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.player.width * 0.58, this.player.height * 0.52, true);
      // Nudge hitbox up slightly
      body.setOffset(body.offset.x, body.offset.y - this.player.height * 0.05);

      this.physics.add.collider(this.player, this.ground);

      // groups
      this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
      this.coins = this.physics.add.group({ allowGravity: false, immovable: true });

      this.spawnObstacle();

      this.physics.add.overlap(this.player, this.obstacles, () => {
        this.gameOver();
      });

      this.physics.add.overlap(this.player, this.coins, (_p, c) => {
        c.destroy();
        this.score += 35;
        cb.onScore?.(this.score);
      });

      this.cursors = this.input.keyboard?.createCursorKeys() as any;

      // tap/click jump
      this.input.on("pointerdown", () => this.tryJump());

      // spawn timer (start easy, ramp)
      this.time.addEvent({
        delay: 1100,
        loop: true,
        callback: () => {
          if (this.isGameOver) return;

          const elapsedS = (this.time.now - this.startedAt) / 1000;
          const obstacleP = Math.min(0.78, 0.42 + elapsedS * 0.006); // ramps over time
          const coinP = Math.max(0.28, 0.48 - elapsedS * 0.003);

          if (rand() < obstacleP) this.spawnObstacle();
          if (rand() < coinP) this.spawnCoin();

          this.speed = Math.min(520, this.speed + 2);
        },
      });

      // score timer
      this.time.addEvent({
        delay: 120,
        loop: true,
        callback: () => {
          if (this.isGameOver) return;
          this.score += 2;
          cb.onScore?.(this.score);
        },
      });
    }

    isGameOver = false;

    tryJump() {
      if (this.isGameOver) return;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.down || body.touching.down) {
        this.player.setVelocityY(-620);
      }
    }

    spawnObstacle() {
      const key = rand() < 0.5 ? "platformIndustrial_045.png" : "platformIndustrial_051.png";
      const y = opts.height - 48 - 35;
      const o = this.obstacles.create(opts.width + 80, y, "industrial", key) as Phaser.Physics.Arcade.Sprite;
      o.setOrigin(0.5, 0.5);
      o.setScale(0.9);
      o.setVelocityX(-this.speed);
      o.setDepth(2);
    }

    spawnCoin() {
      const y = opts.height - 48 - 140 - rand() * 110;

      // Use washington coin sprite (pretty, branded)
      const c = this.coins.create(opts.width + 80, y, "washington_coin") as Phaser.Physics.Arcade.Sprite;
      c.setScale(0.12);
      c.setVelocityX(-this.speed);
      c.setDepth(3);

      // Slight bob/rotation for juice
      this.tweens.add({
        targets: c,
        y: y - 10,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.tweens.add({
        targets: c,
        angle: 360,
        duration: 1200,
        repeat: -1,
      });
    }

    update() {
      if (this.isGameOver) return;

      if (this.cursors?.space?.isDown || this.cursors?.up?.isDown) {
        this.tryJump();
      }

      // cleanup
      for (const o of this.obstacles.getChildren() as Phaser.GameObjects.GameObject[]) {
        const s: any = o;
        if (s.x < -120) s.destroy();
      }
      for (const c of this.coins.getChildren() as Phaser.GameObjects.GameObject[]) {
        const s: any = c;
        if (s.x < -120) s.destroy();
      }
    }

    gameOver() {
      this.isGameOver = true;
      this.physics.pause();
      this.player.setTint(0xff3355);
      cb.onGameOver?.(this.score);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: mountEl,
    width: opts.width,
    height: opts.height,
    backgroundColor: "#141517",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 1100 },
        debug: false,
      },
    },
    scene: [RunnerScene],
  });

  return game;
}
