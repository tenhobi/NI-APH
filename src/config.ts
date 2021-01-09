import * as ECS from '../libs/pixi-ecs';

class Config {
    static SCENE_WIDTH: number = 15;
    static TEXTURE_WIDTH: number = 16;
    static TEXTURE_HEIGHT: number = 16;
    static TEXTURE_SCALE: number = Config.SCENE_WIDTH / ((Config.TEXTURE_WIDTH - 1) * Config.TEXTURE_WIDTH);

    static BREAKABLE_WALLS_CHANCE: number = 0;

    static BOMB_TIMEOUT: number = 2500;
    static BOMB_TIMEOUT_DEVIATION: number = 500;
    static BOMB_FLAME_LIVING_TIME: number = 300;

    static PLAYER_SPEED: number = 0.005;

    static PLAYER_UP = ECS.Keys.KEY_UP;
    static PLAYER_RIGHT = ECS.Keys.KEY_RIGHT;
    static PLAYER_DOWN = ECS.Keys.KEY_DOWN;
    static PLAYER_LEFT = ECS.Keys.KEY_LEFT;
    static PLAYER_BOMB = ECS.Keys.KEY_SPACE;
}

export {
    Config,
}
