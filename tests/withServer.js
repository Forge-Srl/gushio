const {Worker} = require('jest-worker')

const createWithServer = (host, port) => async (callback) => {
    // Keep only 1 worker to ensure only one server is started and handles all requests!
    const serverWorker = new Worker(require.resolve('./ServerMockWorker'), {numWorkers: 1})
    await serverWorker.createServer(host, port)
    await serverWorker.start()

    try {
        await callback(serverWorker)
    } finally {
        await serverWorker.stop()
        await serverWorker.end()
    }
}
const withServer = createWithServer('localhost', 9000)

module.exports = {withServer}