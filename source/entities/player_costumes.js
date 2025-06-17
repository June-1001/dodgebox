//--------------------//
// 코스튬 전용 색깔 맵 //
//--------------------//

// 유령 코스튬 색깔 맵
let costume_ghost_colors = [];

// 50개의 색깔 인덱스 만들기
function generate_costume_ghost_colors(steps) {
  let colors = [];
  let i;
  for (i = 0; i < steps; i++) {
    let t = i / (steps - 1);
    let alpha = Math.sin(t * Math.PI);
    let rgba = "rgba(200, 200, 255, " + (alpha * 0.7).toFixed(3) + ")";
    colors.push(rgba);
  }
  return colors;
}
costume_ghost_colors = generate_costume_ghost_colors(50);

// 무지개 코스튬 색깔 맵
const costume_rainbow_colors = [];

const rainbow_length = 36;
for (let i = 0; i < rainbow_length; i++) {
  let hue = (i * 360) / rainbow_length;
  costume_rainbow_colors.push(`hsl(${hue}, 80%, 65%)`);
}

//---------------------------//
// 여기에 플레이어 코스튬 추가 //
//---------------------------//

export const player_costumes = {
  0: {
    unlocked: true,
    name: "기본 코스튬",
    description: "기본 코스튬",
    color: "rgba(255,255,255,1)",
    shadow_color: "rgba(255,255,255,0.3)",
    radius: 18,
    speed: 9,

    draw: function (ctx, x, y, radius) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
  },

  1: {
    unlocked: false,
    unlockable: true,
    name: "빨강",
    description: "이동 속도가 3배 빨라집니다",
    color: "rgba(255, 50, 50, 1)",
    shadow_color: "rgba(255, 50, 50, 0.7)",
    radius: 18,
    speed: 27,

    draw: function (ctx, x, y, radius) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
  },

  2: {
    unlocked: false,
    unlockable: false,
    name: "황금",
    description: "100,000 코인 이상<br>획득 시 해금",
    description_unlocked: "기본 획득 점수가<br>초당 500점으로 증가합니다",
    color: "rgb(255, 215, 0)",
    shadow_color: "rgba(255, 215, 0, 0.8)",
    radius: 18,
    speed: 9,

    draw: function (ctx, x, y, radius) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
  },

  3: {
    unlocked: false,
    unlockable: false,
    name: "백색왜성",
    description: "한 게임에서<br>200,000점 이상<br>획득 시 해금",
    description_unlocked: "크기가 더 작아집니다",
    color: "rgb(255, 255, 255)",
    shadow_color: "rgb(255, 255, 255)",
    radius: 12,
    speed: 9,

    draw: function (ctx, x, y, radius) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.shadow_color;
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
  },

  4: {
    unlocked: false,
    unlockable: false,
    name: "유령",
    description: "한 게임에서<br>200명 이상의<br>적 처치 시 해금",
    description_unlocked: "적과 충돌 시 30% 확률로<br>1초동안 무적 상태가 됩니다",
    color: "rgba(200, 200, 255, 0.5)",
    shadow_color: "rgba(200, 200, 255, 0.1)",
    color_index: 0,
    radius: 18,
    speed: 9,

    draw: function (ctx, x, y, radius) {
      this.color_index = (this.color_index + 1) % costume_ghost_colors.length;
      let current_color = costume_ghost_colors[this.color_index];

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = current_color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = current_color;
      ctx.fill();
      ctx.restore();
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      let trail_color_index = (this.color_index + 1) % costume_ghost_colors.length;
      let trail_color = costume_ghost_colors[trail_color_index];

      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.shadowColor = trail_color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = trail_color;
      ctx.fill();
      ctx.restore();
    },
  },

  5: {
    unlocked: false,
    unlockable: false,
    name: "무지개",
    description: "한 게임에서<br>300,000점 이상<br>획득 시 해금",
    description_unlocked: "총알 발사 속도가<br>2배로 빨라집니다",
    color: "rgba(231, 52, 52, 1)",
    shadow_color: "rgba(231, 52, 52, 0.3)",
    color_index: 0,
    radius: 18,
    speed: 9,

    draw: function (ctx, x, y, radius) {
      this.color_index = (this.color_index + 1) % costume_rainbow_colors.length;
      const current_color = costume_rainbow_colors[this.color_index];

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = current_color.replace("1", "0.3");
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = current_color;
      ctx.fill();
      ctx.restore();

      this.color =
        costume_rainbow_colors[Math.floor(Math.random() * costume_rainbow_colors.length)];
      this.shadow_color = this.color.replace("1", "0.5");
    },

    trail_draw: function (ctx, x, y, radius, alpha) {
      const trail_color_index = (this.color_index + 1) % costume_rainbow_colors.length;
      const trail_color = costume_rainbow_colors[trail_color_index];

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = trail_color.replace("0.9", "0.1");
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = trail_color;
      ctx.fill();
      ctx.restore();
    },
  },
};
