PixiJS boilerplate for NI-APH
=========

## How to start

* Clone content of this repository into your local folder
* Install [Node Package Manager](https://www.npmjs.com)
* Execute command `npm install` and `npm start`
* Open `localhost:1234/creature.html` in your browser


## Bomberman

- Genre: Arcade
- Library: PixiJS
- Space: 2D grid world
- Objects: animated players, power-ups, blocks
- Actions
    - walking, placing bomb, using power-up
- Rules
    - Player has 1 weapon: bombs, the effect is performed after some time.
    - Players spawn randomly.
    - There is no exit. The goal is to survive as long as possible.
    - Power-ups are hidden in destructible blocks, they can be extracted by breaking the block but they can also be destroyed by direct explosion.
- Technical mechanic
    - bot