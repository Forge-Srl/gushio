import {FunctionWrapper} from './FunctionWrapper.js'
import {sleep, race, signalify} from '../../utils/timerUtils.js'

export const timerWrapper = () => {
    const originalTimer = global.timer
    const before = () => {
        global.timer = {
            sleep: sleep,
            race: race,
            track: signalify,
        }
    }
    const after = () => {
        global.timer = originalTimer
    }

    return new FunctionWrapper(before, after)
}