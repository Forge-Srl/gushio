import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {InputValueDelayedParser} from '../../runner/InputValueDelayedParser.js'

describe('InputValueDelayedParser', () => {
    let parser

    beforeEach(async () => {
       parser = new InputValueDelayedParser(async (raw, def) => Promise.resolve({raw: raw, default: def}), 'defaultValue')
    })

    describe('commanderParserCallback', () => {
        let callback

        beforeEach(() => {
            callback = InputValueDelayedParser.commanderParserCallback('parser')
        })

        test('defaultValue', () => {
            const expectedParser = new InputValueDelayedParser('parser', 'default')
            expectedParser.pushRawValue('value')

            expect(callback('value', 'default')).toStrictEqual(expectedParser)
        })

        test('aggregator', () => {
            const expectedParser = new InputValueDelayedParser('parser', undefined)
            expectedParser.pushRawValue('value')

            expect(callback('value', new InputValueDelayedParser('parser', undefined))).toStrictEqual(expectedParser)
        })

        test('chained calls', () => {
            const expectedParser = new InputValueDelayedParser('parser', 'default')
            expectedParser.pushRawValue('value1')
            expectedParser.pushRawValue('value2')
            expectedParser.pushRawValue('value3')

            const actualParser = ['value1', 'value2', 'value3'].reduce((agg, curr) => callback(curr, agg), 'default')
            expect(actualParser).toStrictEqual(expectedParser)
        })
    })

    test('prepareArguments', async () => {
        const arg2 = new InputValueDelayedParser(async (v,d) => {
            await new Promise(resolve => setTimeout(resolve, 300))
            return [d, ...v].join('|')
        }, '2222')
        arg2.pushRawValue('21')
        arg2.pushRawValue('22')
        arg2.pushRawValue('23')
        const arg4 = new InputValueDelayedParser(async (v,d) => {
            await new Promise(resolve => setTimeout(resolve, 120))
            return [d, ...v].join('-')
        }, '4444')
        arg4.pushRawValue('41')
        arg4.pushRawValue('42')

        const result = InputValueDelayedParser.prepareArguments(['arg1', arg2, 'arg3', arg4])
        expect(result.rawArguments).toStrictEqual(['arg1', '21', '22', '23', 'arg3', '41', '42'])
        expect(await result.getArguments()).toStrictEqual(['arg1', '2222|21|22|23', 'arg3', '4444-41-42'])
    })

    test('prepareOptions', async () => {
        const opt2 = new InputValueDelayedParser(async (v,d) => {
            await new Promise(resolve => setTimeout(resolve, 300))
            return [d, ...v].join('|')
        }, '2222')
        opt2.pushRawValue('21')
        opt2.pushRawValue('22')
        opt2.pushRawValue('23')
        const opt4 = new InputValueDelayedParser(async (v,d) => {
            await new Promise(resolve => setTimeout(resolve, 120))
            return [d, ...v].join('-')
        }, '4444')
        opt4.pushRawValue('41')
        opt4.pushRawValue('42')

        const result = InputValueDelayedParser.prepareOptions({opt1: '1', opt2, opt3: '3', opt4})
        expect(result.rawOptions).toStrictEqual({opt1: '1', opt2: ['21', '22', '23'], opt3: '3', opt4: ['41', '42']})
        expect(await result.getOptions()).toStrictEqual({opt1: '1', opt2: '2222|21|22|23', opt3: '3', opt4: '4444-41-42'})
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