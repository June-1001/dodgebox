import { game_container } from "../main.js";
import { reset_keys } from "./input.js";

//-----------------//
// 게임 캔버스 설정 //
//-----------------//

export const game_area_width = 900;
export const game_area_height = 720;
export const game_update_rate = 20;

export const my_game_area = {
  canvas: document.createElement("canvas"),
  context: null,
  start: function () {
    this.canvas.width = game_area_width;
    this.canvas.height = game_area_height;
    this.context = this.canvas.getContext("2d");
    if (!this.canvas.parentElement) {
      game_container.appendChild(this.canvas);
    }
  },
  clear: function () {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },
};

//-----------------//
// 게임 활성화 제어 //
//-----------------//

export let is_game_active = true;

export function pause_game(game_update_interval_id, video_element) {
  clearInterval(game_update_interval_id);
  if (video_element) {
    video_element.pause();
  }
  is_game_active = false;
}

export function resume_game(start_update_callback, game_running, video_element) {
  if (!is_game_active && game_running) {
    start_update_callback();
    if (video_element) {
      video_element.play();
    }
    is_game_active = true;
    reset_keys();
  }
}
