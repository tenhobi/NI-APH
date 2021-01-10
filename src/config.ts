import * as ECS from '../libs/pixi-ecs';

class Config {
    static SCENE_WIDTH: number = 15;
    static TEXTURE_WIDTH: number = 16;
    static TEXTURE_HEIGHT: number = 16;
    static TEXTURE_SCALE: number = Config.SCENE_WIDTH / ((Config.TEXTURE_WIDTH - 1) * Config.TEXTURE_WIDTH);

    static SAFE_DESTROY: number = 1500;

    static BOMB_TIMEOUT: number = 2500;
    static BOMB_TIMEOUT_DEVIATION: number = 500;
    static BOMB_FLAME_LIVING_TIME: number = 300;
    static BOMB_DEFAULT_COUNT: number = 1;
    static BOMB_POWER: number = 1;

    static PLAYER_SPEED: number = 0.005;
    static PLAYERS_COUNT: number = 3;

    static PIXEL_EDGE: number = 0.07;

    static KEY_UP = ECS.Keys.KEY_UP;
    static KEY_RIGHT = ECS.Keys.KEY_RIGHT;
    static KEY_DOWN = ECS.Keys.KEY_DOWN;
    static KEY_LEFT = ECS.Keys.KEY_LEFT;
    static KEY_BOMB = ECS.Keys.KEY_SPACE;

    static KEY2_UP = ECS.Keys.KEY_W;
    static KEY2_RIGHT = ECS.Keys.KEY_D;
    static KEY2_DOWN = ECS.Keys.KEY_S;
    static KEY2_LEFT = ECS.Keys.KEY_A;
    static KEY2_BOMB = ECS.Keys.KEY_G;

    static TEXT_TITLE = "BOMBER F*ING MAN";
    static TEXT_PLAYERS = "Počet lidských hráčů";
    static TEXT_PST = "Pravděpodobnost krabic";
    static TEXT_ENTER_GAME = "Stiskněte ENTER";
    static TEXT_WINNER = "Výherce poslední hry";
}

export {
    Config,
}
