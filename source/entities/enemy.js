import { game_area_width, game_area_height, my_game_area } from "../core/game_core.js";
import { get_difficulty, get_score } from "../core/game_state.js";

//------------------//
// 적 전용 무지개 맵 //
//------------------//

export const rainbow_colors = [
  "rgba(231, 52, 52, 1)",
  "rgba(230, 130, 34, 1)",
  "rgba(241, 196, 15, 1)",
  "rgba(39, 174, 96,1)",
  "rgba(0, 180, 170, 1)",
  "rgba(80, 130, 255, 1)",
  "rgba(155, 89, 182, 1)",
];

//----------//
// 적 클래스 //
//----------//

export class Opponent {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.speed_up = get_score() / 300000;

    this.dx = Math.sign(Math.random() - 0.5) * ((Math.random() * this.width) / 15 + this.speed_up);
    this.dy = Math.sign(Math.random() - 0.5) * ((Math.random() * this.height) / 15 + this.speed_up);
    this.color_index = Math.floor(Math.random() * rainbow_colors.length);

    this.hp = Math.floor(1 + get_difficulty());
    this.max_hp = this.hp;
  }

  move() {
    const next_x = this.x + this.dx;
    const next_y = this.y + this.dy;
    if (next_x > game_area_width - this.width || next_x < 0) {
      this.dx = -Math.sign(this.dx) * ((Math.random() * this.width) / 15 + this.speed_up);
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    if (next_y > game_area_height - this.height || next_y < 0) {
      this.dy = -Math.sign(this.dy) * ((Math.random() * this.height) / 15 + this.speed_up);
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    this.x += this.dx;
    this.y += this.dy;
  }

  update() {
    const ctx = my_game_area.context;
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = rainbow_colors[this.color_index];
    ctx.shadowBlur = 15;
    ctx.fillStyle = rainbow_colors[this.color_index];
    ctx.fillRect(this.x, this.y, this.width, this.height);

    if (this.hp < this.max_hp) {
      const health_percent = this.hp / this.max_hp;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(this.x, this.y - 10, this.width, 5);

      ctx.fillStyle = health_percent > 0.6 ? "lime" : health_percent > 0.3 ? "yellow" : "red";
      ctx.fillRect(this.x, this.y - 10, this.width * health_percent, 5);
    }

    ctx.restore();
  }
}
