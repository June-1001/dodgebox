import { init_input } from "./core/input.js";
import { game_update_rate, my_game_area, pause_game, resume_game } from "./core/game_core.js";
import {
  game_running,
  set_game_running,
  reset_score,
  increase_score,
  get_score,
  get_highscore,
  set_highscore,
  set_highscore_value,
  reset_difficulty,
  get_coins_from_score,
} from "./core/game_state.js";
import {
  game_container,
  start_btn,
  comment_start,
  comment_restart,
  score_display,
  center_overlay,
  video,
  shop_button,
  shop_modal,
  help_button,
  help_modal,
  costume_button,
  costume_modal,
  is_block,
  show_div,
  init_ui_event_listeners,
  update_game_over_display,
  display_check_all,
} from "./UI/game_ui.js";
import { player } from "./entities/player.js";
import {
  obstacles,
  update_spawn_timers,
  reset_spawn_system,
  update_floating_texts,
  add_floating_text,
  obs_counter,
} from "./systems/spawn_system.js";
import { bullets, update_bullets, fire_bullet, reset_bullets } from "./systems/bullet_system.js";
import {
  coins,
  update_shop_display,
  update_coins_based_on_score,
  add_coins,
  all_maxed,
  load_shop_data,
  save_shop_data,
} from "./systems/shop_system.js";
import {
  update_costume_display,
  update_costume_unlocks,
  save_costume_data,
  load_costume_data,
} from "./systems/costume_system.js";

//--------------------//
// 게임 전체 흐름 제어 //
//--------------------//

export { game_container };

let game_update_interval_id;

init_input(game_container);

//------------------//
// 모든 모달 창 닫기 //
//------------------//

function close_all_modal() {
  shop_modal.style.display = "none";
  help_modal.style.display = "none";
  costume_modal.style.display = "none";
}

//-------------------------------------//
// 게임 버튼 별 이벤트 함수 - UI에서 콜백 //
//-------------------------------------//

init_ui_event_listeners(
  start_game,
  restart_game,
  function (event) {
    switch (event.target) {
      case shop_button: {
        shop_modal.style.display = "block";
        help_modal.style.display = "none";
        costume_modal.style.display = "none";
        update_shop_display();
        break;
      }
      case help_button: {
        shop_modal.style.display = "none";
        help_modal.style.display = "block";
        costume_modal.style.display = "none";
        break;
      }
      case costume_button: {
        shop_modal.style.display = "none";
        help_modal.style.display = "none";
        costume_modal.style.display = "block";
        update_costume_display(player);
        break;
      }
    }
  },
  close_all_modal
);

//-------------//
// 키 입력 제어 //
//-------------//

document.addEventListener("keydown", function (event) {
  if (event.code !== "Space") {
    return;
  }
  if (is_block(start_btn)) {
    event.preventDefault();
    start_game();
    return;
  }
  if (is_block(center_overlay)) {
    event.preventDefault();
    restart_game();
    return;
  }
});

//----------------------------------------//
// 게임 화면에 포커스 없을 때 게임 잠시 멈춤 //
//----------------------------------------//

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    pause_game(game_update_interval_id, video);
  } else {
    resume_game(start_game_update_loop, game_running, video);
  }
});

window.addEventListener("blur", function () {
  pause_game(game_update_interval_id, video);
});
window.addEventListener("focus", function () {
  resume_game(start_game_update_loop, game_running, video);
});

function start_game_update_loop() {
  clearInterval(game_update_interval_id);
  game_update_interval_id = setInterval(update_game_area, game_update_rate);
}

//----------//
// 게임 시작 //
//----------//

function start_game() {
  clearInterval(game_update_interval_id);

  start_btn.style.display = "none";
  center_overlay.style.display = "none";

  display_check_all(all_maxed);
  close_all_modal();

  reset_spawn_system();
  player.reset_starting_point();
  player.reset_trail();
  reset_bullets();
  reset_score();
  reset_difficulty();
  set_game_running(true);

  score_display.textContent = `점수: ${get_score()}`;
  my_game_area.start();

  video.style.display = "block";
  video.play();

  start_game_update_loop();
}

//--------------//
// 게임 업데이트 //
//--------------//

function update_game_area() {
  my_game_area.clear();

  if (!game_running) return;

  if (player.current_costume === 2) {
    increase_score(50);
  } else {
    increase_score(1);
  }

  score_display.textContent = `점수: ${get_score()}`;
  update_coins_based_on_score();

  player.move();
  player.update();

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].move();
    obstacles[i].update();
  }

  update_spawn_timers();
  update_costume_unlocks(get_score(), coins, obs_counter);

  fire_bullet();
  update_bullets();

  update_floating_texts();

  check_collisions();
}

//----------------------------------------------//
// 플레이어와 적 충돌 감지 - 적과 충돌 시 게임 오버 //
//----------------------------------------------//

let collision_disabled = false;

function check_collisions() {
  if (collision_disabled) {
    return;
  }

  const costume = player.costumes[player.current_costume];
  const radius = costume.radius;
  const ghost_check = Math.random() * 10;

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const closest_x = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
    const closest_y = Math.max(obs.y, Math.min(player.y, obs.y + obs.height));
    const distance_x = player.x - closest_x;
    const distance_y = player.y - closest_y;

    if (Math.sqrt(distance_x * distance_x + distance_y * distance_y) < radius) {
      if (player.current_costume === 4 && ghost_check < 3) {
        add_floating_text(player.x, player.y, "무적");

        collision_disabled = true;

        setTimeout(function () {
          collision_disabled = false;
        }, 1000);
        return;
      }
      game_over();
    }
  }
}

//-----------------------------//
// 게임 오버 시 리셋할 것들 목록 //
//-----------------------------//

function game_over() {
  set_game_running(false);
  center_overlay.style.display = "block";
  score_display.textContent = "";
  set_highscore();
  update_game_over_display(get_score(), get_highscore(), get_coins_from_score());
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
  clearInterval(game_update_interval_id);
  add_coins(get_coins_from_score());
  update_costume_unlocks(get_score(), coins, obs_counter);
  my_game_area.clear();
  reset_spawn_system();
  player.reset_trail();
  reset_bullets();
  reset_score();
  reset_difficulty();
  save_game_data();
}

//----------------------------------//
// 게임 재시작 시 메인 메뉴로 돌아가기 //
//----------------------------------//

function restart_game() {
  center_overlay.style.display = "none";
  start_btn.style.display = "block";
  score_display.textContent = "";
  set_game_running(false);
  video.pause();
  video.style.display = "none";
  display_check_all(all_maxed);
}

//-----------------//
// 게임 세이브 로드 //
//-----------------//

function save_game_data() {
  // 상점
  save_shop_data();
  // 코스튬
  save_costume_data();
  // 현재 코스튬
  localStorage.setItem("current_costume", player.current_costume);
  // 최고 점수
  localStorage.setItem("highscore", get_highscore());
}

function load_game_data() {
  load_shop_data();
  load_costume_data();

  let saved_costume = localStorage.getItem("current_costume");
  if (saved_costume !== null) {
    player.current_costume = parseInt(saved_costume);
  }

  let saved_highscore = localStorage.getItem("highscore");
  if (saved_highscore !== null) {
    set_highscore_value(parseInt(saved_highscore));
  }
}

//-----------------------------//
// 최초 로딩 시 상점 데이터 로딩 //
//-----------------------------//

window.addEventListener("load", () => {
  load_game_data();
  display_check_all(all_maxed);
});

//--------------------//
// 종료 시 자동 세이브 //
//--------------------//

window.addEventListener("beforeunload", function () {
  save_game_data();
});

//---------//
// 테스트용 //
//---------//

// import { reset_shop_data } from "./systems/shop_system.js";
// import { reset_costume_data} from "./systems/costume_system.js";

// function reset_data() {
//   reset_shop_data();
//   update_shop_display();
//   reset_costume_data();
//   update_costume_display(player);
//   display_check_all(all_maxed);
//   save_game_data();
// }

// reset_data();

// add_coins(100000);

// import {unlock_all_costumes } from "./systems/costume_system.js";
// unlock_all_costumes();
