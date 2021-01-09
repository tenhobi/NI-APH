enum Attrs {
    SPEED = "player_speed",
    BOMB_POWER = "bomb_power",
    PLAYER_Y = "PLAYER_Y",
    PLAYER_X = "PLAYER_X",
    LAST_PLAYER_BOMB = "LAST_PLAYER_BOMB",
    PLAYING = "PLAYING",

    SCENE_HEIGHT = "scene_height",
}

enum Messages {
    BOMB_PLACE = 'BOMB_PLACE', // player wants to place a bomb
    BOMB_PLACED = 'BOMB_PLACED', // game manager placed the bomb
    BOMB_EXPLODED = 'BOMB_EXPLODED', // bomb exploded, make flames
    BOMB_EXPLOSION_FINISHED = "BOMB_EXPLOSION_FINISHED", // flames are out
    EXPLOSION_COLLIDED = "EXPLOSION_COLLIDED", // flame hit something
    EXPLODE_NOW = "EXPLODE_NOW", // a bomb has been hit by another flame, it should explode immediately

    PLAYER_WANTS_TO_MOVE = "PLAYER_WANTS_TO_MOVE", // player wants to move
    MOVE_PLAYER = "MOVE_PLAYER", // no collision, move player
    PLAYER_COLLIDED = "PLAYER_COLLIDED", // collision, elaborate
    PLAYER_KILLED = "PLAYER_KILLED", // player were killed
}

enum Tags {
    SOLID_WALL = "SOLID_WALL",
    BREAKABLE_WALL = "BREAKABLE_WALL",
    EMPTY = "EMPTY",

    PLAYER = "PLAYER",

    BOMB_HOLDER = "BOMB_HOLDER",
    BOMB = "BOMB",
    FLAME = "FLAME",

    POWER_UP_HOLDER = "POWER_UP_HOLDER",
    POWER_UP = "POWER_UP",
    POWER_UP_SPEED = "POWER_UP_SPEED",
    POWER_UP_BOMB = "POWER_UP_BOMB",
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
