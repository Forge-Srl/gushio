import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {InputValueDelayedParser} from '../../runner/InputValueDelayedParser.js'

describe('InputValueDelayedParser', () => {
    let parser

    beforeEach(async () => {
       parser = new InputValueDelayedParser(async (raw, def) => Promise.resolve({raw: raw, default: def}), 'defaultValue')
    })

    test('raw values', () => {
        expect(parser.rawValues()).toStrictEqual([])

        parser.pushRawValue('asd')
        parser.pushRawValue('fiz')
        parser.pushRawValue('foo')
        parser.pushRawValue('bar')
        expect(parser.rawValues()).toStrictEqual(['asd', 'fiz', 'foo', 'bar'])
    })

    test('parsedValue', async () => {
        parser.pushRawValue('raw1')
        parser.pushRawValue('raw2')
        expect(await parser.parsedValue()).toStrictEqual({raw: ['raw1', 'raw2'], default: 'defaultValue'})
    })
})