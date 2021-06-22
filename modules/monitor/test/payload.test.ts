import { payloadValidator } from "@dodo/trading-monitor";
import { AddressZero } from "@ethersproject/constants";
import {expect} from "chai"
import "mocha"

const cleanPayload: any =  {
    abi: ['event Transfer'],
    address: AddressZero,
    eventField: 'value',
    eventName: 'Transfer',
    label: 'Foo Bar',
    triggerValue: 200,
    type: 'arbitrage'
}

describe.only('[payload validator]', () => {
    it('Should return true for valid object', () => {
        expect(payloadValidator(cleanPayload)).to.eql(true)
    })

    it('Should return false for malformed abi', () => {
        const notArray = {...cleanPayload, abi: 'foo'}
        expect(payloadValidator(notArray)).to.eql(false)
        const emptyArray = {...cleanPayload, abi: []}
        expect(payloadValidator(emptyArray)).to.eql(false)
        const noAbi = {...cleanPayload}
        delete noAbi.abi;
        expect(payloadValidator(noAbi)).to.eql(false)
    })

    it('Should return false for malformed address', () => {
        const notAddress = {...cleanPayload, address: '1234564xp'}
        expect(payloadValidator(notAddress)).to.eql(false)
        const noAddress = {...cleanPayload}
        delete noAddress.address
        expect(payloadValidator(noAddress)).to.eql(false)        
    })

    it('Should return false for malformed eventField', () => {
        const notEventField = {...cleanPayload, eventField: []}
        expect(payloadValidator(notEventField)).to.eql(false)
        const noEventField = {...cleanPayload}
        delete noEventField.eventField
        expect(payloadValidator(noEventField)).to.eql(false)        
    })

    it('Should return false for malformed eventName', () => {
        const notEventName = {...cleanPayload, eventName: 1245}
        expect(payloadValidator(notEventName)).to.eql(false)
        const noEventName = {...cleanPayload}
        delete noEventName.eventName
        expect(payloadValidator(noEventName)).to.eql(false)        
    })

    it('Should return false for malformed label', () => {
        const notLabel = {...cleanPayload, label: []}
        expect(payloadValidator(notLabel)).to.eql(false)
        const noLabel = {...cleanPayload}
        delete noLabel.label
        expect(payloadValidator(noLabel)).to.eql(false)        
    })

    it('Should return false for malformed triggerValue', () => {
        const notTValue = {...cleanPayload, triggerValue: '1234564xp'}
        expect(payloadValidator(notTValue)).to.eql(false)
        const noTValue = {...cleanPayload}
        delete noTValue.triggerValue
        expect(payloadValidator(noTValue)).to.eql(false)        
    })

    it('Should return false for malformed eventType', () => {
        const notEType = {...cleanPayload, address: 'testSwap'}
        expect(payloadValidator(notEType)).to.eql(false)
        const noEType = {...cleanPayload}
        delete noEType.type
        expect(payloadValidator(noEType)).to.eql(false)        
    })
})