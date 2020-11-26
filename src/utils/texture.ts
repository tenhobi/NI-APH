import PIXI = require("pixi.js");

export class TextureUtils {
    static createTexture(offsetX: number, offsetY: number, width: number, height: number) {
        let texture = PIXI.Texture.from('spritesheet');
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
        return texture;
    }
}
