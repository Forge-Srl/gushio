#!/usr/bin/env gushio

const ORDERING = [
    {name: 'locale', compare: (reverse) => (a, b) => reverse * a.localeCompare(b)},
    {name: 'length', compare: (reverse) => (a, b) => reverse * (a.length - b.length)},
]

module.exports = {
    cli: {
        name: 'word-sort',
        description: 'Sorts words',
        arguments: [
            {name: '[words...]'}
        ],
        options: [
            {flags: '-r, --reverse', description: 'reverse sort order'},
            {flags: '-o, --order <order>', choices: ORDERING.map(o => o.name), default: ORDERING[0].name},
            {flags: '--file <filename>', description: 'sort lines of the given file'}
        ]
    },
    run: async (args, flags) => {
        let list = args[0]
        if (flags.file) {
            const file = await fs.readFile(flags.file, 'utf8')
            list = file.split(/\r?\n/g)
        }

        const compareFn = ORDERING.filter(o => o.name === flags.order)[0].compare(flags.reverse ? -1 : 1)
        list.sort(compareFn)

        list.forEach(s => console.log(s))
    }
}
