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
    offset: 0,
    size: 60,
    width: 42 * 1.3,
    delay: 0,
    reload: 3,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "trapLauncher",
    forceFire: true,
    bullet: {
        type: "trap",
        sizeRatio: 0.8,
        health: 3,
        damage: 4,
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
    width: 84 * 1.5,
    delay: 0,
    reload: 9,
    recoil: 0,
    droneCount:2,
    isTrapezoid: true,
    trapezoidDirection: Math.PI,
    addon: null,
    canControlDrones:true,
    bullet: {
        type: "rogueminion",
        sizeRatio: 0.5,
        health: 4,
        damage: 4,
        speed: 0.5,
        scatterRate: 0.3,
        lifeLength: -1,
        absorbtionFactor: 0.1
    }
}

// The size of a Defender by default
const DEFENDER_SIZE = 200;

/**
 * Class which represents the boss "Defender"
 */
export default class RoguePalisade extends AbstractBoss {

    /** Defender's trap launchers */
    private trappers: Barrel[] = [];
    /** See AbstractBoss.movementSpeed */
    public movementSpeed = 0.35;

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = 'Rogue Palisade';
        this.styleData.values.color = Color.Border;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = DEFENDER_SIZE * Math.SQRT1_2;
        this.scoreReward = 50000 * this.game.arena.shapeScoreRewardMultiplier;

        this.physicsData.values.sides = 6;
        this.ai.viewRange = 4000
        for (let i = 0; i < 6; ++i) {

            // TODO:
            // Maybe make this into a class of itself - DefenderAutoTurret
            const base = new AutoTurret(this, [DefenderDefinition],37.5);
            const MAX_ANGLE_RANGE = PI2 / 6; // keep within 90º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 6);
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;


            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * 1.4;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * 1.4;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * 1.4;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * 1.4

                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;

            }
        }
        for (let i = 0; i < 6; ++i) {
            // Add trap launcher
            this.trappers.push(new Barrel(this, {
                ...DefenderDefinition3,
                angle: PI2 * ((i / 6) - 1 / 12)
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
