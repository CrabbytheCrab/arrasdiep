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

import Barrel from "../Barrel";
import Bullet from "./Bullet";

import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { Entity } from "../../../Native/Entity";
import { AI, AIState, Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import AutoTurret from "../AutoTurret";

/**
 * The drone class represents the drone (projectile) entity in diep.
 */
export default class SentryDrone extends Bullet  implements BarrelBase{
    /** The AI of the drone (for AI mode) */
    public ai: AI;

    /** The drone's radius of resting state */
    public static MAX_RESTING_RADIUS = 400 ** 2;

    /** Used let the drone go back to the player in time. */
    public restCycle = true;
    public sizeFactor: number;
    public cameraEntity: Entity;
    public inputs = new Inputs();
    /** Cached prop of the definition. */
    protected canControlDrones: boolean;
    public reloadTime = 4;

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number, variant:number) {
        super(barrel, tank, tankDefinition, shootAngle);

        const bulletDefinition = barrel.definition.bullet;

        this.usePosAngle = true;
        this.cameraEntity = tank.cameraEntity;
        this.ai = new AI(this);
        this.ai.viewRange = 1750 * tank.sizeFactor;
        this.ai.targetFilter = (targetPos) => (targetPos.x - this.tank.positionData.values.x) ** 2 + (targetPos.y - this.tank.positionData.values.y) ** 2 <= this.ai.viewRange ** 2; // (1000 ** 2) 1000 radius
        this.canControlDrones = typeof this.barrelEntity.definition.canControlDrones === 'boolean' && this.barrelEntity.definition.canControlDrones;
        this.physicsData.values.sides = bulletDefinition.sides ?? 3;
        if (this.physicsData.values.flags & PhysicsFlags.noOwnTeamCollision) this.physicsData.values.flags ^= PhysicsFlags.noOwnTeamCollision;
        this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;
        this.styleData.values.flags &= ~StyleFlags.hasNoDmgIndicator;

        if (barrel.definition.bullet.lifeLength !== -1) {
            this.lifeLength = 88 * barrel.definition.bullet.lifeLength;
        } else {
            this.lifeLength = Infinity;
            if (this.physicsData.values.flags & PhysicsFlags.canEscapeArena) this.physicsData.values.flags ^= PhysicsFlags.canEscapeArena;
        }
        this.deathAccelFactor = 1;

        this.baseSpeed /= 3;

        barrel.droneCount += 1;

        this.ai.movementSpeed = this.ai.aimSpeed = this.baseAccel;
        this.healthData.values.health = this.healthData.values.maxHealth = 500;
        this.physicsData.values.sides = 3;
        this.physicsData.values.absorbtionFactor = 0.1;
        this.physicsData.values.pushFactor =  12;
        this.physicsData.values.size =  75 * Math.SQRT1_2;
        this.sizeFactor = this.physicsData.values.size / 50;
        if(variant == 0){
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
        }
        if(variant == 1){
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
        if(variant == 2){
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
    }

    /** Extends LivingEntity.destroy - so that the drone count decreases for the barrel. */
    public destroy(animate=true) {
        if (!animate) this.barrelEntity.droneCount -= 1;

        super.destroy(animate);
    }
    
    /** This allows for factory to hook in before the entity moves. */
    protected tickMixin(tick: number) {
        super.tick(tick);
    }

    public tick(tick: number) {
        const usingAI = !this.canControlDrones || this.tank.inputs.deleted || (!this.tank.inputs.attemptingShot() && !this.tank.inputs.attemptingRepel());
        const inputs = !usingAI ? this.tank.inputs : this.ai.inputs;
        this.damagePerTick = 12
        this.physicsData.values.size =  75 * Math.SQRT1_2;
        if (usingAI && this.ai.state === AIState.idle) {
            const delta = {
                x: this.positionData.values.x - this.tank.positionData.values.x,
                y: this.positionData.values.y - this.tank.positionData.values.y
            }
            const base = this.baseAccel;

            // still a bit inaccurate, works though
            let unitDist = (delta.x ** 2 + delta.y ** 2) / SentryDrone.MAX_RESTING_RADIUS;
            if (unitDist <= 1 && this.restCycle) {
                this.baseAccel /= 6;
                this.positionData.angle += 0.01 + 0.012 * unitDist;
            } else {
                const offset = Math.atan2(delta.y, delta.x) + Math.PI / 2
                delta.x = this.tank.positionData.values.x + Math.cos(offset) * this.tank.physicsData.values.size * 1.2 - this.positionData.values.x;
                delta.y = this.tank.positionData.values.y + Math.sin(offset) * this.tank.physicsData.values.size * 1.2 - this.positionData.values.y;
                this.positionData.angle = Math.atan2(delta.y, delta.x);
                if (unitDist < 0.5) this.baseAccel /= 3;
                this.restCycle = (delta.x ** 2 + delta.y ** 2) <= 4 * (this.tank.physicsData.values.size ** 2);
            }

            if (!Entity.exists(this.barrelEntity)) this.destroy();

            this.tickMixin(tick);

            this.baseAccel = base;

            return;
        } else {
            this.positionData.angle = Math.atan2(inputs.mouse.y - this.positionData.values.y, inputs.mouse.x - this.positionData.values.x);
            this.restCycle = false
        }


        
        if (this.canControlDrones && inputs.attemptingRepel()) {
            this.positionData.angle += Math.PI; 
        }

        // So that switch tank works, as well as on death
        if (!Entity.exists(this.barrelEntity)) this.destroy();

        this.tickMixin(tick);
    }
}
