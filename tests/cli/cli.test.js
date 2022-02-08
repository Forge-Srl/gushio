import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('cli', () => {
    test('start', async () => {
        const start = jest.fn()
        jest.unstable_mockModule('../../cli/cliProgram', () => ({start}))

        await import('../../cli/cli.js')
        expect(start).toHaveBeenCalledTimes(1)
    })
})