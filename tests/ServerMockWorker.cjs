const ServerMock = require('mock-http-server')
const store = {}
const createServer = async (host, port) => {
    store.host = host
    store.port = port
    store.server = new ServerMock({host: store.host, port: store.port})
}
const getHost = async () => store.host
const getPort = async () => store.port
const getBaseURL = async () => `http://${await getHost()}:${await getPort()}`
const startServer = async () => await new Promise(resolve => store.server.start(resolve))
const stopServer = async () => await new Promise(resolve => store.server.stop(resolve))
const on = async (method, path, status, result) => {
    store.server.on({
        method: method,
        path: path,
        reply: {
            status: status,
            body: result
        }
    })
}

module.exports = {createServer, getHost, getPort, getBaseURL, startServer, stopServer, on}