"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payloadValidator = void 0;
const ethers_1 = require("ethers");
const types_1 = require("../types");
const utils_1 = require("ethers/lib/utils");
const hasAddress = (p) => "address" in p && (0, utils_1.isAddress)(p.address);
const hasAbi = (p) => "abi" in p && Array.isArray(p.abi) && p.abi.length > 0;
const hasEType = (p) => "type" in p && types_1.eventTypes.includes(p.type);
const hasTriggerValue = (p) => {
    if ("triggerValue" in p) {
        try {
            const casted = ethers_1.BigNumber.from(p.triggerValue);
            return casted._isBigNumber;
        }
        catch (e) {
            return false;
        }
    }
    return false;
};
const hasLabel = (p) => "label" in p && typeof p.label === "string" && p.label.length > 0;
const validators = [hasAddress, hasAbi, hasEType, hasTriggerValue, hasLabel];
const payloadValidator = (p) => {
    const valid = validators.map((cb) => cb(p));
    if (valid.indexOf(false) !== -1)
        return false;
    return true;
};
exports.payloadValidator = payloadValidator;
