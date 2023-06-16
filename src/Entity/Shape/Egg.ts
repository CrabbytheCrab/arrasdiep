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
import AbstractShape from "./AbstractShape";

import { Color } from "../../Const/Enums";
import Pentagon from "./Pentagon";
import Square from "./Square";
import Triangle from "./Triangle";

export default class Egg extends AbstractShape {
    public timer:number
    public constructor(game: GameServer, shiny=Math.random() < 0.0001) {
        super(game);
        this.nameData.values.name = "Egg";
        this.healthData.values.health = this.healthData.values.maxHealth = 5;
        this.physicsData.values.size = 25 * Math.SQRT1_2;
        this.physicsData.values.sides = 1;
        this.styleData.values.color = shiny ? Color.Shiny : Color.White;
        this.timer = 0
        this.damagePerTick = 8;
        this.scoreReward = 2;
        this.isShiny = shiny;
this.shapeVelocity *= 4
        if (shiny) {
        this.nameData.values.name = "Gem";
        this.physicsData.values.sides = 6;
            this.scoreReward *= 1000;
            this.healthData.values.health = this.healthData.values.maxHealth *= 100;
        }
        
    }
    public tick(tick: number) {
        super.tick(tick);
        this.timer ++
        if(this.timer == 3000){
            this.destroy()
            const rand = Math.random();
            if (rand < .04) {
                let shape = new Pentagon(this.game, false, this.isShiny);

                shape.positionData.values.x = this.positionData.x;
                shape.positionData.values.y = this.positionData.y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.game.arena;
            } else if (rand < .16) { // < 10%
                let shape = new Triangle(this.game, this.isShiny);

                shape.positionData.values.x = this.positionData.x;
                shape.positionData.values.y = this.positionData.y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.game.arena;
            } else { // if rand < 70%
                let shape = new Square(this.game, this.isShiny);

                shape.positionData.values.x = this.positionData.x;
                shape.positionData.values.y = this.positionData.y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.game.arena;
            }
        }
    }
}
