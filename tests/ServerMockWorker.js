const ServerMock = require('mock-http-server')
let server
const createServer = async (host, port) => {
    server = new ServerMock({host, port})
}
const start = async () => await new Promise(resolve => server.start(resolve))
const stop = async () => await new Promise(resolve => server.stop(resolve))
const on = (method, path, status, result) => {
    server.on({
        method: method,
        path: path,
        reply: {
            status: status,
            body: result
        }
    })
}

module.exports = {createServer, start, stop, on}