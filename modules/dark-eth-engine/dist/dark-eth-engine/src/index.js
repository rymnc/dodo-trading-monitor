"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var monitor_1 = require("./monitor");
var lodash_1 = require("lodash");
var trading_monitor_1 = require("@dodo/trading-monitor");
var sources_1 = require("@dodo/trading-monitor/dist/sources");
var libp2pSink_1 = require("./monitor/libp2pSink");
var from_string_1 = require("uint8arrays/from-string");
var redisRegistry_1 = require("../../eth-engine/src/monitor/redisRegistry");
var trading_monitor_2 = require("@dodo/trading-monitor");
var to_string_1 = require("uint8arrays/to-string");
var object_hash_1 = __importDefault(require("object-hash"));
var getEthSource = (0, lodash_1.memoize)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var provider, registry, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!process.env.WEBSOCKET_URL) return [3, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, (0, sources_1.getProvider)(process.env.WEBSOCKET_URL)];
            case 2:
                provider = _a.sent();
                registry = new redisRegistry_1.RedisRegistry({ id: 2 });
                return [2, new trading_monitor_1.EthSource({ id: 0, provider: provider, registry: registry })];
            case 3:
                e_1 = _a.sent();
                throw new Error(e_1.message);
            case 4: return [3, 6];
            case 5: throw new Error("[EthSource] WEBSOCKET_URL must be defined in env");
            case 6: return [2];
        }
    });
}); });
var getLibp2pSink = (0, lodash_1.memoize)(function () {
    return new libp2pSink_1.Libp2pSink({
        id: 1,
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var source, e_2, sink, ethMq;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, getEthSource()];
                case 1:
                    source = _a.sent();
                    return [3, 3];
                case 2:
                    e_2 = _a.sent();
                    console.error(e_2);
                    throw new Error("Could not connect to the Eth Node");
                case 3:
                    sink = getLibp2pSink();
                    return [4, sink.init()];
                case 4:
                    _a.sent();
                    console.log("Initialized Source and Sink");
                    ethMq = new monitor_1.EthLibp2p({ source: source, sink: sink });
                    console.log("Initialized Redis Connection");
                    try {
                        sink.node.pubsub.subscribe("dark-eth-engine-sub");
                    }
                    catch (e) {
                        console.error(e);
                    }
                    console.log("Subscribed to relevant channels");
                    sink.node.pubsub.on("message", function (message) { return __awaiter(_this, void 0, void 0, function () {
                        var uint8ParsedString, messageBody, toChannel, e_3, e_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 10, , 11]);
                                    uint8ParsedString = (0, to_string_1.toString)(message.detail.data);
                                    messageBody = JSON.parse(uint8ParsedString);
                                    if (!(0, trading_monitor_2.payloadValidator)(messageBody)) return [3, 8];
                                    if (!(message.detail.topic === "dark-eth-engine-sub")) return [3, 6];
                                    console.log("Subscribing to :", messageBody.address);
                                    toChannel = (0, object_hash_1.default)(messageBody);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 5]);
                                    return [4, ethMq.run(messageBody)];
                                case 2:
                                    _a.sent();
                                    return [3, 5];
                                case 3:
                                    e_3 = _a.sent();
                                    return [4, sink.node.pubsub.publish(toChannel, (0, from_string_1.fromString)(JSON.stringify({ error: true, reason: e_3.message })))];
                                case 4:
                                    _a.sent();
                                    return [3, 5];
                                case 5: return [3, 7];
                                case 6:
                                    ethMq.source.unsubscribe(messageBody);
                                    _a.label = 7;
                                case 7: return [3, 9];
                                case 8: throw new Error();
                                case 9: return [3, 11];
                                case 10:
                                    e_4 = _a.sent();
                                    console.error("[Main] received invalid subscribe request");
                                    return [3, 11];
                                case 11: return [2];
                            }
                        });
                    }); });
                    return [2];
            }
        });
    });
}
main()
    .then(function () { return console.log("Initialized Dark Eth Engine"); })
    .catch(function (e) { return console.error(e.message); });
