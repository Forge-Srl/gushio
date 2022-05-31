import {createRequire} from 'module'
import semverParse from 'semver/functions/parse.js'
import {FunctionWrapper} from './FunctionWrapper.js'
import {createRun} from '../../utils/runUtils.js'
import {traceSymbol} from '../GushioConsole.js'

const require = createRequire(import.meta.url)
const packageInfo = require('../../package.json')

export const gushioWrapper = (buildRunner, patchedImport, console) => {
    const originalGushio = global.gushio
    const before = () => {
        global.gushio = {
            run: createRun(buildRunner),
            version: semverParse(packageInfo.version),
            import: patchedImport,
            __trace__: console[traceSymbol].bind(console)
        }
    }
    const after = () => {
        global.gushio = originalGushio
    }

    return new FunctionWrapper(before, after)
}