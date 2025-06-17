import { game_area_width, game_area_height, my_game_area } from "../core/game_core.js";
import { player } from "./player.js";

//-----------------//
// 총알 초기 값 설정 //
//-----------------//

export let bullet_power = 1;
export let bullet_speed = 10;
export let bullet_size = 6;
export let bullet_interval = 1000;
export let can_ricochet = false;
export let max_ricochet = 0;
export let max_pierce = 0;

export function set_bullet_power(value) {
  bullet_power = value;
}
export function set_bullet_speed(value) {
  bullet_speed = value;
}
export function set_bullet_interval(value) {
  bullet_interval = value;
}
export function set_max_ricochet(value) {
  max_ricochet = value;
  can_ricochet = max_ricochet > 0;
}
export function set_max_pierce(value) {
  max_pierce = value;
}

//------------//
// 총알 클래스 //
//------------//

export class Bullet {
  constructor(x, y, target_x, target_y) {
    this.x = x;
    this.y = y;
    this.target_x = target_x;
    this.target_y = target_y;
    this.speed = bullet_speed;
    this.size = bullet_size;
    this.damage = bullet_power;
    this.ricochet_count = max_ricochet;
    this.pierce_count = max_pierce;
    this.color = player.color;
    this.shadow_color = player.shadow_color;

    const dx = target_x - x;
    const dy = target_y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.dx = dx / distance;
    this.dy = dy / distance;

    this.angle = Math.atan2(dy, dx);
    this.hit_angles = new Map();
  }

  update() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    const ctx = my_game_area.context;
    if (!ctx) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.shadow_color;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  //-------------//
  // 벽 충돌 감지 //
  //-------------//

  is_out_of_bounds() {
    return this.x < 0 || this.x > game_area_width || this.y < 0 || this.y > game_area_height;
  }
}
