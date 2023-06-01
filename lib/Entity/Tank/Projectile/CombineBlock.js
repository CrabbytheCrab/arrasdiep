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
const Addons_1 = require("../Addons");
const AI_1 = require("../../AI");
class CombinePillBox extends Bullet_1.default {
    constructor(barrel, tank, tankDefinition, shootAngle, parent) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.collisionEnd = 0;
        this.reloadTime = 15;
        this.inputs = new AI_1.Inputs();
        this.usePosAngle = false;
        this.cameraEntity = tank.cameraEntity;
        this.sizeFactor = this.physicsData.values.size / 50;
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
        this.combine = 0;
        if (this.physicsData.values.flags & 8)
            this.physicsData.values.flags ^= 8;
        this.physicsData.values.flags |= 32;
        this.styleData.values.flags |= 16;
        this.styleData.values.flags &= ~128;
        this.angles = Math.atan2((this.YMouse - this.positionData.values.y), (this.XMouse - this.positionData.values.x));
        this.collisionEnd = this.lifeLength >> 3;
        this.lifeLength = (600 * barrel.definition.bullet.lifeLength) >> 3;
        const smash = new Addons_1.GuardObject(this.game, this, 4, 0.75, 0, 0);
        smash.styleData.flags |= 16 | 64;
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
        let dist = (delta.x ** 2 + delta.y ** 2) / CombinePillBox.MAX_RESTING_RADIUS;
        if (this.tic > 0) {
            const collidedEntities = this.findCollisions();
            for (let i = 0; i < collidedEntities.length; ++i) {
                let box = collidedEntities[i];
                if (box instanceof CombinePillBox) {
                    if (box.tic == 0 && box.relationsData.owner == this.relationsData.owner && (this.combine + box.combine) < 12) {
                        box.destroy();
                        this.physicsData.size = (box.physicsData.size + this.physicsData.size) * 0.75;
                        this.damagePerTick += box.damagePerTick / 4;
                        this.healthData.maxHealth += box.healthData.maxHealth / 4;
                        this.healthData.health += box.healthData.health / 4;
                        this.combine += 1 + box.combine;
                    }
                }
            }
        }
        if (this.tic == 0) {
            this.baseAccel = 0;
            this.baseSpeed = 0;
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        if (dist < 1 && this.tic > 0) {
            this.tic--;
            this.baseAccel /= 2;
            this.baseSpeed /= 2;
        }
    }
}
exports.default = CombinePillBox;
CombinePillBox.MAX_RESTING_RADIUS = 400 ** 2;
