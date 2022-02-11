#!/usr/bin/env gushio
module.exports = {
    cli: {
        name: 'sample_5'
    },
    deps: [
        {name: 'jimp'},
        {name: 'is-odd', alias: 'check-odd'}
    ],
    run: async (args, options) => {
        const _jimp = await gushio.import('jimp')
        const _checkOdd = await gushio.import('check-odd')

        console.log(`Written on console ${'after'.bold.yellow} requiring deps`)
    },
}