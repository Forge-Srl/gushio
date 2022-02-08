import {Worker} from 'jest-worker'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)

const createWithServer = (host, port) => async (callback) => {
    // Keep only 1 worker to ensure only one server is started and handles all requests!
    const serverWorker = new Worker(require.resolve('./ServerMockWorker.cjs'), {numWorkers: 1})
    await serverWorker.createServer(host, port)
    await serverWorker.start()

    try {
        await callback(serverWorker)
    } finally {
        await serverWorker.stop()
        await serverWorker.end()
    }
}
export const withServer = createWithServer('localhost', 9000)