const {Writable} = require('stream')

describe('Logger', () => {
    let superConsole, GushioConsole, GushioLogFormat, outStream, errStream, myConsole

    beforeEach(() => {
        jest.resetModules()
        jest.resetAllMocks()

        outStream = new Writable()
        errStream = new Writable()
        class MockConsole {
            constructor(...args) {
                if (!superConsole) {
                    expect(args[0].stdout).toBe(outStream)
                    expect(args[0].stderr).toBe(errStream)
                    expect(args[0].groupIndentation).toBe(4)
                    this.logMock = jest.fn()
                    this.errorMock = jest.fn()
                    superConsole = this
                }
                return superConsole
            }
            log(...args) { this.logMock(...args) }
            error(...args) { this.errorMock(...args) }
        }

        jest.mock('console', () => ({Console: MockConsole}))

        GushioConsole = require('../../utils/GushioConsole').GushioConsole
        GushioLogFormat = require('../../utils/GushioConsole').GushioLogFormat
        myConsole = new GushioConsole(outStream, errStream)
        expect(myConsole.logLevel).toBe('info')
    })

    test('GushioLogFormat', () => {
        expect(GushioLogFormat).toBe('[Gushio] %s')
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
})