"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonById = exports.GuardObject2 = exports.GliderAddon = exports.GuardObject = exports.Addon = void 0;
const Object_1 = __importDefault(require("../Object"));
const AutoTurret_1 = __importDefault(require("./AutoTurret"));
const TankBody_1 = __importDefault(require("./TankBody"));
const AI_1 = require("../AI");
const Live_1 = __importDefault(require("../Live"));
const util_1 = require("../../util");
const Barrel_1 = __importDefault(require("./Barrel"));
const AutoTurretAlt_1 = __importDefault(require("./AutoTurretAlt"));
class Addon {
    constructor(owner) {
        this.owner = owner;
        this.game = owner.game;
    }
    createGuard(sides, sizeRatio, offsetAngle, radiansPerTick) {
        return new GuardObject(this.game, this.owner, sides, sizeRatio, offsetAngle, radiansPerTick);
    }
    createAutoTurrets(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createDrones(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2;
        const rotator = this.createGuard(1, .1, 0, 0.01);
        rotator.joints = [];
        const ROT_OFFSET = 1.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const barr = new Barrel_1.default(rotator, { ...dronebarrel, angle: util_1.PI2 * ((i / count) - (1 / (count * 2))) });
            const tickBase2 = barr.tick;
            barr.positionData.values.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE);
            barr.positionData.values.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);
            barr.tick = (tick) => {
                barr.positionData.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE);
                barr.positionData.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);
                tickBase2.call(barr, tick);
            };
            rotator.joints.push(barr);
        }
        return rotator;
    }
    createAutoTurretsBlock(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurretAlt_1.default(rotator, BlockAutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;
            base.ai.viewRange = 0;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                const { x, y } = base.getWorldPosition();
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createAutoTurrets2(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = false;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createMegaAutoTurrets(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(rotator, MegaAutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;
            base.baseSize *= 1.2;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createAutoTurrets4(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(rotator, [AutoTurretMiniDefinition2, AutoTurretMiniDefinition3]);
            base.influencedByOwnerInputs = true;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createAutoTurrets1(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(this.owner, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * ((i / count) - 1 / (count * 2));
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + this.owner.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + this.owner.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
    createAutoMachineTurrets(count) {
        const rotPerTick = AI_1.AI.PASSIVE_ROTATION * 6;
        const MAX_ANGLE_RANGE = util_1.PI2 / 4;
        const rotator = this.createGuard(1, .1, 0, rotPerTick);
        rotator.turrets = [];
        const ROT_OFFSET = 0.8;
        if (rotator.styleData.values.flags & 1)
            rotator.styleData.values.flags ^= 1;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret_1.default(rotator, { ...AutoTurretMiniDefinition, reload: 0.5, isTrapezoid: true,
                bullet: {
                    type: "bullet",
                    health: 0.875,
                    damage: 0.3,
                    speed: 1.2,
                    scatterRate: 3,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 1
                } });
            base.influencedByOwnerInputs = true;
            const angle = base.ai.inputs.mouse.angle = util_1.PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                const deltaAngle = (0, util_1.normalizeAngle)(angleToTarget - ((angle + rotator.positionData.values.angle)));
                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (util_1.PI2 - MAX_ANGLE_RANGE);
            };
            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            if (base.styleData.values.flags & 64)
                base.styleData.values.flags ^= 64;
            base.physicsData.values.flags |= 1;
            const tickBase = base.tick;
            base.tick = (tick) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
                tickBase.call(base, tick);
                if (base.ai.state === 0)
                    base.positionData.angle = angle + rotator.positionData.values.angle;
            };
            rotator.turrets.push(base);
        }
        return rotator;
    }
}
exports.Addon = Addon;
const AutoTurretMiniDefinition = {
    angle: 0,
    offset: 0,
    size: 55,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1,
    recoil: 0.3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.4,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const MegaAutoTurretMiniDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42,
    delay: 0.01,
    reload: 2,
    recoil: 0.3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 1,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 0.4
    }
};
const AutoTurretMiniDefinition2 = {
    angle: 0,
    offset: -9,
    size: 40,
    width: 42 * 0.35,
    delay: 0.01,
    reload: 1,
    recoil: 0.05,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.2,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const BlockAutoTurretMiniDefinition = {
    angle: 0,
    offset: 0,
    size: 50,
    width: 42 * 1,
    delay: 0.01,
    reload: 3,
    recoil: 0.05,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "builderLauncher",
    bullet: {
        type: "block",
        health: 1.75,
        damage: 0.8,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 2,
        sizeRatio: 0.8,
        absorbtionFactor: 1
    }
};
const AutoTurretMiniDefinition3 = {
    angle: 0,
    offset: 9,
    size: 40,
    width: 42 * 0.35,
    delay: 0.51,
    reload: 1,
    recoil: 0.05,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.2,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const dronebarrel = {
    angle: 0,
    offset: 0,
    size: 70,
    width: 42,
    delay: 0,
    reload: 6,
    recoil: 1,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 2,
    canControlDrones: true,
    bullet: {
        type: "drone",
        sizeRatio: 1,
        health: 2,
        damage: 0.7,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 1,
    }
};
class GuardObject extends Object_1.default {
    constructor(game, owner, sides, sizeRatio, offsetAngle, radiansPerTick) {
        super(game);
        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        sizeRatio *= Math.SQRT1_2;
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;
        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;
        this.styleData.values.color = 0;
        this.positionData.values.flags |= 1;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }
    get sizeFactor() {
        return this.owner.sizeFactor;
    }
    onKill(killedEntity) {
        if (!(this.owner instanceof Live_1.default))
            return;
        this.owner.onKill(killedEntity);
    }
    tick(tick) {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle += this.radiansPerTick;
    }
}
exports.GuardObject = GuardObject;
class SpikeAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(3, 1.3, 0, 0.17);
        this.createGuard(3, 1.3, Math.PI / 3, 0.17);
        this.createGuard(3, 1.3, Math.PI / 6, 0.17);
        this.createGuard(3, 1.3, Math.PI / 2, 0.17);
    }
}
class DomBaseAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(6, 1.24, 0, 0);
    }
}
class SmasherAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(6, 1.15, 0, .1);
    }
}
class LandmineAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(6, 1.15, 0, .1);
        this.createGuard(6, 1.15, 0, .05);
    }
}
class LauncherAddon extends Addon {
    constructor(owner) {
        super(owner);
        const launcher = new Object_1.default(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;
        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;
        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;
        launcher.styleData.values.color = 1;
        launcher.physicsData.values.flags |= 1;
        launcher.physicsData.values.sides = 2;
        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;
            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        };
    }
}
class AutoTurretAddon extends Addon {
    constructor(owner) {
        super(owner);
        new AutoTurret_1.default(owner);
    }
}
class AutoSmasherAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(6, 1.15, 0, .1);
        const base = new AutoTurret_1.default(owner, [{
                angle: 0,
                offset: 13,
                size: 50,
                width: 42 * 0.5,
                delay: 0.51,
                reload: 1,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: null,
                bullet: {
                    type: "bullet",
                    health: 1,
                    damage: 0.3,
                    speed: 1.2,
                    scatterRate: 1,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 0.5
                }
            }, {
                angle: 0,
                offset: -13,
                size: 50,
                width: 42 * 0.5,
                delay: 0.01,
                reload: 1,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: null,
                bullet: {
                    type: "bullet",
                    health: 1,
                    damage: 0.3,
                    speed: 1.2,
                    scatterRate: 1,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 0.5
                }
            }]);
        base.influencedByOwnerInputs = true;
    }
}
class Auto5Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurrets(5);
    }
}
class Auto3Addon extends Addon {
    constructor(owner) {
        super(owner);
        if (this.owner instanceof TankBody_1.default) {
            if (this.owner.currentTank == 86) {
                this.createAutoTurrets2(3);
                this.createDrones(3);
            }
            else {
                this.createAutoTurrets(3);
            }
        }
        else {
            this.createAutoTurrets(3);
        }
    }
}
class Mega3Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createMegaAutoTurrets(3);
    }
}
class Builder3Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurretsBlock(3);
    }
}
class PronouncedAddon extends Addon {
    constructor(owner) {
        super(owner);
        const pronounce = new Object_1.default(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;
        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team;
        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;
        pronounce.styleData.values.color = 1;
        pronounce.physicsData.values.flags |= 1;
        pronounce.physicsData.values.sides = 2;
        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;
            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        };
    }
}
class PronouncedDomAddon extends Addon {
    constructor(owner) {
        super(owner);
        const pronounce = new Object_1.default(this.game);
        const sizeRatio = 22 / 50;
        const widthRatio = 35 / 50;
        const offsetRatio = 50 / 50;
        const size = this.owner.physicsData.values.size;
        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team;
        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;
        pronounce.styleData.values.color = 1;
        pronounce.physicsData.values.flags |= 1;
        pronounce.physicsData.values.sides = 2;
        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;
            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        };
    }
}
class WeirdSpikeAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(3, 1.5, 0, 0.17);
        this.createGuard(3, 1.5, 0, -0.16);
    }
}
class Auto2Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurrets(2);
    }
}
class Auto7Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurrets(7);
    }
}
class Auto4Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurrets4(4);
    }
}
class AutoRocketAddon extends Addon {
    constructor(owner) {
        super(owner);
        const base = new AutoTurret_1.default(owner, {
            angle: 0,
            offset: 0,
            size: 40,
            width: 26.25,
            delay: 0,
            reload: 2,
            recoil: 0.75,
            isTrapezoid: true,
            trapezoidDirection: 3.141592653589793,
            addon: null,
            bullet: {
                type: "rocket",
                sizeRatio: 1,
                health: 2.5,
                damage: 0.5,
                speed: 0.3,
                scatterRate: 1,
                lifeLength: 0.75,
                absorbtionFactor: 0.1
            }
        });
        new LauncherAddon(base);
        base.turret[0].styleData.zIndex += 2;
    }
}
class SpieskAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(4, 1.3, 0, 0.17);
        this.createGuard(4, 1.3, Math.PI / 6, 0.17);
        this.createGuard(4, 1.3, 2 * Math.PI / 6, 0.17);
    }
}
class GliderAddon extends Addon {
    constructor(owner) {
        super(owner);
        const launcher = new Object_1.default(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;
        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;
        launcher.positionData.values.angle = Math.PI;
        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;
        launcher.styleData.values.color = 1;
        launcher.physicsData.values.flags |= 1;
        launcher.physicsData.values.sides = 2;
        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;
            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        };
    }
}
exports.GliderAddon = GliderAddon;
class GuardObject2 extends Object_1.default {
    constructor(game, owner, sides, sizeRatio, offsetAngle, radiansPerTick) {
        super(game);
        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        sizeRatio *= Math.SQRT1_2;
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;
        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;
        this.styleData.zIndex += 2;
        this.styleData.flags |= 64;
        this.styleData.values.color = 0;
        this.positionData.values.flags |= 1;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }
    get sizeFactor() {
        return this.owner.sizeFactor;
    }
    onKill(killedEntity) {
        if (!(this.owner instanceof Live_1.default))
            return;
        this.owner.onKill(killedEntity);
    }
    tick(tick) {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle = this.owner.positionData.angle;
    }
}
exports.GuardObject2 = GuardObject2;
class OverDriveAddon extends Addon {
    constructor(owner) {
        super(owner);
        const b = new GuardObject2(this.game, this.owner, 4, 0.55, 0, 0);
        ;
        b.styleData.color = 1;
    }
}
class Auto1Addon extends Addon {
    constructor(owner) {
        super(owner);
        this.createAutoTurrets1(1);
    }
}
class MegaSmasherAddon extends Addon {
    constructor(owner) {
        super(owner);
        this.createGuard(6, 1.3, 0, .1);
    }
}
exports.AddonById = {
    spike: SpikeAddon,
    dombase: DomBaseAddon,
    launcher: LauncherAddon,
    dompronounced: PronouncedDomAddon,
    auto5: Auto5Addon,
    auto3: Auto3Addon,
    autosmasher: AutoSmasherAddon,
    pronounced: PronouncedAddon,
    smasher: SmasherAddon,
    landmine: LandmineAddon,
    autoturret: AutoTurretAddon,
    auto4: Auto4Addon,
    overdrive: OverDriveAddon,
    weirdspike: WeirdSpikeAddon,
    auto7: Auto7Addon,
    auto2: Auto2Addon,
    mega3: Mega3Addon,
    build3: Builder3Addon,
    autorocket: AutoRocketAddon,
    spiesk: SpieskAddon,
    megasmasher: MegaSmasherAddon,
    cuck: Auto1Addon
};
