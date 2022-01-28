describe('cli', () => {
    test('start', () => {
        jest.mock('../../cli/cliProgram')
        const start = require('../../cli/cliProgram').start

        require('../../cli/cli')
        expect(start).toHaveBeenCalledTimes(1)
    })
})