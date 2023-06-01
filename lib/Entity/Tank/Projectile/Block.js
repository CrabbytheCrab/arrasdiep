"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../../../util"));
const Bullet_1 = __importDefault(require("./Bullet"));
const TankBody_1 = __importDefault(require("../TankBody"));
const util_1 = require("../../../util");
class PillBox extends Bullet_1.default {
    constructor(barrel, tank, tankDefinition, shootAngle, parent) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.collisionEnd = 0;
        this.usePosAngle = false;
        this.tic = 5;
        const bulletDefinition = barrel.definition.bullet;
        this.parent = parent ?? tank;
        this.XMouse = 0;
        this.YMouse = 0;
        if (this.parent instanceof TankBody_1.default) {
            this.XMouse = this.parent.inputs.mouse.x;
            this.YMouse = this.parent.inputs.mouse.y;
        }
        this.baseSpeed = (barrel.bulletAccel / 2) + 30 - Math.random() * barrel.definition.bullet.scatterRate;
        this.physicsData.values.sides = bulletDefinition.sides ?? 4;
        this.styleData.values.flags |= 16;
        this.styleData.values.flags &= ~128;
        this.angles = Math.atan2((this.YMouse - this.positionData.values.y), (this.XMouse - this.positionData.values.x));
        this.collisionEnd = this.lifeLength >> 3;
        this.lifeLength = (600 * barrel.definition.bullet.lifeLength) >> 3;
        this.positionData.values.angle = Math.random() * util_1.PI2;
    }
    onKill(killedEntity) {
        if (typeof this.parent.onKill === 'function')
            this.parent.onKill(killedEntity);
    }
    tick(tick) {
        super.tick(tick);
        const delta = {
            x: this.XMouse - this.positionData.values.x,
            y: this.YMouse - this.positionData.values.y
        };
        this.positionData.angle += util.constrain(util.constrain(this.velocity.angleComponent(this.movementAngle) * .05, 0, 0.5) - util.constrain(this.velocity.magnitude, 0, 0.2) * 0.5, 0, 0.8);
        if (this.tic > 0) {
            if (tick - this.spawnTick >= (this.lifeLength / 32)) {
                this.movementAngle += (Math.atan2(delta.y, delta.x) - this.movementAngle) * 0.75;
            }
        }
        let dist = (delta.x ** 2 + delta.y ** 2) / PillBox.MAX_RESTING_RADIUS;
        if (this.tic == 0) {
            this.baseAccel = 0;
            this.baseSpeed = 0;
            this.velocity.x = 0;
            this.velocity.y = 0;
            if (this.physicsData.values.flags & 32)
                this.physicsData.flags ^= 32;
            this.physicsData.values.flags |= 8;
        }
        if (dist < 1 && this.tic > 0) {
            this.tic--;
            this.baseAccel /= 2;
            this.baseSpeed /= 2;
        }
    }
}
exports.default = PillBox;
PillBox.MAX_RESTING_RADIUS = 400 ** 2;
