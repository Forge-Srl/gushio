#!/usr/bin/gushio
module.exports = {
    run: async (args, options) => {
        const $ = require('shelljs')

        console.log(`__filename=${__filename}`)
        console.log(`__dirname=${__dirname}`)
        console.log(`resolved=${fs.path.resolve(__dirname, __filename)}`)
        console.log(`$.pwd()=${$.pwd().stdout}`)
        console.log('Glob "./*"', await fs.glob('./*'))
    },
}