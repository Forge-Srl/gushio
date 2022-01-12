#!/usr/bin/env gushio
module.exports = {
    cli: {
        name: 'sample_5'
    },
    deps: [
        {name: 'glob'},
        {name: 'is-odd', alias: 'check-odd'}
    ],
    run: async (args, options) => {
        const _glob = require('glob')
        const _checkOdd = require('check-odd')

        console.log(`Written on console ${'after'.bold.yellow} requiring deps`)
    },
}