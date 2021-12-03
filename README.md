# Gushio

*Like bash scripts, but in JavaScript!*

Gushio is built on top of battle-tested libraries like [commander](https://www.npmjs.com/package/commander) and 
[shelljs](https://www.npmjs.com/package/shelljs) and allows you to write a shell script in a single JavaScript file 
without having to worry about `package.json` and dependencies installation. 

## Installation

Install with npm:

```shell
npm install -g gushio
```

## Usage

### Creating a Gushio script

A Gushio script file is a standard JavaScript file which exports an asynchronous `run` function:
```javascript
module.exports = {
    run: async () => {
        console.log('Hello world!')
    }
}
```

#### Dependencies

You can use NPM packages in your Gushio script. All dependencies are automatically downloaded by the Gushio runner and 
are provided in an object to the `run` function as the first parameter.

By default, Gushio provides 3 useful dependencies:
- [`shelljs`](https://www.npmjs.com/package/shelljs), a portable implementation of unix shell commands;
- [`ansi-colors`](https://www.npmjs.com/package/ansi-colors), for terminal logs styling;
- [`enquirer`](https://www.npmjs.com/package/enquirer), for user-friendly cli prompts.

To add a dependency to your script, you need to export a `deps` array
like this:
```javascript
module.exports = {
    deps: [
        {name: 'my-dependecy'}
    ],
    run: async (deps) => {
        deps['my-dependency'].myfunction()
        //...
    }
}
```

For each dependency you must specify the name (as found on NPM). You can add a `version` field to specify the version of
the dependency you desire. When it is not specified, the `latest` version of that package is used.

Additionally, you can specify an `alias` field to use multiple versions of the same module:
```javascript
module.exports = {
    deps: [
        {name: 'is-odd', version: '^3.0.1'},
        {name: 'is-odd', version: '1.0.0', alias: 'old-odd'},
    ],
    run: async ({'is-odd': isOdd, 'old-odd': old_isOdd}) => {
        console.log('15 is odd: ' + isOdd(15))
        console.log('15 was odd: ' + old_isOdd(15))
    }
}
```

When you provide an `alias`, the dependency is accessible via such string, otherwise the dependency `name` is used.

#### Arguments

If your script needs some arguments, you can specify them in the `cli` object:
```javascript
module.exports = {
    cli: {
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '[quak]', description: 'the second (and optional) argument', default: 69420}
        ]
    },
    run: async (deps, args, options) => {
        const [quix, quak] = args
        //...
    }
}
```

Use angular brackets (`<>`) for required arguments and square brackets (`[]`) for optional arguments. For each argument
you can add a `description` to be shown in the help and a `default` value to be used when the argument is not provided.

The last argument (and only the last argument) can also be variadic (can receive multiple values) by appending `...` to
its name:
```javascript
module.exports = {
    cli: {
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '[quaks...]', description: 'the last argument (can have many values)'}
        ]
    }
}
```

The values of the arguments are provided as an array in the second parameter of the `run` function.

#### Options

If your script needs some flags, you can specify them in the `cli` object:
```javascript
module.exports = {
    cli: {
        options: [
            {flags: '-f, --foo', description: 'the foo flag (boolean)'},
            {flags: '-b, --bar [broom]', description: 'the bar flag (optional)', default: 'no_broom'},
            {flags: '-B, --baz <baam>', description: 'the baz flag'},
        ],
    },
    run: async (deps, args, options) => {
        const {foo, bar, baz} = options
        //...
    }
}
```

Use angular brackets (`<>`) for required flag values and square brackets (`[]`) for optional flag values. If you need a
boolean flag don't add a flag argument. For each flag you can add a `description` to be shown in the help and a 
`default` value to be used when the flag is not provided.

An option can also be variadic (can receive multiple values) by appending `...` to its argument name:
```javascript
module.exports = {
    cli: {
        options: [
            {flags: '-B, --baz <values...>', description: 'the baz flag (multiple values allowed)'},
        ],
    }
}
```

The values of the flags are provided as an object in the third parameter of the `run` function.

#### Script metadata

In the `cli` object you can also add some metadata which can be displayed in the script help:
```javascript
module.exports = {
    cli: {
        name: 'my-awesome-script',
        description: 'An awesome description of what this script does',
        version: '4.2.0',
    },
    run: async (deps, args, options) => {
        //...
    }
}
```

### Running a Gushio script

To run a Gushio script pass the script to the `gushio` executable with the `-s` (or `--script`) parameter. If your 
script needs arguments and/or options, you can pass them separated from the gushio options by `--`.

```shell
gushio -s path/to/script_file -- arg1 arg2 --option1 foo --option2 bar baz bau
```

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).