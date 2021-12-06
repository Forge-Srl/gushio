#!/usr/bin/gushio
module.exports = {
    run: async ({'shelljs': $, 'ansi-colors': c, 'enquirer': e}, args, options) => {
        throw new Error('This script can fail badly')
    },
}