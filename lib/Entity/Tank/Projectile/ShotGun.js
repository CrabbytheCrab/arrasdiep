"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bullet_1 = __importDefault(require("./Bullet"));
class Shotgun extends Bullet_1.default {
    constructor(barrel, tank, tankDefinition, shootAngle) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.baseSpeed *= 2;
        this.baseAccel /= 2;
        this.physicsData.size *= 1 + ((0.5 * Math.random()) - 0.25);
        this.baseSpeed *= 1 + ((0.4 * Math.random()) - 0.2);
        this.baseAccel *= 1 + ((0.5 * Math.random()) - 0.25);
    }
    tick(tick) {
        if (tick <= this.spawnTick + 5) {
        }
        else {
            const bulletDefinition = this.barrelEntity.definition.bullet;
            const statLevels = this.tank.cameraEntity.cameraData?.values.statLevels.values;
            const bulletDamage = statLevels ? statLevels[2] : 0;
            const falloff = ((7 + bulletDamage * 3) * bulletDefinition.damage) / 2;
            this.damagePerTick = falloff;
        }
        super.tick(tick);
    }
}
exports.default = Shotgun;
