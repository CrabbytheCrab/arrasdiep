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

import { BarrelDefinition } from "../../Const/TankDefinitions";
import { PI2, normalizeAngle } from "../../util";

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
    offset: 28,
    size: 120,
    width: 33.9,
    delay: 0.5,
    reload: 1.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 2,
        damage: 2,
        speed: 1,
        scatterRate: 0.3,
        lifeLength: 4,
        absorbtionFactor: 0.1
    }
}

const DefenderDefinition2: BarrelDefinition = {
    angle: 0,
    offset: -28,
    size: 120,
    width: 33.9,
    delay: 0,
    reload: 1.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 2,
        damage: 2,
        speed: 1,
        scatterRate: 0.3,
        lifeLength: 4,
        absorbtionFactor: 0.1
    }
}
const DefenderDefinition3: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 220,
    width: 84,
    delay: 0,
    reload: 7,
    recoil: 0,
    droneCount:2,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    canControlDrones:true,
    bullet: {
        type: "drone",
        sizeRatio: 1,
        health: 5,
        damage: 3,
        speed: 1,
        scatterRate: 0.3,
        lifeLength: -1,
        absorbtionFactor: 0.1
    }
}

const Boomer1: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 85 * 1.5,
    width: 56.7 * 1.5,
    delay: 0,
    reload: 2.5,
    recoil: 3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "builderLauncher",
    bullet: {
        type: "boomer",
        sizeRatio: 0.8,
        health: 3,
        damage: 2.5,
        speed: 3,
        scatterRate: 1,
        lifeLength: 5,
        absorbtionFactor: 0.4
    }
}

const Boomer2: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65 * 1.5,
    width: 56.7 * 1.5,
    delay: 0,
    reload: 2.5,
    recoil: 3,
    isTrapezoid: true,
    trapezoidDirection:  3.141592653589793,
    droneCount:0,
    addon: null,
    bullet: {
        type: "drone",
        sizeRatio: 0.25,
        health: 3,
        damage: 1,
        speed: 0.45,
        scatterRate: 1,
        lifeLength: 1,
        absorbtionFactor: 0.1
    }
}

// The size of a Defender by default
const DEFENDER_SIZE = 200;

/**
 * Class which represents the boss "Defender"
 */
export default class NestKeeper extends AbstractBoss {

    /** Defender's trap launchers */
    private trappers: Barrel[] = [];
    /** See AbstractBoss.movementSpeed */
    public movementSpeed = 0.35;

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = 'Nest Keeper';
        this.styleData.values.color = Color.EnemyPentagon;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = DEFENDER_SIZE * Math.SQRT1_2;
        this.scoreReward = 50000 * this.game.arena.shapeScoreRewardMultiplier;

        this.physicsData.values.sides = 5;
        const base = new AutoTurret(this, [Boomer1,Boomer2], 75);
        base.ai.viewRange = 0
        base.influencedByOwnerInputs = true
        this.ai.viewRange = 4000
        base.styleData.values.color = this.styleData.values.color
        for (let i = 0; i < 5; ++i) {

            // TODO:
            // Maybe make this into a class of itself - DefenderAutoTurret
            const base = new AutoTurret(this, [DefenderDefinition2,DefenderDefinition],75);
            base.influencedByOwnerInputs = true;
            const MAX_ANGLE_RANGE = PI2 / 6; // keep within 90º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 5);
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;


            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * 1.2;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * 1.2;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * 1.2;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * 1.2;

                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;

            }
        }
        for (let i = 0; i < 5; ++i) {
            // Add trap launcher
            this.trappers.push(new Barrel(this, {
                ...DefenderDefinition3,
                angle: PI2 * ((i / 5) - 1 / 10)
            }));
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
