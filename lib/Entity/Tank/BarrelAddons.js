"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarrelAddonById = exports.AssLauncherAddon = exports.AssLauncher = exports.EngiLauncherAddon = exports.EngiLauncher3 = exports.EngiLauncher2 = exports.EngiLauncher1 = exports.BuilderLauncherAddon = exports.BuilderLauncher = exports.MinionLauncherAddon = exports.MinionLauncher2 = exports.MinionLauncher = exports.TrapLauncherAddon = exports.TrapLauncher = exports.BarrelAddon = void 0;
const Object_1 = __importDefault(require("../Object"));
class BarrelAddon {
    constructor(owner) {
        this.owner = owner;
        this.game = owner.game;
    }
}
exports.BarrelAddon = BarrelAddon;
class TrapLauncher extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 1 | 4;
        this.styleData.values.color = 1;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width;
        this.physicsData.values.size = barrel.physicsData.values.width * (20 / 42);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (20 / 42);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.TrapLauncher = TrapLauncher;
class TrapLauncherAddon extends BarrelAddon {
    constructor(owner) {
        super(owner);
        this.launcherEntity = new TrapLauncher(owner);
    }
}
exports.TrapLauncherAddon = TrapLauncherAddon;
class MinionLauncher extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 4;
        this.styleData.values.color = 1;
        this.styleData.values.flags |= 64;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.35;
        this.physicsData.values.size = barrel.physicsData.values.size * (12.5 / 50);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.35;
        this.physicsData.size = this.barrelEntity.physicsData.values.size * (12.5 / 50);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.MinionLauncher = MinionLauncher;
class MinionLauncher2 extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 4;
        this.styleData.values.color = 1;
        this.styleData.values.flags |= 64;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.35;
        this.physicsData.values.size = barrel.physicsData.values.size * (42.5 / 50);
        this.positionData.values.x = (-barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.35;
        this.physicsData.size = this.barrelEntity.physicsData.values.size * (42.5 / 50);
        this.positionData.x = (-this.barrelEntity.physicsData.size + this.physicsData.size) / 2;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.MinionLauncher2 = MinionLauncher2;
class MinionLauncherAddon extends BarrelAddon {
    constructor(owner) {
        super(owner);
        this.launcherEntity = new MinionLauncher(owner);
        this.launcherEntity = new MinionLauncher2(owner);
    }
}
exports.MinionLauncherAddon = MinionLauncherAddon;
class BuilderLauncher extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 1 | 4;
        this.styleData.color = this.barrelEntity.styleData.color;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width / 1.75 * 1.15;
        this.physicsData.values.size = barrel.physicsData.values.width * (25 / 42);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    resize() {
        this.styleData.color = this.barrelEntity.styleData.color;
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width / 1.75 * 1.15;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (25 / 42);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.BuilderLauncher = BuilderLauncher;
class BuilderLauncherAddon extends BarrelAddon {
    constructor(owner) {
        super(owner);
        this.launcherEntity = new BuilderLauncher(owner);
    }
}
exports.BuilderLauncherAddon = BuilderLauncherAddon;
class EngiLauncher1 extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 1 | 4;
        this.styleData.color = this.barrelEntity.styleData.color;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width / 1.75 * 1.15 * 1.25;
        this.physicsData.values.size = barrel.physicsData.values.width * (25 / 42) * 1.25;
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    resize() {
        this.styleData.color = this.barrelEntity.styleData.color;
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width / 1.75 * 1.15 * 1.25;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (25 / 42) * 1.25;
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.EngiLauncher1 = EngiLauncher1;
class EngiLauncher2 extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 4;
        this.styleData.values.color = 1;
        this.styleData.values.flags |= 64;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.25;
        this.physicsData.values.size = barrel.physicsData.values.size * (10 / 50);
        this.positionData.values.x = (barrel.physicsData.values.size - (this.physicsData.values.size)) / 2;
    }
    resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.25;
        this.physicsData.size = this.barrelEntity.physicsData.values.size * (10 / 50);
        this.positionData.x = (this.barrelEntity.physicsData.values.size - (this.physicsData.values.size)) / 2;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.EngiLauncher2 = EngiLauncher2;
class EngiLauncher3 extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 4;
        this.styleData.values.color = 1;
        this.styleData.values.flags |= 64;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.25;
        this.physicsData.values.size = barrel.physicsData.values.size * (35 / 50);
        this.positionData.values.x = (-barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }
    resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.25;
        this.physicsData.size = this.barrelEntity.physicsData.values.size * (35 / 50);
        this.positionData.x = (-this.barrelEntity.physicsData.size + this.physicsData.size) / 2;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.EngiLauncher3 = EngiLauncher3;
class EngiLauncherAddon extends BarrelAddon {
    constructor(owner) {
        super(owner);
        this.launcherEntity = new EngiLauncher1(owner);
        this.launcherEntity = new EngiLauncher2(owner);
        this.launcherEntity = new EngiLauncher3(owner);
    }
}
exports.EngiLauncherAddon = EngiLauncherAddon;
class AssLauncher extends Object_1.default {
    constructor(barrel) {
        super(barrel.game);
        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = 1 | 4;
        this.styleData.color = 0;
        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width / 1.75 * 1.15;
        this.physicsData.values.size = barrel.physicsData.values.width * (25 / 42);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    resize() {
        this.styleData.color = 0;
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width / 1.75 * 1.15;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (25 / 42);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 3.5;
    }
    tick(tick) {
        super.tick(tick);
        this.resize();
    }
}
exports.AssLauncher = AssLauncher;
class AssLauncherAddon extends BarrelAddon {
    constructor(owner) {
        super(owner);
        this.launcherEntity = new AssLauncher(owner);
    }
}
exports.AssLauncherAddon = AssLauncherAddon;
exports.BarrelAddonById = {
    trapLauncher: TrapLauncherAddon,
    minionLauncher: MinionLauncherAddon,
    builderLauncher: BuilderLauncherAddon,
    assLauncher: AssLauncherAddon,
    engiLauncher: EngiLauncherAddon
};
