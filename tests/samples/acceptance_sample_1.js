#!/usr/bin/gushio -s
module.exports = {
    run: async ({'shelljs': $, 'ansi-colors': c, 'enquirer': e}, args, options) => {
        $.mkdir('temp_folder')
        $.cd('temp_folder')
        $.exec('echo this is a message from acceptance_sample_1> message.txt')
        console.log('You have a message to read...')
    },
}