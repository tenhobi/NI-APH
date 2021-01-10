# Bomber f*ing man

The game is a simple oldschoolish bomberman game, deployed at [aph.tenhobi.dev](https://aph.tenhobi.dev).

### How to start

* Clone this repository.
* Install [Node Package Manager](https://www.npmjs.com)
* Execute command `npm install` and `npm start`.
* Open `localhost:1234` in your browser.

### How it works

Each game is played by 3 players, 1 human and 2 simple bots, or 2 humans and 1 bot.
By placing a bomb next to the breakable wall, a power-up can be dropped, which will increase bomb power or bomb count for the player.
The end of each game is after all players are dead.
The winner of last game will be shown on main menu screen.

The game is composed of multiple game objects which are controlled by their components and communicates using messaging pattern.
For example, components `PlayerCollisionWatcher` watches moving intend and informs `PlayerCollisionResolver` which resolves if the movement is legal and make it happen for the player.
In the diagram below, you can see the structure of game objects, their components and attributes.

![](images/diagram.png)

The game is written using PIXI.js and ECS engine.
It was the first time I were making a game with these technologies,
but overall the component architecture with messaging pattern proved great.

The game has multiple ways how to improve it even more,
namely better UI (tho I find this oldschoolish UI quite nostalgic),
better or another type of bots,
another power ups etc.

### Manual

The main menu is controlled by keys `UP` and `DOWN` for changing human player count, and by keys `LEFT` and `RIGHT` for changing amount of breakable walls. Using key `ENTER` the game is started.

The game is controlled by keys `UP`, `RIGHT`, `DOWN` and `LEFT` for moving and by key `SPACE` for placing a bomb for the first human player (alternatively `W`, `S`, `A` and `D` for moving and key `G` for placing a bomb for the second human player).

## 📃 License

Licensed under the [MIT License](LICENSE).

Assets:

- https://opengameart.org/content/bomb-party-the-complete-set
- https://opengameart.org/content/cheerful-upbeat-tune
