"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payloadValidator = void 0;
const ethers_1 = require("ethers");
const types_1 = require("../types");
const utils_1 = require("ethers/lib/utils");
const hasAddress = (p) => ("address" in p && utils_1.isAddress(p.address));
const hasAbi = (p) => ("abi" in p && Array.isArray(p.abi) && p.abi.length > 0);
const hasEName = (p) => ("eventName" in p && typeof p.eventName === "string" && p.eventName.length > 0);
const hasEType = (p) => ("type" in p && types_1.eventTypes.includes(p.type));
const hasEField = (p) => ("eventField" in p && typeof p.eventField === "string" && p.eventField.length > 0);
const hasTriggerValue = (p) => ("triggerValue" in p && (["bigint", "number"].includes(typeof p.triggerValue) || utils_1.isBytesLike(p.triggerValue) || ethers_1.BigNumber.isBigNumber(p.triggerValue)));
const hasLabel = (p) => ("label" in p && typeof p.label === "string" && p.label.length > 0);
const validators = [hasAddress, hasAbi, hasEName, hasEType, hasEField, hasTriggerValue, hasLabel];
const payloadValidator = (p) => {
    const valid = validators.map((cb) => cb(p));
    if (valid.indexOf(false) !== -1)
        return false;
    return true;
};
exports.payloadValidator = payloadValidator;
//# sourceMappingURL=types.js.map