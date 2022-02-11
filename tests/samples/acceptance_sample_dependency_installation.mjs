#!/usr/bin/env gushio
export const cli = {
    name: 'sample_5',
}
export const deps = [
    {name: 'jimp'},
    {name: 'is-odd', alias: 'check-odd'},
]
export const run = async (args, options) => {
    const _jimp = await gushio.import('jimp')
    const _checkOdd = await gushio.import('check-odd')

    console.log(`Written on console ${'after'.bold.yellow} requiring deps`)
}
