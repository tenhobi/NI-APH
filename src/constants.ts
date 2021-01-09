enum Attrs {
    SPEED = "player_speed",
    SCENE_HEIGHT = "scene_height",
    PLAYER_Y = "PLAYER_Y",
    PLAYER_X = "PLAYER_X",
    PLAYER_BOMB = "PLAYER_BOMB",
}

enum Messages {
    BOMB_PLACING = 'BOMB_PLACING',
    BOMB_PLACED = 'BOMB_PLACED',
    PLAYER_COLLIDED = "PLAYER_COLLIDED",
    PLAYER_WANTS_TO_MOVE = "PLAYER_WANTS_TO_MOVE",
    EXPLOSION_COLLIDED = "EXPLOSION_COLLIDED",
}

enum Tags {
    SOLID_WALL = "SOLID_WALL",
    BREAKABLE_WALL = "BREAKABLE_WALL",
    EMPTY = "EMPTY",
    PLAYER = "PLAYER",
    BOMB = "BOMB",
    FLAME = "FLAME",
}

enum Assets {
    SPRITESHEET = "spritesheet",
    MUSIC_INTRO = "music-intro",
    MUSIC_LOOP = "music-loop"
}

export {
    Attrs,
    Messages,
    Tags,
    Assets,
}
