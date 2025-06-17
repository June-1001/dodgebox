import { update_coin_display, shop_items_container, coin_display } from "../UI/game_ui.js";
import { get_coins_from_score } from "../core/game_state.js";
import {
  set_bullet_power,
  set_bullet_speed,
  set_bullet_interval,
  set_max_ricochet,
  set_max_pierce,
} from "../entities/bullet.js";
import { display_check_all } from "../UI/game_ui.js";

//----------//
// 코인 획득 //
//----------//

export let coins = 0;
export let kill_reward = 10;

export function set_kill_reward(value) {
  kill_reward = value;
}
export function get_kill_reward() {
  return kill_reward;
}

export function add_coins(amount) {
  coins += amount;
  save_shop_data();
}

//-------------------------------//
// 상점 업그레이드 가격 및 효과 맵 //
//-------------------------------//

const bullet_power_costs = [10, 50, 150, 300, 500, 800, 1200, 2000, 3000, 5000];
const bullet_speed_costs = [5, 10, 20, 30, 45, 70, 100, 150, 200, 300];
const fire_rate_costs = [30, 100, 300, 700, 1200, 2000, 3500, 5500, 7500, 10000];
const ricochet_costs = [100, 500, 1500, 3000, 5000];
const kill_reward_costs = [25, 50, 150, 250, 500, 1000, 1500, 2500, 4000, 6000];
const pierce_costs = [100, 250, 500, 1500, 3000];

const bullet_power_values = [1, 2, 3.5, 5.5, 8, 12, 18, 25, 35, 45, 60];
const bullet_speed_values = [10, 14, 18, 22, 26, 30];
const fire_rate_values = [600, 560, 520, 480, 440, 400, 360, 320, 280, 240, 200];
const ricochet_values = [0, 1, 2, 3, 4, 5];
const kill_reward_values = [10, 50, 100, 170, 250, 350, 450, 550, 700, 850, 1000];
const pierce_values = [0, 1, 2, 3, 4, 5];

//-----------------------------//
// 상점 업그레이드를 총알에 적용 //
//-----------------------------//

export const shop_items = {
  bullet_power: {
    name: "Bullet Power",
    max_level: 10,
    current_level: 0,
    get_cost: () => bullet_power_costs[shop_items.bullet_power.current_level],
    effect: () => set_bullet_power(bullet_power_values[shop_items.bullet_power.current_level]),
  },
  bullet_speed: {
    name: "Bullet Speed",
    max_level: 5,
    current_level: 0,
    get_cost: () => bullet_speed_costs[shop_items.bullet_speed.current_level],
    effect: () => set_bullet_speed(bullet_speed_values[shop_items.bullet_speed.current_level]),
  },
  fire_rate: {
    name: "Fire Rate",
    max_level: 10,
    current_level: 0,
    get_cost: () => fire_rate_costs[shop_items.fire_rate.current_level],
    effect: () => set_bullet_interval(fire_rate_values[shop_items.fire_rate.current_level]),
  },
  ricochet: {
    name: "Ricochet",
    max_level: 5,
    current_level: 0,
    get_cost: () => ricochet_costs[shop_items.ricochet.current_level],
    effect: () => set_max_ricochet(ricochet_values[shop_items.ricochet.current_level]),
  },
  pierce: {
    name: "Pierce",
    max_level: 5,
    current_level: 0,
    get_cost: () => pierce_costs[shop_items.pierce.current_level],
    effect: () => set_max_pierce(pierce_values[shop_items.pierce.current_level]),
  },
  kill_reward: {
    name: "Kill Reward",
    max_level: 10,
    current_level: 0,
    get_cost: () => kill_reward_costs[shop_items.kill_reward.current_level],
    effect: () => set_kill_reward(kill_reward_values[shop_items.kill_reward.current_level]),
  },
};

//--------------------------------------------------------//
// 상점 아이템이 전부 MAX일 때 코스튬 기능 해금 메시지 띄우기 //
//--------------------------------------------------------//

export let all_maxed = false;

const costume_notice = document.getElementById("costume_notice");
export let notice_seen = false;

function show_costume_notice() {
  if (!notice_seen && all_maxed) {
    costume_notice.style.display = "block";
    notice_seen = true;
    save_shop_data();
    setTimeout(function () {
      costume_notice.style.display = "none";
    }, 3000);
  }
}

export function check_all_shop_items_maxed() {
  let all_maxed_now = true;
  for (let item of Object.values(shop_items)) {
    if (item.current_level < item.max_level) {
      all_maxed_now = false;
      break;
    }
  }

  if (all_maxed_now && !all_maxed) {
    all_maxed = true;
    show_costume_notice();
    display_check_all(all_maxed);
    save_shop_data();
  }
}

//-----------------------------------//
// 상점 아이템 목록마다 상점 UI에 추가 //
//-----------------------------------//

export function update_shop_display() {
  update_coin_display(coins, get_coins_from_score());
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

    if (item.current_level >= item.max_level) {
      item.current_level = item.max_level;
    }

    shop_items_container.appendChild(item_element);
  }

  document.querySelectorAll(".buy_button").forEach(function (button) {
    button.addEventListener("click", function () {
      const item_key = this.getAttribute("data-item");
      buy_upgrade(item_key);
      check_all_shop_items_maxed();
    });
  });
}

//-----------------//
// 상점  업그레이드 //
//-----------------//

function get_item_effect_description(key) {
  const item = shop_items[key];
  const level = item.current_level;
  if (level === item.max_level) {
    switch (key) {
      case "bullet_power":
        return `총알 공격력 MAX<br>${bullet_power_values[level]}`;
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

export function buy_upgrade(item_key) {
  const item = shop_items[item_key];
  const cost = item.get_cost();

  if (coins >= cost && item.current_level < item.max_level) {
    coins -= cost;
    item.current_level++;
    item.effect();
    update_shop_display();
    save_shop_data();
  }
}

export function update_coins_based_on_score() {
  update_coin_display(coins, get_coins_from_score());
}

//-------------------------//
// 게임 데이터 세이브 / 로드 //
//-------------------------//

// 세이브할 데이터 목록
// 코인, 코스튬 기능 해금 여부, 상점 업그레이드
export function save_shop_data() {
  const save_data = {
    coins,
    notice_seen,
    all_maxed,
    shop_items: {},
  };

  for (const key in shop_items) {
    save_data.shop_items[key] = {
      current_level: shop_items[key].current_level,
    };
  }

  localStorage.setItem("dodgebox_save", JSON.stringify(save_data));
}

export function load_shop_data() {
  const saved_data = localStorage.getItem("dodgebox_save");
  if (saved_data) {
    const data = JSON.parse(saved_data);
    coins = data.coins || 0;

    notice_seen = !!data.notice_seen;
    all_maxed = !!data.all_maxed;

    for (const key in shop_items) {
      if (data.shop_items && data.shop_items[key]) {
        shop_items[key].current_level = data.shop_items[key].current_level;
        shop_items[key].effect();
      }
    }
  }

  update_shop_display();
  check_all_shop_items_maxed();
}

// 테스트용 리셋 함수
export function reset_shop_data() {
  coins = 0;
  notice_seen = false;
  all_maxed = false;

  for (let key in shop_items) {
    shop_items[key].current_level = 0;
    shop_items[key].effect();
  }
}
