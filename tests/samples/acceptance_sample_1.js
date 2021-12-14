#!/usr/bin/gushio
module.exports = {
    run: async (args, options) => {
        const $ = require('shelljs')
        $.mkdir('temp_folder')
        $.cd('temp_folder')
        $.exec('echo this is a message from acceptance_sample_1> message.txt')
        console.log('You have a message to read...')
    },
}