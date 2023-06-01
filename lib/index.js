"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannedClients = void 0;
const fs = __importStar(require("fs"));
const uWebSockets_js_1 = require("uWebSockets.js");
const Client_1 = __importDefault(require("./Client"));
const config = __importStar(require("./config"));
const util = __importStar(require("./util"));
const Game_1 = __importDefault(require("./Game"));
const TankDefinitions_1 = __importDefault(require("./Const/TankDefinitions"));
const Commands_1 = require("./Const/Commands");
const Enums_1 = require("./Const/Enums");
const PORT = config.serverPort;
const ENABLE_API = config.enableApi && config.apiLocation;
const ENABLE_CLIENT = config.enableClient && config.clientLocation && fs.existsSync(config.clientLocation);
if (ENABLE_API)
    util.log(`Rest API hosting is enabled and is now being hosted at /${config.apiLocation}`);
if (ENABLE_CLIENT)
    util.log(`Client hosting is enabled and is now being hosted from ${config.clientLocation}`);
exports.bannedClients = new Set();
const connections = new Map();
const allClients = new Set();
const app = (0, uWebSockets_js_1.App)({});
const games = [];
app.ws("/*", {
    compression: uWebSockets_js_1.SHARED_COMPRESSOR,
    sendPingsAutomatically: true,
    maxPayloadLength: config.wssMaxMessageSize,
    idleTimeout: 10,
    upgrade: (res, req, context) => {
        res.upgrade({ client: null, ipAddress: "", gamemode: req.getUrl().slice(1) }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
    },
    open: (ws) => {
        const ipAddress = Buffer.from(ws.getRemoteAddressAsText()).toString();
        let conns = 0;
        if (connections.has(ipAddress))
            conns = connections.get(ipAddress);
        if (conns >= config.connectionsPerIp || exports.bannedClients.has(ipAddress)) {
            return ws.close();
        }
        connections.set(ipAddress, conns + 1);
        const game = games.find(({ gamemode }) => gamemode === ws.getUserData().gamemode);
        if (!game) {
            return ws.close();
        }
        const client = new Client_1.default(ws, game);
        allClients.add(client);
        ws.getUserData().ipAddress = ipAddress;
        ws.getUserData().client = client;
    },
    message: (ws, message, isBinary) => {
        const { client } = ws.getUserData();
        if (!client)
            throw new Error("Unexistant client for websocket");
        client.onMessage(message, isBinary);
    },
    close: (ws, code, message) => {
        const { client, ipAddress } = ws.getUserData();
        if (client) {
            connections.set(ipAddress, connections.get(ipAddress) - 1);
            client.onClose(code, message);
            allClients.delete(client);
        }
    }
});
app.get("/*", (res, req) => {
    util.saveToVLog("Incoming request to " + req.getUrl());
    res.onAborted(() => { });
    if (ENABLE_API && req.getUrl().startsWith(`/${config.apiLocation}`)) {
        switch (req.getUrl().slice(config.apiLocation.length + 1)) {
            case "/":
                res.writeStatus("200 OK");
                return res.end();
            case "/tanks":
                res.writeStatus("200 OK");
                return res.end(JSON.stringify(TankDefinitions_1.default));
            case "/servers":
                res.writeStatus("200 OK");
                return res.end(JSON.stringify(games.map(({ gamemode, name }) => ({ gamemode, name }))));
            case "/commands":
                res.writeStatus("200 OK");
                return res.end(JSON.stringify(config.enableCommands ? Object.values(Commands_1.commandDefinitions) : []));
            case "/colors":
                res.writeStatus("200 OK");
                return res.end(JSON.stringify(Enums_1.ColorsHexCode));
        }
    }
    if (ENABLE_CLIENT) {
        let file = null;
        let contentType = "text/html";
        switch (req.getUrl()) {
            case "/":
                file = config.clientLocation + "/index.html";
                contentType = "text/html";
                break;
            case "/loader.js":
                file = config.clientLocation + "/loader.js";
                contentType = "application/javascript";
                break;
            case "/input.js":
                file = config.clientLocation + "/input.js";
                contentType = "application/javascript";
                break;
            case "/dma.js":
                file = config.clientLocation + "/dma.js";
                contentType = "application/javascript";
                break;
            case "/config.js":
                file = config.clientLocation + "/config.js";
                contentType = "application/javascript";
                break;
        }
        res.writeHeader("Content-Type", contentType + "; charset=utf-8");
        if (file && fs.existsSync(file)) {
            res.writeStatus("200 OK");
            return res.end(fs.readFileSync(file));
        }
        res.writeStatus("404 Not Found");
        return res.end(fs.readFileSync(config.clientLocation + "/404.html"));
    }
});
app.listen(PORT, (success) => {
    if (!success)
        throw new Error("Server failed");
    util.log(`Listening on port ${PORT}`);
    const ffa = new Game_1.default("ffa", "FFA");
    const sbx = new Game_1.default("sandbox", "Sandbox");
    games.push(ffa, sbx);
    util.log((15) * (Math.PI / 180));
    util.saveToLog("Servers up", "All servers booted up.", 0x37F554);
    util.log("Dumping endpoint -> gamemode routing table");
    for (const game of games)
        console.log("> " + `localhost:${config.serverPort}/${game.gamemode}`.padEnd(40, " ") + " -> " + game.name);
});
process.on("uncaughtException", (error) => {
    util.saveToLog("Uncaught Exception", '```\n' + error.stack + '\n```', 0xFF0000);
    throw error;
});
