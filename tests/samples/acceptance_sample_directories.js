#!/usr/bin/gushio
module.exports = {
    run: async (args, options) => {
        const $ = require('shelljs')
        const path = require('path')

        console.log(`__filename=${__filename}`)
        console.log(`__dirname=${__dirname}`)
        console.log(`resolved=${path.resolve(__dirname, __filename)}`)
        console.log(`$.pwd()=${$.pwd().stdout}`)
    },
}