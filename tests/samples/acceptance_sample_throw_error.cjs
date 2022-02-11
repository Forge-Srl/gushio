#!/usr/bin/env gushio
module.exports = {
    run: async (args, options) => {
        throw new Error('This script can fail badly')
    },
}