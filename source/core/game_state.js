//----------------------------------//
// 게임 시작, 점수, 난이도, 코인 상태 //
//----------------------------------//

export let game_running = false;
export let score = 0;
export let score_counter = 0;
export let difficulty = 0;
export let coins_from_score = 0;
export let highscore = 0;

// 게임 진행 상태 설정
export function set_game_running(value) {
  game_running = value;
}

// 재시작 시 스코어 리셋
export function reset_score() {
  score = 0;
  score_counter = 0;
  coins_from_score = 0;
}

// 시간이 지나면서 기본 점수 획득
export function increase_score(number) {
  score_counter++;
  if (score_counter >= 5) {
    score += number;
    score_counter = 0;
    update_coins_from_score();
  }
}

// 적 처치 시 점수 획득 및 코인 추가
export function add_score(amount) {
  score += amount;
  update_coins_from_score();
}

// 점수에 따라서 코인 획득 (점수 / 10)
function update_coins_from_score() {
  const new_coins_from_score = Math.floor(score / 10);
  if (new_coins_from_score > coins_from_score) {
    coins_from_score = new_coins_from_score;
  }
}

// 재시작 시 difficulty 리셋
export function reset_difficulty() {
  difficulty = 0;
}

// 업데이트 시 difficulty 1씩 증가
export function increase_difficulty() {
  difficulty += 1;
}

export function get_score() {
  return score;
}

export function get_highscore() {
  return highscore;
}

export function get_difficulty() {
  return difficulty;
}

export function get_coins_from_score() {
  return coins_from_score;
}

export function set_highscore() {
  if (highscore < score) {
    highscore = score;
  }
}

export function set_highscore_value(value) {
  highscore = value;
}
