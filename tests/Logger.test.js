describe('Logger', () => {
    let Logger

    beforeEach(() => {
        Logger = require('../Logger').Logger
    })

    test('info', () => {
        const logger = new Logger()
        console.log = jest.fn()
        logger.info('some text')
        expect(console.log).toHaveBeenCalledWith('[Gushio] some text')
    })

    test('error', () => {
        const logger = new Logger()
        console.error = jest.fn()
        logger.error('some text')
        expect(console.error).toHaveBeenCalledWith('[Gushio] some text')
    })
})