import * as PIXI from "pixi.js";
//import Victor from "victor";
//import Matter from "matter-js";

let canvasWight = 1280;
let canvasHeight = 720;

const canvas = document.getElementById("GameCanvas");
const app = new PIXI.Application({
  view: canvas,
  width: canvasWight,
  height: canvasHeight,
  backgroundColor: 0x5c812f,
});

let squareWidth = 32;
const square = new PIXI.Sprite(PIXI.Texture.WHITE);
square.anchor.set(0.5);
square.position.set(app.screen.width / 2, app.screen.height / 2);
square.width = square.height = squareWidth;
square.tint = 0xea985d;

app.stage.addChild(square);
