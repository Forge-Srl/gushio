import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {Readable, Writable} from 'stream'

describe('GushioConsole', () => {
    let superConsole, GushioConsole, GushioScriptLogFormat, GushioDepsLogFormat, GushioTraceLogFormat, traceSymbol,
        Enquirer, enquirer, ora, inStream, outStream, errStream, myConsole

    // Keep this function global here!
    // If you inline it (where mocking `utils/ora`) tests will fail when run all together!
    // This is probably a Jest bug, but I have no time to investigate further...
    const dio = jest.fn()

    beforeEach(async () => {
        inStream = new Readable()
        outStream = new Writable()
        errStream = new Writable()

        ora = dio
        jest.unstable_mockModule('ora', () => ({ora, oraPromise: ora}))

        enquirer = {}
        Enquirer = jest.fn()
        jest.unstable_mockModule('enquirer', () => ({default: Enquirer}))
        Enquirer.mockImplementationOnce((options) => {
            //TODO: uncomment together with GushioConsole.js line 21
            //expect(options).toStrictEqual({stdin: inStream, stdout: outStream})
            return enquirer
        })

        class MockConsole {
            constructor(...args) {
                if (!superConsole) {
                    expect(args[0].stdout).toBe(outStream)
                    expect(args[0].stderr).toBe(errStream)
                    expect(args[0].groupIndentation).toBe(4)
                    this.logMock = jest.fn()
                    this.errorMock = jest.fn()
                    this._stdout = outStream
                    this._stderr = errStream
                    superConsole = this
                }
                return superConsole
            }
            log(...args) { this.logMock(...args) }
            error(...args) { this.errorMock(...args) }
        }
        jest.unstable_mockModule('console', () => ({Console: MockConsole}))

        const gc = await import('../../runner/GushioConsole')
        GushioConsole = gc.GushioConsole
        GushioScriptLogFormat = gc.GushioScriptLogFormat
        GushioDepsLogFormat = gc.GushioDepsLogFormat
        GushioTraceLogFormat = gc.GushioTraceLogFormat
        myConsole = new GushioConsole(inStream, outStream, errStream)
        traceSymbol = Object.getOwnPropertySymbols(Object.getPrototypeOf(myConsole))[0]
        expect(myConsole.logLevel).toBe('info')
        expect(myConsole.trace).toBe(false)
    })

    test('GushioScriptLogFormat', () => {
        expect(GushioScriptLogFormat).toBe('[Gushio|Script] %s')
    })

    test('GushioDepsLogFormat', () => {
        expect(GushioDepsLogFormat).toBe('[Gushio|Deps] %s')
    })

    test('GushioTraceLogFormat', () => {
        expect(GushioTraceLogFormat).toBe( '[Gushio|Trace] %d:%d\t %s')
    })

    test.each([
        ['verbose', true],
        ['info', false],
        ['error', false],
        ['silent', false],
    ])('isVerbose %s %s', (level, expected) => {
        myConsole.logLevel = level
        expect(myConsole.isVerbose).toBe(expected)
    })

    test.each([
        ['verbose', true],
        ['info', true],
        ['error', false],
        ['silent', false],
    ])('isInfo %s %s', (level, expected) => {
        myConsole.logLevel = level
        expect(myConsole.isInfo).toBe(expected)
    })

    test.each([
        ['verbose', true],
        ['info', true],
        ['error', true],
        ['silent', false],
    ])('isError %s %s', (level, expected) => {
        myConsole.logLevel = level
        expect(myConsole.isError).toBe(expected)
    })

    describe('verbose', () => {
        test('enabled', () => {
            Object.defineProperty(myConsole, 'isVerbose', {value: true, configurable: true})
            myConsole.verbose('some', 'thing')
            expect(superConsole.logMock).toHaveBeenLastCalledWith('some', 'thing')
        })
        test('disabled', () => {
            Object.defineProperty(myConsole, 'isVerbose', {value: false, configurable: true})
            myConsole.verbose('some', 'thing')
            expect(superConsole.logMock).not.toHaveBeenCalled()
        })
    })

    describe('info', () => {
        test('enabled', () => {
            Object.defineProperty(myConsole, 'isInfo', {value: true, configurable: true})
            myConsole.info('some', 'thing')
            expect(superConsole.logMock).toHaveBeenLastCalledWith('some', 'thing')
        })
        test('disabled', () => {
            Object.defineProperty(myConsole, 'isInfo', {value: false, configurable: true})
            myConsole.info('some', 'thing')
            expect(superConsole.logMock).not.toHaveBeenCalled()
        })
    })

    describe('error', () => {
        test('enabled', () => {
            Object.defineProperty(myConsole, 'isError', {value: true, configurable: true})
            myConsole.error('some', 'thing')
            expect(superConsole.errorMock).toHaveBeenLastCalledWith('some', 'thing')
        })
        test('disabled', () => {
            Object.defineProperty(myConsole, 'isError', {value: false, configurable: true})
            myConsole.error('some', 'thing')
            expect(superConsole.errorMock).not.toHaveBeenCalled()
        })
    })

    test('log', () => {
        myConsole.info = jest.fn()
        myConsole.log('some', 'thing')
        expect(myConsole.info).toHaveBeenLastCalledWith('some', 'thing')
    })

    test('warn', () => {
        myConsole.error = jest.fn()
        myConsole.warn('some', 'thing')
        expect(myConsole.error).toHaveBeenLastCalledWith('some', 'thing')
    })

    describe('traceSymbol', () => {
        beforeEach(() => {
            myConsole.info = jest.fn()
        })

        test('no trace', () => {
            myConsole.trace = false

            myConsole[traceSymbol](1, 2, '', undefined)
            expect(myConsole.info).not.toHaveBeenCalled()
        })

        test('trace line', () => {
            myConsole.trace = true
            myConsole[traceSymbol](10, 15, 'some code', undefined)
            expect(myConsole.info).toHaveBeenCalledWith(GushioTraceLogFormat, 10, 15, 'some code')
        })

        test('trace conditional type', () => {
            myConsole.trace = true
            myConsole[traceSymbol](10, 15, 'some code', {conditionalType: 'xyz'})
            expect(myConsole.info).toHaveBeenCalledWith(GushioTraceLogFormat, 10, 15, 'CONDITIONAL [xyz]: some code')
        })

        test('trace loop type', () => {
            myConsole.trace = true
            myConsole[traceSymbol](10, 15, 'some code', {loopType: 'xyz'})
            expect(myConsole.info).toHaveBeenCalledWith(GushioTraceLogFormat, 10, 15, 'LOOP [xyz]: some code')
        })
    })

    test('spinner', async () => {
        ora.mockResolvedValue('result')
        Object.defineProperty(myConsole, 'isInfo', {value: true, configurable: true})
        expect(await myConsole.spinner('promise', 'textOrSettings')).toBe('result')
        expect(ora).toHaveBeenLastCalledWith('promise', {text: 'textOrSettings', stream: myConsole._stdout, isSilent: false})

        expect(await myConsole.spinner('promise', {some: 'settings'})).toBe('result')
        expect(ora).toHaveBeenLastCalledWith('promise', {some: 'settings', stream: myConsole._stdout, isSilent: false})
    })

    test('input', async () => {
        enquirer.prompt = async (questions) => {
            expect(questions).toStrictEqual(['question1', 'question2'])
            return 'answers'
        }
        expect(await myConsole.input('question1', 'question2')).toBe('answers')
    })
})