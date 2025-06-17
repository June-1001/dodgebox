//////////////////////
// 화면 및 조작 세팅 //
//////////////////////

const game_container = document.getElementById("game_container");

// 게임 화면 크기
const game_area_width = 900;
const game_area_height = 720;

// 게임 업데이트 주기 (ms)
const game_update_rate = 20;

// 시작 버튼, 다시 시작 버튼
const start_btn = document.getElementById("start_button");
const restart_btn = document.getElementById("restart_button");
start_btn.addEventListener("click", start_game);
restart_btn.addEventListener("click", restart_game);

//메인 화면 및 게임 오버 화면 텍스트
const comment_start = document.getElementById("comment_start");
const comment_restart = document.getElementById("comment_restart");

// 키보드 세팅
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

// 키를 눌렀을 때 true, 뗐을 때 false
function handle_key_down(event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  }
}
function handle_key_up(event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
  }
}
document.addEventListener("keydown", handle_key_down);
document.addEventListener("keyup", handle_key_up);

// 만약 대문자라면 소문자로 변환함
document.addEventListener("keydown", function (e) {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", function (e) {
  keys[e.key.toLowerCase()] = false;
});

let game_update = setInterval(update_game_area, game_update_rate);

// 게임 시작 시 캔버스 세팅
const my_game_area = {
  canvas: document.createElement("canvas"),

  start: function () {
    this.canvas.width = game_area_width;
    this.canvas.height = game_area_height;
    this.context = this.canvas.getContext("2d");
    if (!this.canvas.parentElement) {
      game_container.appendChild(this.canvas);
    }
    game_update = setInterval(update_game_area, game_update_rate);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

///////////////
// 게임 시작 //
///////////////

// 게임이 실행중
let game_running = false;

// 초기 스코어 및 스코어 카운터 0
let score = 0;
let score_counter = 0;

// 화면 하단의 점수 표시
const score_display = document.getElementById("score_display");

// 점수 및 다시 시작 버튼 오버레이
const center_overlay = document.getElementById("center_overlay");

const video = document.getElementById("background_video");

// 게임 시작 시 초기화
function start_game() {
  clearInterval(game_update);

  start_btn.style.display = "none";
  center_overlay.style.display = "none";
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
  show_div(shop_button, start_btn);
  show_div(shop_modal, start_btn);

  obstacles = [];
  spawn_timers = [];
  floating_texts = [];
  player.trail = [];
  score = 0;
  score_counter = 0;
  game_running = true;
  spawn_interval = 1000;
  last_spawn_time = 0;

  score_display.textContent = `점수: ${score}`;
  my_game_area.start();

  video.style.display = "block";
  video.play();
  difficulty = 0;
}

// 게임 화면 업데이트
function update_game_area() {
  my_game_area.clear();
  if (!game_running) return;

  // 게임 업데이트 시마다 스코어 카운터가 올라감
  // 20ms x 5 = 100ms 마다 1점씩 점수가 상승 - 1초에 10점
  score_counter++;
  if (score_counter >= 5) {
    score++;
    score_counter = 0;
    score_display.textContent = `점수: ${score}`;
    update_coins();
  }

  // 플레이어 업데이트
  player.move();
  player.update();

  // 모든 적 업데이트
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].move();
    obstacles[i].update();
  }

  // 스폰 타이머 업데이트
  update_spawn_timers();

  // 총알 발사 및 움직임 업데이트
  fire_bullet();
  update_bullets();

  // 점수 획득 텍스트 업데이트
  update_floating_texts(my_game_area.context);

  // 충돌 감지
  check_collisions();
  check_bullet_collision();
}

////////////////////////
// 게임 오버 및 초기화 //
////////////////////////

// 플레이어와 적의 충돌 감지
function check_collisions() {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const closest_x = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
    const closest_y = Math.max(obs.y, Math.min(player.y, obs.y + obs.height));
    const distance_x = player.x - closest_x;
    const distance_y = player.y - closest_y;

    // 적의 가장 가까운 꼭지점과의 거리가 반지름보다 작을 때 게임 오버
    if (Math.sqrt(distance_x ** 2 + distance_y ** 2) < player.radius) {
      game_over();
      return;
    }
  }
}

// display:block 인지 확인하는 용도의 함수
function is_block(element) {
  return getComputedStyle(element).display === "block";
}

// menu가 display:block이면 div를 표시하고, 아니라면 표시하지 않기
function show_div(div, menu) {
  if (is_block(menu)) {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}

//최종 점수 및 획득 코인 여기에 표시
const final_score_display = document.getElementById("final_score");

// 게임 오버 시 오버레이 표시하고 코인 획득 후 게임 초기화 진행 및 게임 데이터 저장
function game_over() {
  game_running = false;
  center_overlay.style.display = "block";
  score_display.textContent = "";
  final_score_display.innerHTML = `점수: ${score}<br><span style="font-size: 26px; text-shadow: 0 0 8px gold">획득 코인: ${coins_from_score}</span>`;
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
  clearInterval(game_update);
  coins += coins_from_score;
  coins_from_score = 0;
  obstacles = [];
  spawn_timers = [];
  floating_texts = [];
  bullets = [];
  difficulty = 0;
  my_game_area.clear();
  score = 0;
  score_counter = 0;
  spawn_interval = 1000;
  last_bullet_time = 0;
  save_game_data();
}

// 재시작 버튼 누를 시 메인 메뉴 화면 표시
function restart_game() {
  center_overlay.style.display = "none";
  start_btn.style.display = "block";
  score_display.textContent = "";
  game_running = false;
  video.pause();
  video.style.display = "none";
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
  show_div(shop_button, start_btn);
}

// 처음 화면 로딩 시 데이터를 로딩하고 메인 화면 보이기
window.addEventListener("load", () => {
  load_game_data();
  show_div(shop_button, start_btn);
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
});

// 스페이스 바로 게임 시작 및 재시작 가능
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

////////////////////////////////
// 보고있지 않을 때 게임 멈추기 //
////////////////////////////////

// 게임 활성화
let is_game_active = true;

// 게임 멈추기 - 영상 멈춤, 게임 비활성화
function pause_game() {
  clearInterval(game_update);
  video.pause();
  is_game_active = false;
}

// 게임 복귀 - 영상 시작, 게임 활성화
function resume_game() {
  if (!is_game_active && game_running) {
    game_update = setInterval(update_game_area, game_update_rate);
    video.play();
    is_game_active = true;
  }
}

// 게임 화면이 보이지 않거나 해당 화면에 포커스가 없을 때에 게임 멈추고, 돌아오면 다시 시작
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    pause_game();
  } else {
    resume_game();
  }
});

window.addEventListener("blur", function () {
  pause_game();
});
window.addEventListener("focus", function () {
  resume_game();
});

//////////////////
// 플레이어 세팅 //
//////////////////

let player = {
  // 플레이어 최초 생성 위치
  x: game_area_width / 2,
  y: game_area_height / 2,

  // 플레이어 크기
  radius: 15,

  // 플레이어 색
  color: "rgba(255,255,255,0.6)",

  //플레이어 속도
  speed: 9,

  // 움직일 때 플레이어 잔상 생성을 위한 위치 저장용 변수 및 최대 길이
  trail: [],
  max_trail_length: 15,

  move: function () {
    if ((keys.ArrowUp || keys.w) && this.y - this.radius > 0) {
      this.y -= this.speed;
    }
    if ((keys.ArrowDown || keys.s) && this.y + this.radius < game_area_height) {
      this.y += this.speed;
    }
    if ((keys.ArrowLeft || keys.a) && this.x - this.radius > 0) {
      this.x -= this.speed;
    }
    if ((keys.ArrowRight || keys.d) && this.x + this.radius < game_area_width) {
      this.x += this.speed;
    }
  },

  update: function () {
    // 플레이어 그리기
    const ctx = my_game_area.context;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgba(255,255,255,0.3)";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

    // 직전 위치에 플레이어 잔상 생성
    if (this.x !== this.prev_x || this.y !== this.prev_y) {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });

      if (this.trail.length > this.max_trail_length) {
        this.trail.shift();
      }
    }

    // 잔상 그리기
    this.trail.forEach((t, i) => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.shadowColor = "rgba(255,255,255,0.3)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();

      // 잔상이 점점 흐릿해짐
      t.alpha = (i / this.max_trail_length) ** 3;
    });
  },
};

/////////////
// 적 세팅 //
/////////////

let obstacles = [];

// 적의 체력이 difficulty만큼 증가함.
// difficulty는 적이 생성될 때마다 +1씩 증가.
// 스폰 타이머 쪽 참고
let difficulty = 0;

const rainbow_colors = [
  "rgba(231, 52, 52, 0.9)",
  "rgba(230, 130, 34, 0.9)",
  "rgba(241, 196, 15, 0.9)",
  "rgba(39, 174, 96, 0.9)",
  "rgba(0, 180, 170, 0.9)",
  "rgba(80, 130, 255, 0.9)",
  "rgba(155, 89, 182, 0.9)",
];

class Opponent {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    // 점수에 따라서 점점 빨라지는 적들
    this.speed_up = score / 100000;

    // 초기 속도는 랜덤 방향, 3.5 이내의 랜덤 속력
    this.dx = Math.sign(Math.random() - 0.5) * (Math.random() * 3.5 + this.speed_up);
    this.dy = Math.sign(Math.random() - 0.5) * (Math.random() * 3.5 + this.speed_up);
    this.color_index = Math.floor(Math.random() * rainbow_colors.length);

    // 적의 체력이 difficulty만큼 증가함.
    this.hp = Math.floor(1 + difficulty);
    this.max_hp = this.hp;
  }

  move() {
    const next_x = this.x + this.dx;
    const next_y = this.y + this.dy;
    if (next_x > game_area_width - this.width || next_x < 0) {
      // 적이 벽에 부딪힐 때마다 튕기고 속력이 랜덤으로 변함
      this.dx = -Math.sign(this.dx) * (Math.random() * 3.5 + this.speed_up);

      // 벽에 튕길 때마다 무지개 색 차례대로 색깔이 변함
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    if (next_y > game_area_height - this.height || next_y < 0) {
      this.dy = -Math.sign(this.dy) * (Math.random() * 3.5 + this.speed_up);
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    this.x += this.dx;
    this.y += this.dy;
  }

  update() {
    const ctx = my_game_area.context;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = rainbow_colors[this.color_index];
    ctx.shadowBlur = 15;
    ctx.fillStyle = rainbow_colors[this.color_index];
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 적의 HP바 그리기
    if (this.hp < this.max_hp) {
      const health_percent = this.hp / this.max_hp;

      //최대 체력 칸 표시
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(this.x, this.y - 10, this.width, 5);

      // 체력 60% 이상일 때 초록색, 30% 이상일 때 노란색, 그 미만은 빨간색
      ctx.fillStyle = health_percent > 0.6 ? "lime" : health_percent > 0.3 ? "yellow" : "red";
      ctx.fillRect(this.x, this.y - 10, this.width * health_percent, 5);
    }

    ctx.restore();
  }
}

///////////////////
// 적 스폰 시스템 //
///////////////////

let floating_texts = [];

// 특정 위치에 점점 사라지는 텍스트 생성 (점수 표시 등)
function add_floating_text(x, y, text) {
  floating_texts.push({
    x,
    y,
    text,
    opacity: 1,
    life: 50,
  });
}

// 텍스트 그리기
function update_floating_texts(ctx) {
  for (let i = floating_texts.length - 1; i >= 0; i--) {
    const t = floating_texts[i];
    ctx.globalAlpha = t.opacity;
    ctx.font = "bold 20px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgb(255, 255, 255)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    t.y -= 0.5;

    // 투명도 조정 - life 분의 1만큼 점점 흐려지기, 투명도 0 이하로 떨어지면 텍스트 제거
    t.opacity -= 1 / t.life;
    if (t.opacity <= 0) {
      floating_texts.splice(i, 1);
    }
  }
}

// 스폰 타이머
class SpawnTimer {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    // 스폰 진행도
    this.progress = 0;

    // 스폰 타이머의 채워지는 속도
    this.speed = 0.02;
  }

  update() {
    // 다 채워지는 걸 보여주기 위해 1보다 약간 더 크게 설정
    if (this.progress < 1.04) {
      // 스폰 진행도 채우기
      this.progress += this.speed;

      const ctx = my_game_area.context;
      ctx.beginPath();
      // 스폰 진행도만큼 원을 그림
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2 * this.progress);
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.lineWidth = 12;
      ctx.shadowColor = "rgb(255, 0, 0)";
      ctx.shadowBlur = 15;
      ctx.stroke();
    } else {
      // 스폰이 완료되면 적을 생성하고 타이머 삭제
      this.spawn_opponent();
      return true;
    }
    return false;
  }

  spawn_opponent() {
    obstacles.push(
      new Opponent(this.size, this.size, this.x - this.size / 2, this.y - this.size / 2)
    );
    // 적 생성 시 difficulty가 1 증가 - 다음 생성되는 적의 체력에 반영
    difficulty += 1;
  }
}

let spawn_timers = [];
// 적 스폰 간격 - 기본 1초
let spawn_interval = 1000;
let last_spawn_time = 0;

function create_spawn_timer() {
  const size = 30 + Math.random() * 30;
  const x = size + Math.random() * (game_area_width - size * 2);
  const y = size + Math.random() * (game_area_height - size * 2);

  spawn_timers.push(new SpawnTimer(x, y, size));
}

function update_spawn_timers() {
  const now = Date.now();
  if (now - last_spawn_time > spawn_interval && game_running) {
    create_spawn_timer();
    last_spawn_time = now;
    // 스폰 간격이 점수에 비례해서 점점 빨라짐, 최대 0.2초에 한 번 생성
    spawn_interval = Math.max(200, 1000 - score / 50);
  }

  // 스폰 타이머가 true일 때 (스폰 완료 시) 스폰 타이머 제거
  for (let i = spawn_timers.length - 1; i >= 0; i--) {
    if (spawn_timers[i].update()) {
      spawn_timers.splice(i, 1);
    }
  }
}

///////////////////
// 총알 발사 관련 //
///////////////////

let bullets = [];

// 총알 초기 설정

// 기본 총알 공격력
let bullet_power = 1;

// 기본 총알 속도
let bullet_speed = 10;

// 총알 크기
let bullet_size = 6;

// 기본 발사 빈도
let bullet_interval = 1000;
let last_bullet_time = 0;

// 도탄 - 벽 충돌 시 튕김 - 적에게는 효과 없음
let can_ricochet = false;
let ricochet_count = 0;
let max_ricochet = 0;

// 관통 - 적에게 맞을 시 관통 - 벽에는 효과 없음
let max_pierce = 0;
let current_pierce = 0;

class Bullet {
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

    const dx = target_x - x;
    const dy = target_y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.dx = dx / distance;
    this.dy = dy / distance;

    // 각도 저장용 맵 (관통 부분 참고)
    this.angle = Math.atan2(dy, dx);
    this.hit_angles = new Map();
  }

  // 총알 그리기
  update() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    const ctx = my_game_area.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.shadowColor = "rgb(0, 140, 255)";
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 벽 충돌 감지 함수
  wall_collision() {
    return this.x < 0 || this.x > game_area_width || this.y < 0 || this.y > game_area_height;
  }
}

// 적과 총알의 충돌 감지
function check_bullet_collision(bullet, obstacle) {
  return (
    bullet.x + bullet.size > obstacle.x &&
    bullet.x - bullet.size < obstacle.x + obstacle.width &&
    bullet.y + bullet.size > obstacle.y &&
    bullet.y - bullet.size < obstacle.y + obstacle.height
  );
}

function update_bullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.update();

    let hit = false;

    for (let j = obstacles.length - 1; j >= 0; j--) {
      let obs = obstacles[j];

      if (!check_bullet_collision(bullet, obs)) {
        continue;
      }

      // 관통 공격 시 같은 적 중복 공격 방지
      let last_angle = bullet.hit_angles.get(obs);
      let already_hit = last_angle !== undefined && Math.abs(last_angle - bullet.angle) < 0.01;

      if (!already_hit) {
        bullet.hit_angles.set(obs, bullet.angle);
        obs.hp -= bullet.damage;
        hit = true;
      }

      if (obs.hp <= 0) {
        score += kill_reward;
        add_floating_text(obs.x + obs.width / 2, obs.y + obs.height / 2, `+${kill_reward}`);
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

    // 총알이 도탄 가능 횟수만큼 벽에 튕김
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
      // 도탄 횟수 없으면 벽에 부딪힐 때 총알 제거
    } else if (!hit && bullet.wall_collision()) {
      bullets.splice(i, 1);
    }
  }
}

// 커서 위치 좌표 저장용 변수
let cursor_x, cursor_y;

// 마우스 움직일 때 커서 좌표 저장
game_container.addEventListener("mousemove", (e) => {
  const rect = game_container.getBoundingClientRect();
  cursor_x = e.clientX - rect.left;
  cursor_y = e.clientY - rect.top;
});

// 총알 발사
// 마지막으로 발사한 시간과의 차이를 계산
// bullet_interval과 비교
function fire_bullet() {
  if (!game_running) {
    return;
  }

  if (Date.now() - last_bullet_time < bullet_interval) {
    return;
  }
  if (typeof cursor_x !== "number" || typeof cursor_y !== "number") {
    return;
  }

  bullets.push(new Bullet(player.x, player.y, cursor_x, cursor_y));
  last_bullet_time = Date.now();
}

//////////////
// 코인 상점 //
//////////////

// 초기 코인 값 0
let coins = 0;

// 스킬 별 이름, 최대 레벨, 현재 레벨, 가격, 효과
const shop_items = {
  bullet_power: {
    name: "Bullet Power",
    max_level: 10,
    current_level: 0,
    get_cost: () => bullet_power_costs[shop_items.bullet_power.current_level],
    effect: () => {
      bullet_power = bullet_power_values[shop_items.bullet_power.current_level];
    },
  },
  bullet_speed: {
    name: "Bullet Speed",
    max_level: 5,
    current_level: 0,
    get_cost: () => bullet_speed_costs[shop_items.bullet_speed.current_level],
    effect: () => {
      bullet_speed = bullet_speed_values[shop_items.bullet_speed.current_level];
    },
  },
  fire_rate: {
    name: "Fire Rate",
    max_level: 10,
    current_level: 0,
    get_cost: () => fire_rate_costs[shop_items.fire_rate.current_level],
    effect: () => {
      bullet_interval = fire_rate_values[shop_items.fire_rate.current_level];
    },
  },
  ricochet: {
    name: "Ricochet",
    max_level: 5,
    current_level: 0,
    get_cost: () => ricochet_costs[shop_items.ricochet.current_level],
    effect: () => {
      max_ricochet = ricochet_values[shop_items.ricochet.current_level];
      can_ricochet = max_ricochet > 0;
    },
  },
  pierce: {
    name: "Pierce",
    max_level: 5,
    current_level: 0,
    get_cost: () => pierce_costs[shop_items.pierce.current_level],
    effect: () => {
      max_pierce = pierce_values[shop_items.pierce.current_level];
    },
  },
  kill_reward: {
    name: "Kill Reward",
    max_level: 10,
    current_level: 0,
    get_cost: () => kill_reward_costs[shop_items.kill_reward.current_level],
    effect: () => {
      kill_reward = kill_reward_values[shop_items.kill_reward.current_level];
    },
  },
};

//상점 업그레이드 코인 가격 맵
const bullet_power_costs = [10, 50, 150, 300, 500, 800, 1200, 2000, 3000, 5000];
const bullet_speed_costs = [5, 10, 20, 30, 45, 70, 100, 150, 200, 300];
const fire_rate_costs = [30, 100, 300, 700, 1200, 2000, 3500, 5500, 7500, 10000];
const ricochet_costs = [100, 500, 1500, 3000, 5000];
const kill_reward_costs = [25, 50, 150, 250, 500, 1000, 1500, 2500, 4000, 6000];
const pierce_costs = [100, 250, 500, 1500, 3000];

//상점 업그레이드 효과 수치 맵
const bullet_power_values = [1, 2, 3.5, 5.5, 8, 12, 18, 25, 35, 45, 60];
const bullet_speed_values = [10, 14, 18, 22, 26, 30];
const fire_rate_values = [600, 560, 520, 480, 440, 400, 360, 320, 280, 240, 200];
const ricochet_values = [0, 1, 2, 3, 4, 5];
const kill_reward_values = [10, 25, 50, 85, 125, 175, 225, 275, 350, 425, 500];
const pierce_values = [0, 1, 2, 3, 4, 5];

// 상점 UI
const shop_button = document.getElementById("shop_button");
const shop_modal = document.getElementById("shop_modal");
const close_shop_button = document.getElementById("close_shop_button");
const coin_display = document.getElementById("coin_display");
const shop_items_container = document.getElementById("shop_items");

// 스킬 레벨과 코인에 따라 상점 HTML 업데이트
function update_shop_display() {
  coin_display.textContent = coins;
  shop_items_container.innerHTML = "";

  for (const key in shop_items) {
    const item = shop_items[key];
    const level = item.current_level;
    const max_level = item.max_level;
    const is_maxed = level >= max_level;
    const cost = is_maxed ? null : item.get_cost();

    const item_element = document.createElement("div");
    item_element.className = "shop-item";

    item_element.innerHTML = `
      <h3>${item.name}</h3>
      <p>Level: ${level}/${max_level}</p>
      <p>${get_item_effect_description(key)}</p>
      <button class="buy_button" data-item="${key}" 
        ${is_maxed || coins < cost ? "disabled" : ""}>
        ${is_maxed ? "MAXED" : `Upgrade<br>${cost} coins`}
      </button>
    `;

    shop_items_container.appendChild(item_element);
  }

  document.querySelectorAll(".buy_button").forEach(function (button) {
    button.addEventListener("click", function () {
      const item_key = this.getAttribute("data-item");
      buy_upgrade(item_key);
    });
  });
}

// 상점 설명
function get_item_effect_description(key) {
  const item = shop_items[key];
  const level = item.current_level;
  if (level === item.max_level) {
    switch (key) {
      case "bullet_power":
        return `총알 공격력 MAX<br>${bullet_power_values[level]}}`;
      case "bullet_speed":
        return `총알 속도 MAX<br>${bullet_speed_values[level]}`;
      case "fire_rate":
        return `발사 속도 MAX<br>${fire_rate_values[level]}ms`;
      case "ricochet":
        return `도탄 MAX<br>${ricochet_values[level]}`;
      case "pierce":
        return `관통 MAX<br>${pierce_values[level]}`;
      case "kill_reward":
        return `처치 시 점수 MAX<br>${kill_reward_values[level]}`;
      default:
        return "";
    }
  } else {
    switch (key) {
      case "bullet_power":
        return `총알 공격력<br>${bullet_power_values[level]} >> ${bullet_power_values[level + 1]}`;
      case "bullet_speed":
        return `총알 속도<br>${bullet_speed_values[level]} >> ${bullet_speed_values[level + 1]}`;
      case "fire_rate":
        return `발사 속도<br>${fire_rate_values[level]}ms >> ${fire_rate_values[level + 1]}ms`;
      case "ricochet":
        return `도탄<br>${ricochet_values[level]} >> ${ricochet_values[level + 1]}`;
      case "pierce":
        return `적 관통<br>${pierce_values[level]} >> ${pierce_values[level + 1]}`;
      case "kill_reward":
        return `처치 시 점수<br>${kill_reward_values[level]} >> ${kill_reward_values[level + 1]}`;
      default:
        return "";
    }
  }
}

// 상점에서 스킬 구매
// 상품 가격보다 코인이 많으면 구매 가능
function buy_upgrade(item_key) {
  const item = shop_items[item_key];
  const cost = item.get_cost();

  if (coins >= cost && item.current_level < item.max_level) {
    coins -= cost;
    item.current_level++;
    item.effect();
    update_shop_display();
    save_game_data();
  }
}

// 상점 버튼 이벤트
shop_button.addEventListener("click", () => {
  shop_modal.style.display = "block";
  update_shop_display();
});
close_shop_button.addEventListener("click", () => {
  shop_modal.style.display = "none";
});

// 점수에 비례해서 코인 획득 - 점수/10 만큼 코인 획득
let coins_from_score = 0;

function update_coins() {
  const new_coins_from_score = Math.floor(score / 10);

  if (new_coins_from_score > coins_from_score) {
    coins_from_score = new_coins_from_score;
  }

  coin_display.textContent = coins + coins_from_score;
}

// 로컬 스토리지에 상점 (스킬) 데이터 저장
function save_game_data() {
  const save_data = {
    coins,
    shop_items: {},
  };

  for (const key in shop_items) {
    save_data.shop_items[key] = {
      current_level: shop_items[key].current_level,
    };
  }

  localStorage.setItem("dodgebox_save", JSON.stringify(save_data));
}

// 로컬 스토리지에서 상점 (스킬) 데이터 불러오기
function load_game_data() {
  const saved_data = localStorage.getItem("dodgeboxSave");
  if (saved_data) {
    const data = JSON.parse(saved_data);
    coins = data.coins || 0;
    coin_display.textContent = coins;

    for (const key in shop_items) {
      if (data.shop_items && data.shop_items[key]) {
        shop_items[key].current_level = data.shop_items[key].current_level;
        shop_items[key].effect();
      }
    }
  }
}
