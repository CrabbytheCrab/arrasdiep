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
import LivingEntity from "../Live";
import AbstractShape from "./AbstractShape";

import { Color, PositionFlags, StyleFlags } from "../../Const/Enums";
import { AI, AIState } from "../AI";
import { BarrelBase } from "../Tank/TankBody";
import Crasher from "./Crasher";
import { Entity } from "../../Native/Entity";
import AutoTurret from "../Tank/AutoTurret";
import { BarrelDefinition } from "../../Const/TankDefinitions";
import Barrel from "../Tank/Barrel";
import { normalizeAngle, PI2 } from "../../util";

/**
 * Crasher entity class.
 */
 export class Sentry extends Crasher implements BarrelBase {
    public sizeFactor: number;
    public cameraEntity: Entity = this;
    public inputs;
    public reloadTime = 4;
    public constructor(game: GameServer, large=true) {
        super(game, large);
        this.nameData.values.name = "Sentry";
        this.healthData.values.health = this.healthData.values.maxHealth = 500;
        this.damagePerTick = 12
        this.physicsData.values.size =  75 * Math.SQRT1_2;
        this.physicsData.values.sides = 3;
        this.physicsData.values.absorbtionFactor = 0.1;
        this.physicsData.values.pushFactor =  12;
       
        this.targettingSpeed = 1.2;
        this.styleData.values.color = Color.EnemyCrasher;

        this.scoreReward = 450;
        this.sizeFactor = this.physicsData.values.size / 50;
        this.inputs = this.ai.inputs;
        this.isLarge = true
        const rand = Math.random();
        if(rand < 0.33){
            const base = new AutoTurret(this, {
                angle: 0,
                offset: 0,
                size: 55,
                width: 42 * 0.8,
                delay: 0.01,
                reload: 2,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: null,
                bullet: {
                    type: "bullet",
                    health: 2,
                    damage: 3,
                    speed: 1.4,
                    scatterRate: 1,
                    lifeLength: 1,
                    sizeRatio: 1,
                    absorbtionFactor: 0.5
                }
            },30)
            base.influencedByOwnerInputs = true
        }else if(rand < 0.66){
            let barsss: Barrel;
            let GuardianSpawnerDefinition: BarrelDefinition = {
                angle: Math.PI,
                offset: 0,
                size: 60,
                width: 42,
                delay: 0,
                reload: 4,
                recoil: 0,
                isTrapezoid: true,
                trapezoidDirection: Math.PI,
                addon: null,
                droneCount: 600,
                canControlDrones: true,
                bullet: {
                    type: "swarm",
                    sizeRatio: 0.8,
                    health: 2.5,
                    damage: 1.25,
                    speed: 2,
                    scatterRate: 0,
                    lifeLength: 1,
                    absorbtionFactor: 0.8
                }
            };
            barsss = new Barrel(this, GuardianSpawnerDefinition);
        }
        else{
            const base = new AutoTurret(this, {
                angle: 0,
                offset: 0,
                size: 45,
                width: 42 * 0.8,
                delay: 0.01,
                reload: 4,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: "trapLauncher",
                bullet: {
                    type: "trap",
                    health: 4,
                    damage: 4,
                    speed: 2,
                    scatterRate: 1,
                    lifeLength: 6,
                    sizeRatio: 0.8,
                    absorbtionFactor: 0.5
                }
            }, 30)
            base.influencedByOwnerInputs = true
        }

        //this.barsss = new Barrel(this, GuardianSpawnerDefinition2);
        //this.positionData.values.flags |= PositionFlags.canMoveThroughWalls;
    }
}
