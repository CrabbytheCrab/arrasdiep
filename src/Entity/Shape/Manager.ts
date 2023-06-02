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

import ArenaEntity from "../../Native/Arena";
import GameServer from "../../Game";

import Crasher from "./Crasher";
import Pentagon from "./Pentagon";
import Triangle from "./Triangle";
import Square from "./Square";
import AbstractShape from "./AbstractShape";
import { removeFast } from "../../util";
import Egg from "./Egg";
import AlphaPentagon from "./AlphaPentagon";
import { Sentry } from "./Sentry";

/**
 * Used to balance out shape count in the arena, as well
 * as determines where each type of shape spawns around the arena.
 */

export default class ShapeManager {
    /** Current game server */
    protected game: GameServer;
    /** Arena whose shapes are being managed */
    protected arena: ArenaEntity;
    /** Stores all shapes */
    protected shapes: AbstractShape[] = [];

    public constructor(arena: ArenaEntity) {
        this.arena = arena;
        this.game = arena.game;
    }

    /**
     * Spawns a shape in a random location on the map.
     * Determines shape type by the random position chosen.
     */
    protected spawnShape(): AbstractShape {
        let shape: AbstractShape;
        const {x, y} = this.arena.findSpawnLocation();
        const rightX = this.arena.arenaData.values.rightX;
        const leftX = this.arena.arenaData.values.leftX;
        if (Math.max(x, y) < rightX / 10 && Math.min(x, y) > leftX / 10) {
            // Pentagon Nest
            const rand = Math.random();
            if (rand < .05) {
                shape = new AlphaPentagon(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            }else{
            shape = new Pentagon(this.game, Math.random() <= 0.1);

            shape.positionData.values.x = x;
            shape.positionData.values.y = y;
            shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            }
        } else if (Math.max(x, y) < rightX / 5 && Math.min(x, y) > leftX / 5) {
            // Crasher Zone
            const isBig = Math.random() < .2;
            const rand = Math.random();

            if (rand < .1) {
                shape = new Sentry(this.game, false);
            
                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            }else{
                shape = new Crasher(this.game, isBig);
            
                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            }
        } else {
            // Fields of Shapes
            const rand = Math.random();
            if (rand < .04) {
                shape = new Pentagon(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            } else if (rand < .14) { // < 10%
                shape = new Triangle(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            } else if (rand < .84) { // if rand < 70%
                shape = new Square(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            } else{ // if rand < 40%
                shape = new Egg(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
            for(let i = 0; i < 1 + (Math.random() * 6); ++i) {
                shape = new Egg(this.game);

                shape.positionData.values.x = x;
                shape.positionData.values.y = y;
                shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
                shape.scoreReward *= this.arena.shapeScoreRewardMultiplier;

                }
            }
        }

        shape.scoreReward *= this.arena.shapeScoreRewardMultiplier;

        return shape;
    }

    /** Kills all shapes in the arena */
    public killAll() {
        for(let i = 0; i < this.shapes.length; ++i) {
            this.shapes[i]?.delete();
        }
    }

    protected get wantedShapes() {
        return 1000;
    }

    public tick() {
        for (let i = this.wantedShapes; i --> 0;) {
            const shape = this.shapes[i];
            // Alternatively, Entity.exists(shape), though this is probably faster
            if (!shape || shape.hash === 0) this.shapes[i] = this.spawnShape();
        }
    }
}
