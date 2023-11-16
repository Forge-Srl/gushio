#!/usr/bin/env gushio
export const cli = {
    name: 'sample_5',
}
export const deps = [
    {name: 'jimp'},
    {name: 'is-odd', alias: 'check-odd'},
    {name: 'knex'},
    {name: '@aws-sdk/core'},
    {name: 'pg'},
    {name: 'esbuild'},
]
export const run = async (args, options) => {
    const _jimp = await gushio.import('jimp')
    const _checkOdd = await gushio.import('check-odd')
    const _knex = await gushio.import('knex')
    const _awsSdkCore = await gushio.import('@aws-sdk/core')
    const _pg = await gushio.import('pg')
    const _esbuild = await gushio.import('esbuild')

    console.log(`Written on console ${'after'.bold.yellow} requiring deps`)
}
