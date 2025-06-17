//-------------//
// 키 입력 설정 //
//-------------//

export const keys = {
  arrow_up: false,
  arrow_down: false,
  arrow_left: false,
  arrow_right: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

export let cursor_x = 0;
export let cursor_y = 0;

export function init_input(game_container) {
  // 대문자 입력 시 소문자로 변환 (WASD)
  function handle_key_down(event) {
    if (keys.hasOwnProperty(event.key.toLowerCase())) {
      keys[event.key.toLowerCase()] = true;
    }
  }
  function handle_key_up(event) {
    if (keys.hasOwnProperty(event.key.toLowerCase())) {
      keys[event.key.toLowerCase()] = false;
    }
  }

  document.addEventListener("keydown", handle_key_down);
  document.addEventListener("keyup", handle_key_up);

  // 마우스 좌표 감지
  game_container.addEventListener("mousemove", (e) => {
    const rect = game_container.getBoundingClientRect();
    cursor_x = e.clientX - rect.left;
    cursor_y = e.clientY - rect.top;
  });
}

export function reset_keys() {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
}
