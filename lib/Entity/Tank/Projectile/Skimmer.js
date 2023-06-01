"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Barrel_1 = __importDefault(require("../Barrel"));
const Bullet_1 = __importDefault(require("./Bullet"));
const AI_1 = require("../../AI");
const RocketBarrelDefinition = {
    angle: 3.752457891787808,
    offset: 0,
    size: 70,
    width: 37.8,
    delay: 0,
    reload: 0.8,
    recoil: 4.5,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.6,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.5,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const RocketBarrelDefinition2 = {
    angle: 2.530727415391778,
    offset: 0,
    size: 70,
    width: 37.8,
    delay: 0,
    reload: 0.8,
    recoil: 4.5,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.6,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.5,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
class Skimmer extends Bullet_1.default {
    constructor(barrel, tank, tankDefinition, shootAngle) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.reloadTime = 1;
        this.inputs = new AI_1.Inputs();
        this.cameraEntity = tank.cameraEntity;
        this.sizeFactor = this.physicsData.values.size / 50;
        const skimmerBarrels = this.launrocketBarrel = [];
        const s1 = new class extends Barrel_1.default {
            resize() {
                super.resize();
            }
        }(this, { ...RocketBarrelDefinition });
        const s2 = new class extends Barrel_1.default {
            resize() {
                super.resize();
            }
        }(this, RocketBarrelDefinition2);
        s1.styleData.values.color = this.styleData.values.color;
        s2.styleData.values.color = this.styleData.values.color;
        skimmerBarrels.push(s1, s2);
    }
    tick(tick) {
        this.sizeFactor = this.physicsData.values.size / 50;
        this.reloadTime = this.tank.reloadTime;
        super.tick(tick);
        if (this.deletionAnimation)
            return;
        this.inputs.flags |= 1;
    }
}
exports.default = Skimmer;
