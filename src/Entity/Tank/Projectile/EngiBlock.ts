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
import * as util from "../../../util";
import Bullet from "./Bullet";

import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import { TankDefinition } from "../../../Const/TankDefinitions";
import TankBody, { BarrelBase } from "../TankBody";
import { DevTank } from "../../../Const/DevTankDefinitions";
import { PI2 } from "../../../util";
import ObjectEntity from "../../Object";
import LivingEntity from "../../Live";
import AutoTurret from "../AutoTurret";
import { Entity } from "../../../Native/Entity";
import { Inputs } from "../../AI";

/**
 * The trap class represents the trap (projectile) entity in diep.
 */
export default class EngiPillBox extends Bullet implements BarrelBase {
    /** Number of ticks before the trap cant collide with its own team. */
    protected collisionEnd = 0;
    protected parent: ObjectEntity;
    public XMouse : number;
    public angles : number
    public static MAX_RESTING_RADIUS = 400 ** 2;
    public YMouse : number;
    public tic : number;
    public sizeFactor: number;
    public cameraEntity: Entity;
    public inputs = new Inputs();
    /** Cached prop of the definition. */
    public reloadTime = 15;
    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number, parent?: ObjectEntity) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.sizeFactor = this.physicsData.values.size / 50;
        this.usePosAngle = false;
        this.tic = 5
        const bulletDefinition = barrel.definition.bullet;
        this.parent = parent ?? tank;
        this.XMouse = 0
        this.YMouse = 0
        if(this.parent instanceof TankBody){
        this.XMouse = this.parent.inputs.mouse.x
        this.YMouse = this.parent.inputs.mouse.y
        }
        this.baseSpeed = (barrel.bulletAccel / 2) + 30 - Math.random() * barrel.definition.bullet.scatterRate;
        //this.baseAccel = 0;
        this.physicsData.values.sides = bulletDefinition.sides ?? 4;
        this.cameraEntity = tank.cameraEntity;

        const atuo = new AutoTurret(this, {
            angle: 0,
            offset: 0,
            size: 65,
            width: 33.6,
            delay: 0.21,
            reload: 3,
            recoil: 0,
            isTrapezoid: false,
            trapezoidDirection: 0,
            addon: null,
            bullet: {
                type: "bullet",
                sizeRatio: 1,
                health: 1,
                damage: 0.45,
                speed: 1.2,
                scatterRate: 1,
                lifeLength: 0.75,
                absorbtionFactor: 0.1
            }
        });
            atuo.baseSize *= 1.25
          //  atuo.positionData.values.angle = shootAngle
    atuo.positionData.values.angle = shootAngle
    atuo.ai.viewRange = 1000
        //this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;
        this.styleData.values.flags |= StyleFlags.isStar;
        this.styleData.values.flags &= ~StyleFlags.hasNoDmgIndicator;
        this.angles = Math.atan2(( this.YMouse - this.positionData.values.y), (this.XMouse - this.positionData.values.x));
        this.collisionEnd = this.lifeLength >> 3;
        this.lifeLength = (600 * barrel.definition.bullet.lifeLength) >> 3;
        
        // Check this?
        this.positionData.values.angle = Math.random() * PI2;
    }
    public onKill(killedEntity: LivingEntity) {
        // TODO(ABC):
        // Make this, work differently
        /** @ts-ignore */
        if (typeof this.parent.onKill === 'function') this.parent.onKill(killedEntity);
    }
    public tick(tick: number) {
        super.tick(tick);
        const delta = {
            x: this.XMouse - this.positionData.values.x,
            y: this.YMouse - this.positionData.values.y
        }
        this.positionData.angle +=  util.constrain(util.constrain(this.velocity.angleComponent(this.movementAngle) * .05, 0, 0.5) - util.constrain(this.velocity.magnitude, 0, 0.2) * 0.5, 0, 0.8);
        //this.movementAngle +=  (Math.atan2(delta.y, delta.x) - this.movementAngle) * 0.1
        if(this.tic > 0){
            if(tick - this.spawnTick >= (this.lifeLength/32)){
                this.movementAngle +=  (Math.atan2(delta.y, delta.x) - this.movementAngle) * 0.75
            }
        }
        let dist = (delta.x ** 2 + delta.y ** 2) / EngiPillBox.MAX_RESTING_RADIUS;


        if(this.tic == 0){
            this.baseAccel = 0;
            this.baseSpeed = 0;
            this.velocity.x = 0
            this.velocity.y = 0
            if (this.physicsData.values.flags & PhysicsFlags.onlySameOwnerCollision) this.physicsData.flags ^= PhysicsFlags.onlySameOwnerCollision;
            this.physicsData.values.flags |= PhysicsFlags.noOwnTeamCollision;
        }
        if (dist < 1 && this.tic > 0) {
            this.tic --
            this.baseAccel/=2
            this.baseSpeed/=2
        }
    }
}