import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'
import {race, signalify, sleep} from '../../../utils/timerUtils.js'

describe('timerWrapper', () => {
    let timerWrapper

    beforeEach(async () => {
        jest.unstable_mockModule('../../../utils/timerUtils.js', () => ({
            sleep: 'sleep', race: 'race', signalify: 'signalify'
        }))

        timerWrapper = (await import('../../../runner/patches/timerWrapper.js')).timerWrapper
    })

    test('timerWrapper', async () => {
        const fn = async () => {
            expect(global.timer).toStrictEqual({
                sleep: 'sleep',
                race: 'race',
                track: 'signalify',
            })
            return 'something'
        }
        expect(global.timer).toBeUndefined()
        expect(await timerWrapper().run(fn)).toBe('something')
        expect(global.timer).toBeUndefined()
    })
})