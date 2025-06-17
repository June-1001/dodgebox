import { player } from "../entities/player.js";
import { Bullet, bullet_interval, can_ricochet } from "../entities/bullet.js";
import { game_area_width, game_area_height } from "../core/game_core.js";
import { game_running, add_score } from "../core/game_state.js";
import { obstacles, add_floating_text } from "./spawn_system.js";
import { cursor_x, cursor_y } from "../core/input.js";
import { get_kill_reward } from "./shop_system.js";

export let bullets = [];
let last_bullet_time = 0;

//---------------//
// 총알 충돌 감지 //
//---------------//

function check_bullet_collision(bullet, obstacle) {
  return (
    bullet.x + bullet.size > obstacle.x &&
    bullet.x - bullet.size < obstacle.x + obstacle.width &&
    bullet.y + bullet.size > obstacle.y &&
    bullet.y - bullet.size < obstacle.y + obstacle.height
  );
}

//----------------------------------------//
// 총알 움직임 제어 및 충돌, 도탄, 관통 체크 //
//----------------------------------------//

export function update_bullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.update();

    let hit = false;

    for (let j = obstacles.length - 1; j >= 0; j--) {
      let obs = obstacles[j];

      if (!check_bullet_collision(bullet, obs)) {
        continue;
      }

      let last_angle = bullet.hit_angles.get(obs);
      let already_hit = last_angle !== undefined && Math.abs(last_angle - bullet.angle) < 0.01;

      if (!already_hit) {
        bullet.hit_angles.set(obs, bullet.angle);
        obs.hp -= bullet.damage;
        hit = true;
      }

      if (obs.hp <= 0) {
        const reward = get_kill_reward();
        add_score(reward);
        add_floating_text(obs.x + obs.width / 2, obs.y + obs.height / 2, `+${reward}`);
        obstacles.splice(j, 1);
      }

      if (!already_hit) {
        if (bullet.pierce_count > 0) {
          bullet.pierce_count--;
        } else {
          bullets.splice(i, 1);
          break;
        }
      }
    }

    if (!hit && can_ricochet && bullet.ricochet_count > 0) {
      let bounced = false;
      if (bullet.x < 0 || bullet.x > game_area_width) {
        bullet.dx *= -1;
        bounced = true;
      }
      if (bullet.y < 0 || bullet.y > game_area_height) {
        bullet.dy *= -1;
        bounced = true;
      }
      if (bounced) {
        bullet.ricochet_count--;
      }
    } else if (!hit && bullet.is_out_of_bounds()) {
      bullets.splice(i, 1);
    }
  }
}

//-----------------------//
// 일정 시간마다 총알 발사 //
//-----------------------//

export function fire_bullet() {
  if (!game_running) {
    return;
  }
  if (player.current_costume === 5) {
    if ((Date.now() - last_bullet_time) * 2 < bullet_interval) {
      return;
    }
  } else {
    if (Date.now() - last_bullet_time < bullet_interval) {
      return;
    }
  }

  if (typeof cursor_x !== "number" || typeof cursor_y !== "number") {
    return;
  }

  bullets.push(new Bullet(player.x, player.y, cursor_x, cursor_y));
  last_bullet_time = Date.now();
}

//------------------------//
// 개임 재시작 시 총알 리셋 //
//------------------------//

export function reset_bullets() {
  bullets = [];
  last_bullet_time = 0;
}
