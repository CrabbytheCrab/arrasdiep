/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import GameServer from "../../Game";
import ObjectEntity from "../Object";
import AutoTurret, { AutoTurretDefinition } from "./AutoTurret";

import { Color, PositionFlags, PhysicsFlags, StyleFlags, Tank, InputFlags } from "../../Const/Enums";
import TankBody, { BarrelBase } from "./TankBody";
import { addonId, BarrelDefinition } from "../../Const/TankDefinitions";
import { AI, AIState, Inputs } from "../AI";
import { Entity } from "../../Native/Entity";
import LivingEntity from "../Live";
import { normalizeAngle, PI2 } from "../../util";
import Barrel from "./Barrel";
import AutoTurretAlt from "./AutoTurretAlt";

/**
 * Abstract class to represent an addon in game.
 * 
 * Addons are entities added on to a tank during its creation. There are two types:
 * pre addons, and post addons. Pre addons are built before the barrels are built - for example
 * a dominator's base is a pre addon. A post addon is an addon built after the barrels are
 * built - for example the pronounciation of Ranger's barrel is a post addon.
 * 
 * Read [addons.md on diepindepth](https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md) 
 * for more details and examples.
 */
export class Addon {
    /** The current game server */
    protected game: GameServer;
    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;

    public constructor(owner: BarrelBase) {
        this.owner = owner;
        this.game = owner.game;
    }

    /**
     * `createGuard` method creates a smasher-like guard shape. 
     * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
     * for more details and examples.
     */
    protected createGuard(sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number): GuardObject {
        return new GuardObject(this.game, this.owner, sides, sizeRatio, offsetAngle, radiansPerTick);
    }

    /**
     * `createAutoTurrets` method builds `count` auto turrets around the current
     * tank's body. 
     */
    protected createCrowbar(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 2; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, 0) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 1.5;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = 0;
            base.ai.passiveRotation = this.owner.positionData.angle;

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET * (i + 1);
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET * (i + 1);

            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            const tickRotator = rotator.tick;
            rotator.tick = (tick: number) => {
                rotator.positionData.angle = this.owner.positionData.angle

                tickRotator.call(rotator, tick);

            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET * (i + 1.25);
                base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET * (i + 1.25);

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = this.owner.positionData.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createCrowbar2() {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, 0) as GuardObject & { joints: Barrel[]};
        rotator.joints = [];
        //rotator.joints = [];

        const ROT_OFFSET = 1.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;


            const barr = new Barrel(rotator, crowbarBarrel)
            const tickBase2 = barr.tick;
            const tickRotator = rotator.tick;
            rotator.tick = (tick: number) => {
                rotator.positionData.angle = this.owner.positionData.angle

                tickRotator.call(rotator, tick);

            }
            barr.positionData.values.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE)
            barr.positionData.values.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);
            barr.tick = (tick: number) => {
                barr.positionData.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE);
                barr.positionData.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);

                tickBase2.call(barr, tick);

                //barr.positionData.values.angle = angle + rotator.positionData.values.angle;
            }
            rotator.joints.push(barr);

        return rotator;
    }
    protected createCrowbar3() {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, 0) as GuardObject & { joints: Barrel[]};
        rotator.joints = [];
        //rotator.joints = [];

        const ROT_OFFSET = 1.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

            const tickRotator = rotator.tick;
            rotator.tick = (tick: number) => {
                rotator.positionData.angle = this.owner.positionData.angle

                tickRotator.call(rotator, tick);

            }
            const barr = new Barrel(rotator, crowbarBarrel2)
            const tickBase2 = barr.tick;

            barr.positionData.values.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE)
            barr.positionData.values.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);
            barr.tick = (tick: number) => {
                barr.positionData.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE);
                barr.positionData.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);

                tickBase2.call(barr, tick);

                //barr.positionData.values.angle = angle + rotator.positionData.values.angle;
            }
            rotator.joints.push(barr);

        return rotator;
    }
    protected createSniperAutoTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;
        
        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, {...AutoTurretMiniDefinition, reload:1.5,   size:65,
                bullet: {
                    type: "bullet",
                    health: 1,
                    damage: 0.3,
                    speed: 1.5,
                    scatterRate: 0.3,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 1
        }});
            base.influencedByOwnerInputs = true;
            base.ai.viewRange *= 1.5
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }

    protected createAutoTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createDrones(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, 0.01) as GuardObject & { joints: Barrel[]};
        rotator.joints = [];
        //rotator.joints = [];

        const ROT_OFFSET = 1.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {

            const barr = new Barrel(rotator, {...dronebarrel, angle: PI2 * ((i / count) - (1/(count*2)))})
            const tickBase2 = barr.tick;

            barr.positionData.values.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE)
            barr.positionData.values.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);
            barr.tick = (tick: number) => {
                barr.positionData.y += rotator.physicsData.values.size * Math.sin(MAX_ANGLE_RANGE);
                barr.positionData.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE);

                tickBase2.call(barr, tick);

                //barr.positionData.values.angle = angle + rotator.positionData.values.angle;
            }
            rotator.joints.push(barr);
        }

        return rotator;
    }
    protected createAutoTurretsBlock(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurretAlt[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurretAlt(rotator, BlockAutoTurretMiniDefinition,31.25);
            base.influencedByOwnerInputs = true;
            base.ai.viewRange = 0
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
            const {x, y} = base.getWorldPosition();
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }


    protected createAutoTurrets2(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = false;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createMegaAutoTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, MegaAutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;
            base.baseSize *= 1.2
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createAutoTurrets4(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, [AutoTurretMiniDefinition2,AutoTurretMiniDefinition3]);
            base.influencedByOwnerInputs = true;
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createAutoTurrets1(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
                       const base = new AutoTurret(this.owner, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * ((i / count) - 1 / (count * 2));
            //base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.owner.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.owner.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }


    protected createAutoMachineTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION * 6;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, {...AutoTurretMiniDefinition, reload:0.5,    isTrapezoid: true,
                bullet: {
                    type: "bullet",
                    health: 0.875,
                    damage: 0.3,
                    speed: 1.2,
                    scatterRate: 3,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 1
        }});
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
}


const AutoTurretMiniDefinition: BarrelDefinition = {
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

const MegaAutoTurretMiniDefinition: BarrelDefinition = {
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

const AutoTurretMiniDefinition2: BarrelDefinition = {
    angle: 0,
    offset: -13,
    size: 45,
    width: 42 * 0.5,
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

const BlockAutoTurretMiniDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 50,
    width: 42 * 1.25,
    delay: 0.01,
    reload: 2,
    recoil: 0.05,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "builderLauncher",
    bullet: {
        type: "block",
        health: 1.2,
        damage: 0.8,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 3.5,
        sizeRatio: 0.8,
        absorbtionFactor: 0.4
    }
};

const AutoTurretMiniDefinition3: BarrelDefinition = {
    angle: 0,
    offset: 13,
    size: 45,
    width: 42 * 0.5,
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

const dronebarrel: BarrelDefinition = {
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
    droneCount:2,
    canControlDrones: true,
    bullet: {
        type: "drone",
        sizeRatio:1,
        health: 2,
        damage: 0.7,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 1,
    }
};
const crowbarBarrel: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 260,
    width: 42,
    delay: 0,
    reload: 1.2,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    droneCount:0,
    bullet: {
        type: "drone",
        sizeRatio:1,
        health: 1,
        damage: 0.65,
        speed: 1,
        scatterRate: 1,
        lifeLength: 1,
        absorbtionFactor: 1,
    }
};
const crowbarBarrel2: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42,
    delay: 0,
    reload: 1.2,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: Math.PI,
    addon: null,
    droneCount:0,
    bullet: {
        type: "drone",
        sizeRatio:1,
        health: 1,
        damage: 0.65,
        speed: 1,
        scatterRate: 1,
        lifeLength: 1,
        absorbtionFactor: 1,
    }
};
/**
 * A smasher-like guard object.
 * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
 * for more details and examples.
 */
export class GuardObject extends ObjectEntity implements BarrelBase {
    /***** From BarrelBase *****/
    public inputs: Inputs;
    public cameraEntity: Entity;
    public reloadTime: number;

    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;
    /** To store the size ratio (in compared to the owner) */
    public sizeRatio: number;
    /** Radians per tick, how many radians the guard will rotate in a tick */
    public radiansPerTick: number;

    public constructor(game: GameServer, owner: BarrelBase, sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number) {
        super(game);

        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        // It's weird, but it's how it works
        sizeRatio *= Math.SQRT1_2
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;

        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;

        this.styleData.values.color = Color.Border;
        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }

    /**
     * Size factor, used for calculation of the turret and base size.
     */
    get sizeFactor() {
        return this.owner.sizeFactor;
    }

    /**
     * Called (if ever) similarly to LivingEntity.onKill
     * Spreads onKill to owner
     */
    public onKill(killedEntity: LivingEntity) {
        if (!(this.owner instanceof LivingEntity)) return;
        this.owner.onKill(killedEntity);
    }

    public tick(tick: number): void {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle += this.radiansPerTick;
        // It won't ever do any collisions, so no need to tick the object
        // super.tick(tick);
    }
}

/** Spikes addon. */
class SpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.3, 0, 0.17);
        this.createGuard(3, 1.3, Math.PI / 3, 0.17);
        this.createGuard(3, 1.3, Math.PI / 6, 0.17);
        this.createGuard(3, 1.3, Math.PI / 2, 0.17);
    }
}
/** Dominator's Base addon. */
class DomBaseAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.24, 0, 0);
    }
}
/** Smasher addon. */
class SmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
    }
}
/** Landmine addon. */
class LandmineAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        this.createGuard(6, 1.15, 0, .05);
    }
}
/** The thing underneath Rocketeer and Twister addon. */
class LauncherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;

        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;

        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}
/** Centered Auto Turret addon. */
class AutoTurretAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new AutoTurret(owner);
    }
}

/** Smasher + Centered Auto Turret addon. */
class AutoSmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        this.createGuard(6, 1.15, 0, .1);
        const base = new AutoTurret(owner, [{
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
        },{
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
        }])
        base.influencedByOwnerInputs = true
    }
}
/** 5 Auto Turrets */
class Auto5Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(5);
    }
}
/** 3 Auto Turrets */
class Auto3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        if(this.owner instanceof TankBody){
            if(this.owner.currentTank == Tank.banshee){
                this.createDrones(3);
                this.createAutoTurrets2(3);
            }else{
                this.createAutoTurrets(3);
            }
        }else{
            this.createAutoTurrets(3);
        }
    }
}

class Sniper3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
            this.createSniperAutoTurrets(3);
    }
}

class CrowbarAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        this.createCrowbar2();
        this.createCrowbar3();
        this.createCrowbar(3);
    }
}
class Mega3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createMegaAutoTurrets(3);
    }
}
class Builder3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurretsBlock(3);
    }
}
/** The thing above ranger's barrel. */
class PronouncedAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above Gunner + Destroyer Dominator's barrel. */
class PronouncedDomAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 22 / 50;
        const widthRatio = 35 / 50;
        const offsetRatio = 50 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;
        
        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** Weird spike addon. Based on the arrasio Original. */
class WeirdSpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.5, 0, 0.17);
        this.createGuard(3, 1.5, 0, -0.16);
    }
}
/** 2 Auto Turrets */
class Auto2Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(2);
    }
}
/** 7 Auto Turrets */
class Auto7Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(7);
    }
}

class Auto4Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets4(4);
    }
}

/** Centered Auto Rocket addon. */
class AutoRocketAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const base = new AutoTurret(owner, {
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
/** SPIESK addon. */
class SpieskAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(4, 1.3, 0, 0.17);
        this.createGuard(4, 1.3, Math.PI / 6, 0.17);
        this.createGuard(4, 1.3, 2 * Math.PI / 6, 0.17);
    }
}

export class GliderAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
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

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}


export class GuardObject2 extends ObjectEntity implements BarrelBase {
    /***** From BarrelBase *****/
    public inputs: Inputs;
    public cameraEntity: Entity;
    public reloadTime: number;

    /** Helps the class determine size ratio as well as who is the owner */
    public owner: BarrelBase;
    /** To store the size ratio (in compared to the owner) */
    public sizeRatio: number;
    /** Radians per tick, how many radians the guard will rotate in a tick */
    public radiansPerTick: number;

    public constructor(game: GameServer, owner: BarrelBase, sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number) {
        super(game);

        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        // It's weird, but it's how it works
        sizeRatio *= Math.SQRT1_2
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;

        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;
this.styleData.zIndex += 2
this.styleData.flags |= StyleFlags.showsAboveParent
        this.styleData.values.color = Color.Border;
        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }

    
    /**
     * Size factor, used for calculation of the turret and base size.
     */
    get sizeFactor() {
        return this.owner.sizeFactor;
    }

    /**
     * Called (if ever) similarly to LivingEntity.onKill
     * Spreads onKill to owner
     */
    public onKill(killedEntity: LivingEntity) {
        if (!(this.owner instanceof LivingEntity)) return;
        this.owner.onKill(killedEntity);
    }

    public tick(tick: number): void {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle = this.owner.positionData.angle
        // It won't ever do any collisions, so no need to tick the object
        // super.tick(tick);
    }
}
class OverDriveAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const b = new GuardObject2(this.game, this.owner, 4, 0.55, 0, 0);;
        b.styleData.color = Color.Barrel
    }
}
class Auto1Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets1(1);
    }
}

class MegaSmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.3, 0, .1);
    }
}
/**
 * All addons in the game by their ID.
 */

export const AddonById: Record<addonId, typeof Addon | null> = {
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
    // not part of diep
    weirdspike: WeirdSpikeAddon,
    auto7: Auto7Addon,
    auto2: Auto2Addon,
    mega3: Mega3Addon,
    build3: Builder3Addon,
    autorocket: AutoRocketAddon,
    spiesk: SpieskAddon,
    megasmasher: MegaSmasherAddon,
    cuck : Auto1Addon,
    crowbar: CrowbarAddon,
    sniper3 : Sniper3Addon
    
}
