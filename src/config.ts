class Config {
    static SCENE_WIDTH: number = 15;
    static TEXTURE_WIDTH: number = 16;
    static TEXTURE_HEIGHT: number = 16;
    static TEXTURE_SCALE: number = Config.SCENE_WIDTH / ((Config.TEXTURE_WIDTH - 1) * Config.TEXTURE_WIDTH);

    static BREAKABLE_WALLS_CHANCE: number = 0.8;

    static BOMB_TIMEOUT: number = 2500;
    static BOMB_TIMEOUT_DEVIATION: number = 500;
    static BOMB_FLAME_LIVING_TIME: number = 300;

    static PLAYER_SPEED: number = 0.005;
}

export {
    Config,
}
