import { player_costumes } from "../entities/player_costumes.js";

//--------------------------------//
// 코스튬 기능 창 UI HTML 생성 함수 //
//--------------------------------//

export function update_costume_display(player) {
  let container = document.getElementById("costume_container");
  container.innerHTML = "";

  for (let id in player_costumes) {
    let costume = player_costumes[id];
    let wrapper = document.createElement("div");
    wrapper.className = "costume_wrapper";
    wrapper.setAttribute("data-id", id);

    if (!costume.unlocked) {
      if (costume.unlockable) {
        wrapper.classList.add("unlockable");
      } else {
        wrapper.classList.add("disabled");
      }
    }

    let name_element = document.createElement("div");
    name_element.className = "costume_name";
    name_element.textContent = costume.name;

    if (Number(id) === player.current_costume) {
      wrapper.classList.add("selected");
      name_element.textContent += " (적용중)";
    }

    wrapper.addEventListener("click", function () {
      if (!costume.unlocked) {
        if (costume.unlockable) {
          costume.unlocked = true;
          wrapper.classList.remove("unlockable");
          wrapper.classList.remove("disabled");

          if (costume.description_unlocked) {
            description_element.innerHTML = costume.description_unlocked;
            start_animation_loop();
          }
        } else {
          return;
        }
      }

      player.set_costume(Number(id));

      let all_wrappers = container.querySelectorAll(".costume_wrapper");
      for (let w of all_wrappers) {
        w.classList.remove("selected");

        let name_div = w.querySelector(".costume_name");
        if (name_div) {
          name_div.textContent = name_div.textContent.replace(" (적용중)", "");
        }
      }

      wrapper.classList.add("selected");
      name_element.textContent = costume.name + " (적용중)";
    });

    let canvas = document.createElement("canvas");
    canvas.className = "costume_canvas";
    canvas.width = 100;
    canvas.height = 100;

    let ctx = canvas.getContext("2d");

    function start_animation_loop() {
      let last_time = 0;
      let frame_interval = 20;

      function draw_loop(time) {
        if (time - last_time >= frame_interval) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          costume.draw(ctx, canvas.width / 2, canvas.height / 2, 20);
          last_time = time;
        }
        requestAnimationFrame(draw_loop);
      }
      requestAnimationFrame(draw_loop);
    }

    if (costume.unlocked) {
      start_animation_loop();
    } else {
      costume.draw(ctx, canvas.width / 2, canvas.height / 2, 20);
    }

    let spacer = document.createElement("div");
    spacer.className = "costume_spacer";

    let description_element = document.createElement("div");
    description_element.className = "costume_description";
    if (costume.unlocked && costume.description_unlocked) {
      description_element.innerHTML = costume.description_unlocked;
    } else {
      description_element.innerHTML = costume.description;
    }

    wrapper.appendChild(canvas);
    wrapper.appendChild(spacer);
    wrapper.appendChild(name_element);
    wrapper.appendChild(description_element);

    container.appendChild(wrapper);
  }
}

//------------//
// 코스튬 해금 //
//------------//

export function update_costume_unlocks(score, coins, obs_counter) {
  let unlocked_any = false;

  if (coins >= 100000 && !player_costumes[2].unlocked) {
    player_costumes[2].unlockable = true;
    unlocked_any = true;
  }

  if (score >= 200000 && !player_costumes[3].unlocked) {
    player_costumes[3].unlockable = true;
    unlocked_any = true;
  }

  if (obs_counter >= 200 && !player_costumes[4].unlocked) {
    player_costumes[4].unlockable = true;
    unlocked_any = true;
  }

  if (score >= 300000 && !player_costumes[5].unlocked) {
    player_costumes[5].unlockable = true;
    unlocked_any = true;
  }

  if (unlocked_any) {
    save_costume_data();
  }
}

//-------------------//
// 코스튬 세이브 로드 //
//-------------------//

export function save_costume_data() {
  let costume_save_data = {};
  for (let id in player_costumes) {
    costume_save_data[id] = {
      unlocked: player_costumes[id].unlocked,
      unlockable: player_costumes[id].unlockable,
    };
  }
  localStorage.setItem("dodgebox_costume_save", JSON.stringify(costume_save_data));
}

export function load_costume_data() {
  let saved_data = localStorage.getItem("dodgebox_costume_save");
  if (saved_data) {
    let data = JSON.parse(saved_data);
    for (let id in player_costumes) {
      if (data[id]) {
        player_costumes[id].unlocked = data[id].unlocked;
        player_costumes[id].unlockable = data[id].unlockable;
      }
    }
  }
}

//---------//
// 테스트용 //
//---------//

// 리셋
export function reset_costume_data() {
  for (let id in player_costumes) {
    if (player_costumes[id]) {
      if (id === "0") {
        player_costumes[id].unlocked = true;
        player_costumes[id].unlockable = true;
      } else if (id === "1") {
        player_costumes[id].unlocked = false;
        player_costumes[id].unlockable = true;
      } else {
        player_costumes[id].unlocked = false;
        player_costumes[id].unlockable = false;
      }
    }
  }
}

// 모든 코스튬 해금
export function unlock_all_costumes() {
  for (let id in player_costumes) {
    player_costumes[id].unlockable = true;
  }
  save_costume_data();
}
