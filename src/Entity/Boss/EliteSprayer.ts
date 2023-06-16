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
import Barrel from "../Tank/Barrel";
import AutoTurret, { AutoTurretDefinition } from "../Tank/AutoTurret";
import AbstractBoss from "./AbstractBoss";

import { Color, Tank, PositionFlags, StyleFlags } from "../../Const/Enums";
import { AIState } from "../AI";

import TankDefinitions, { BarrelDefinition } from "../../Const/TankDefinitions";
import { PI2, normalizeAngle } from "../../util";
import { GuardObject } from "../Tank/Addons";

/**
 * Definitions (stats and data) of the mounted turret on Defender
 *
 * Defender's gun
 */
const MountedTurretDefinition: BarrelDefinition = {
    ...AutoTurretDefinition,
    bullet: {
        ...AutoTurretDefinition.bullet,
        speed: 2.3,
        damage: 0.75,
        health: 5.75,
        color: Color.Neutral
    }
};

/**
 * Definitions (stats and data) of the trap launcher on Defender
 */
const DefenderDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 110 * 0.8,
    width: 42  * 0.8,
    delay: 0.5,
    reload: 1.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 0.7,
        health: 2,
        damage: 0.5,
        speed: 1,
        scatterRate: 1,
        lifeLength: 4,
        absorbtionFactor: 0.1
    }
}

const DefenderDefinition2: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 95 * 0.8,
    width: 42 * 0.8,
    delay: 0,
    reload: 0.75,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 2,
        damage: 1.5,
        speed: 1,
        scatterRate: 3,
        lifeLength: 4,
        absorbtionFactor: 0.1
    }
}
const DefenderDefinition3: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 95 * 0.8,
    width: 42 * 0.8,
    delay: 0,
    reload: 0.5,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    forceFire:true,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 1,
        damage: 1.5,
        speed: 1,
        scatterRate: 3,
        lifeLength: 2,
        absorbtionFactor: 0.1
    }
}
// The size of a Defender by default
const DEFENDER_SIZE = 150;

/**
 * Class which represents the boss "Defender"
 */
export default class EliteSprayer extends AbstractBoss {

    /** Defender's trap launchers */
    private trappers: Barrel[] = [];
    /** See AbstractBoss.movementSpeed */
    public movementSpeed = 0.35;

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = 'Elite Sprayer';
        this.styleData.values.color = Color.EnemyCrasher;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = DEFENDER_SIZE * Math.SQRT1_2;
        this.ai.viewRange = 0;

        this.physicsData.values.sides = 3;
        const rotator = new GuardObject(this.game, this, 1, 0.5, 0, -this.ai.passiveRotation )  as GuardObject & { joints: Barrel[]} ;
        rotator.styleData.values.color = this.styleData.color
        rotator.styleData.values.flags |= StyleFlags.showsAboveParent;

        for (let i = 0; i < 3; ++i) {


            const barr = new Barrel(rotator, {...DefenderDefinition3, angle: PI2 * (i / 3)})
            const tickBase2 = barr.tick;

            barr.positionData.values.y += rotator.physicsData.values.size * Math.sin(0.01)
            barr.positionData.values.x += rotator.physicsData.values.size * Math.cos(0.01);
            barr.tick = (tick: number) => {
                barr.positionData.y += rotator.physicsData.values.size * Math.sin(0.01);
                barr.positionData.x += rotator.physicsData.values.size * Math.cos(0.01);

                tickBase2.call(barr, tick);

                //barr.positionData.values.angle = angle + rotator.positionData.values.angle;
            }
        }
        for (let i = 0; i < 3; ++i) {
            // TODO:
            // Maybe make this into a class of itself - DefenderAutoTurret
            const base = new AutoTurret(this, [DefenderDefinition,DefenderDefinition2],40);
            base.influencedByOwnerInputs = true;
            const MAX_ANGLE_RANGE = PI2 / 6; // keep within 90º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * ((i / 3) - 1 / (3 * 2));
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;


            base.positionData.x = Math.cos(angle) * (this.physicsData.size / 2 + (10)) - Math.sin(angle) * 0.575 * this.physicsData.values.size;
            base.positionData.y = Math.sin(angle) * (this.physicsData.size / 2 + (10)) + Math.cos(angle) * 0.575 * this.physicsData.values.size;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                //base.positionData.y = (this.physicsData.values.size + (20)) * Math.sin(angle) * 0.8;
                //base.positionData.x = (this.physicsData.values.size + (20)) * Math.cos(angle) * 0.8;

                base.positionData.x = Math.cos(angle) * (this.physicsData.size / 2 + (10)) - Math.sin(angle) * 0.575 * this.physicsData.values.size;
                base.positionData.y = Math.sin(angle) * (this.physicsData.size / 2 + (10)) + Math.cos(angle) * 0.575 * this.physicsData.values.size;

                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;

            }
        }
        for (let i = 0; i < 3; ++i) {
            // TODO:
            // Maybe make this into a class of itself - DefenderAutoTurret
            const base = new AutoTurret(this, [DefenderDefinition,DefenderDefinition2],40);
            base.influencedByOwnerInputs = true;
            const MAX_ANGLE_RANGE = PI2 / 6; // keep within 90º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * ((i / 3) - 1 / (3 * 2));
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;


            base.positionData.values.x = Math.cos(angle) * (this.physicsData.size / 2 + (20)) - Math.sin(angle) * -0.575 * this.physicsData.values.size;
            base.positionData.values.y = Math.sin(angle) * (this.physicsData.size / 2 + (20)) + Math.cos(angle) * -0.575 * this.physicsData.values.size;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                //base.positionData.y = (this.physicsData.values.size + (20)) * Math.sin(angle) * 0.8;
                //base.positionData.x = (this.physicsData.values.size + (20)) * Math.cos(angle) * 0.8;

                base.positionData.x = Math.cos(angle) * (this.physicsData.size / 2 + (10)) - Math.sin(angle) * -0.575 * this.physicsData.values.size;
                base.positionData.y = Math.sin(angle) * (this.physicsData.size / 2 + (10)) + Math.cos(angle) * -0.575 * this.physicsData.values.size;

                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;

            }
        }
    }

    public get sizeFactor() {
        return (this.physicsData.values.size / Math.SQRT1_2) / DEFENDER_SIZE;
    }

    public tick(tick: number) {
       super.tick(tick);

        if (this.ai.state !== AIState.possessed) {
            this.positionData.angle += this.ai.passiveRotation * Math.PI * Math.SQRT1_2;
        }
    }
}
