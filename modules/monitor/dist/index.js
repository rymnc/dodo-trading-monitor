"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthEmail = exports.EthSource = exports.EmailSink = void 0;
const sinks_1 = require("./sinks");
Object.defineProperty(exports, "EmailSink", { enumerable: true, get: function () { return sinks_1.EmailSink; } });
const sources_1 = require("./sources");
Object.defineProperty(exports, "EthSource", { enumerable: true, get: function () { return sources_1.EthSource; } });
const middleware_1 = require("./middleware");
Object.defineProperty(exports, "EthEmail", { enumerable: true, get: function () { return middleware_1.EthEmail; } });
__exportStar(require("./middleware/types"), exports);
__exportStar(require("./middleware/ethEmail/types"), exports);
__exportStar(require("./sinks/types"), exports);
__exportStar(require("./sinks/email/types"), exports);
__exportStar(require("./sources/types"), exports);
__exportStar(require("./sources/eth/types"), exports);
