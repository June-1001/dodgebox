## 게임 플로우차트

![Dodgebox Flowchart](dodgebox_flowchart.png)


## 프로젝트 파일 트리

```text
Dodgebox_game
 ┣ assets
 ┃ ┣ crosshair_source.txt
 ┃ ┣ cross_aim.png
 ┃ ┣ galaxy_loop_pixabay.mp4
 ┃ ┗ video_source.txt
 ┣ source
 ┃ ┣ core
 ┃ ┃ ┣ game_core.js
 ┃ ┃ ┣ game_state.js
 ┃ ┃ ┗ input.js
 ┃ ┣ entities
 ┃ ┃ ┣ bullet.js
 ┃ ┃ ┣ enemy.js
 ┃ ┃ ┣ player.js
 ┃ ┃ ┗ player_costumes.js
 ┃ ┣ systems
 ┃ ┃ ┣ bullet_system.js
 ┃ ┃ ┣ costume_system.js
 ┃ ┃ ┣ shop_system.js
 ┃ ┃ ┗ spawn_system.js
 ┃ ┣ UI
 ┃ ┃ ┗ game_ui.js
 ┃ ┗ main.js
 ┣ styles
 ┃ ┗ main.css
 ┣ dodgebox.js
 ┗ dodgebox_game.html
