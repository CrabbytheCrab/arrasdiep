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

import { Color, Tank, PositionFlags } from "../../Const/Enums";
import { AIState } from "../AI";

import TankDefinitions, { BarrelDefinition } from "../../Const/TankDefinitions";
import { PI2 } from "../../util";

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
const EliteDestroyerDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 105,
    width: 105 * 1.2,
    delay: 0,
    reload: 6,
    recoil: 2,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "minionLauncher",
    canControlDrones:true,
    droneCount: 3,
    bullet: {
        type: "sentry1",
        sizeRatio: 1,
        health: 12.5,
        damage: 8,
        speed: 0.5,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 0,
    }
}
const EliteDestroyerDefinition2: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 105,
    width: 105 * 1.2,
    delay: 0,
    reload: 6,
    recoil: 2,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "minionLauncher",
    canControlDrones:true,
    droneCount:3,
    bullet: {
        type: "sentry2",
        sizeRatio: 1,
        health: 12.5,
        damage: 8,
        speed: 0.5,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 0,
    }
}
const EliteDestroyerDefinition3: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 105,
    width: 105 * 1.2,
    delay: 0,
    reload: 6,
    recoil: 2,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "minionLauncher",
    canControlDrones:true,
    droneCount:3,
    bullet: {
        type: "sentry3",
        sizeRatio: 1,
        health: 12.5,
        damage: 8,
        speed: 0.5,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 0,
    }
}
const TripletDefinition1: BarrelDefinition = {
    angle: 0,
    offset: -26,
    size: 95,
    width: 42,
    delay: 0,
    reload: 1,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 5,
        damage: 0.4,
        speed: 1,
        scatterRate: 1,
        lifeLength: 2,
        absorbtionFactor: 1,
    }
}
const TripletDefinition2: BarrelDefinition = {
    angle: 0,
    offset: 26,
    size: 95,
    width: 42,
    delay: 0.5,
    reload: 1.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 5,
        damage: 0.4,
        speed: 1,
        scatterRate: 1,
        lifeLength: 2,
        absorbtionFactor: 1,
    }
}
// The size of a Defender by default
const DEFENDER_SIZE = 150;

/**
 * Class which represents the boss "Defender"
 */
export default class EliteSpawner extends AbstractBoss {

    /** Defender's trap launchers */
    private trappers: Barrel[] = [];
    /** See AbstractBoss.movementSpeed */
    public movementSpeed = 0.35;

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = 'Elite Spawner';
        this.styleData.values.color = Color.EnemyCrasher;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = DEFENDER_SIZE * Math.SQRT1_2;
        this.trappers.push(new Barrel(this, {
            ...EliteDestroyerDefinition,
            angle: PI2 * ((1 / 3) - 1 / 6)
        }));
        this.trappers.push(new Barrel(this, {
            ...EliteDestroyerDefinition2,
            angle: PI2 * ((2 / 3) - 1 / 6)
        }));
        this.trappers.push(new Barrel(this, {
            ...EliteDestroyerDefinition3,
            angle: PI2 * ((3 / 3) - 1 / 6)
        }));
        this.physicsData.values.sides = 3;
        const base = new AutoTurret(this, [TripletDefinition2,TripletDefinition1], 62.5);
        base.styleData.values.color = this.styleData.values.color

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
