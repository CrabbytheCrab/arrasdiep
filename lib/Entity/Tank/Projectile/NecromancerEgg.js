"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Drone_1 = __importDefault(require("./Drone"));
const AI_1 = require("../../AI");
class NecromancerEgg extends Drone_1.default {
    constructor(barrel, tank, tankDefinition, shootAngle) {
        super(barrel, tank, tankDefinition, shootAngle);
        const bulletDefinition = barrel.definition.bullet;
        this.ai = new AI_1.AI(this);
        this.ai.viewRange = 1000;
        this.tank.DroneCount += 1;
        this.physicsData.values.sides = 1;
        this.physicsData.values.size = 25 * Math.SQRT1_2;
        if (this.physicsData.values.flags & 8)
            this.physicsData.values.flags ^= 8;
        this.physicsData.values.flags |= 32;
        if (tankDefinition && tankDefinition.id === 96) {
            this.lifeLength = 88;
        }
        else {
            this.lifeLength = Infinity;
            if (this.physicsData.values.flags & 256)
                this.physicsData.values.flags ^= 256;
        }
        this.deathAccelFactor = 1;
        this.physicsData.values.pushFactor *= 1.5;
        this.physicsData.values.absorbtionFactor = bulletDefinition.absorbtionFactor;
        this.baseSpeed /= 3;
    }
    destroy(animate = true) {
        if (!animate)
            this.tank.DroneCount -= 1;
        super.destroy(animate);
    }
    static fromShape(barrel, tank, tankDefinition, shape) {
        const chip = new NecromancerEgg(barrel, tank, tankDefinition, shape.positionData.values.angle);
        chip.physicsData.values.sides = shape.physicsData.values.sides;
        chip.physicsData.values.size = shape.physicsData.values.size;
        chip.positionData.values.x = shape.positionData.values.x;
        chip.positionData.values.y = shape.positionData.values.y;
        chip.positionData.values.angle = shape.positionData.values.angle;
        const shapeDamagePerTick = shape.damagePerTick;
        chip.baseSpeed = 0;
        chip.damagePerTick *= shapeDamagePerTick / 8;
        chip.healthData.values.maxHealth = (chip.healthData.values.health *= (shapeDamagePerTick / 8));
        return chip;
    }
}
exports.default = NecromancerEgg;
