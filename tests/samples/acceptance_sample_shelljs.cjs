#!/usr/bin/env gushio
module.exports = {
    run: async (args, options) => {
        const $ = await gushio.import('shelljs')
        $.mkdir('temp_folder')
        $.cd('temp_folder')
        $.exec('echo this is a message from acceptance_sample_1> message.txt')
        const file = await fs.readFile('message.txt')
        console.log('You have a message to read...')
        console.log(`Inside message.txt: "${file.toString()}"`)
    },
}