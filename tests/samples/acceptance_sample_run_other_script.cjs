#!/usr/bin/env gushio
module.exports = {
    run: async (args, options) => {
        global.myWarning = 'Don\'t try this at home!'
        console.log('Global', myWarning)

        console.log(`Before script run`.red.bold)
        await gushio.run(`${__dirname}/inner_script.js`, 'first "second \\"with\\" \'spaces\'" -a --bsd \'something "else" \\\'with\\\' spaces\'')
        console.log(`After script run`.red.bold)

        console.log('Global', myWarning)
    },
}