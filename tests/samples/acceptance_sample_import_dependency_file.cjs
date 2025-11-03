#!/usr/bin/env gushio
module.exports = {
    run: async (args, options) => {
        console.log(`Before import`.red.bold)
        const {testExport, getAll} = await gushio.import('./dependency.js')
        console.log(`After import`.red.bold)

        console.log(testExport('value1'))
        console.log(testExport('value2'))
        console.log(testExport('value3'))
        console.log(getAll())

        const {getAll: getAll2} = await gushio.import('./dependency.js')
        console.log(getAll2())
    }
}