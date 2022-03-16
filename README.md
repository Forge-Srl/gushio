# Gushio

*Like bash scripts, but in JavaScript*

[![npm](https://img.shields.io/npm/v/gushio)](https://www.npmjs.com/package/gushio)
[![GitHub](https://img.shields.io/github/license/Forge-Srl/gushio)](LICENSE.md)
[![Build Gushio](https://github.com/Forge-Srl/gushio/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Forge-Srl/gushio/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/Forge-Srl/gushio/branch/main/graph/badge.svg?token=891XITVRXG)](https://codecov.io/gh/Forge-Srl/gushio)

Gushio* is built on top of battle-tested libraries like [commander](https://www.npmjs.com/package/commander) and 
[shelljs](https://www.npmjs.com/package/shelljs) and allows you to write a multiplatform shell script in a single 
JavaScript file without having to worry about `package.json` and dependencies installation.

<sub>_* Gushio is pronounced like the italian word "guscio" (IPA: /'guʃʃo/) which means "shell"._</sub>

> You can find some examples of Gushio scripts [here](/examples). You can even try to run them directly with:
> ```shell
> gushio https://github.com/Forge-Srl/gushio/raw/main/examples/<SCRIPT_FILENAME>
> ```

## Installation

Install with npm:

```shell
npm install -g gushio
```

## Documentation

The documentation of Gushio is available [here](https://forge-srl.github.io/gushio/docs/intro).

## FAQ

### Why should I use Gushio?

We don't claim that Gushio is the perfect solution for everyone. However, we believe that in some circumstances you 
should give it a try:
- if you need your script to run on different platforms (Windows, Linux, macOS);
- if you want to write automation scripts for a JavaScript/TypeScript project;
- if you want your script to be more easily maintainable than a Bash/PowerShell script;
- if you would like to use functionalities from NPM libraries in your script;

### How is `gushio` different from `zx`?

There are two main differences between [`zx`](https://github.com/google/zx) and `gushio`:
1. Both `zx` and `gushio` use ESM, but `gushio` allows the scripts to be written in both ESM and CJS. 
2. `zx` doesn't provide a way to use NPM libraries in the scripts.

Apart from that, there are some other minor differences in the functionalities provided out of the box. For example,
`zx` uses [`chalk`](https://www.npmjs.com/package/chalk) and [`globby`](https://www.npmjs.com/package/globby) while
`gushio` uses [`ansi-colors`](https://www.npmjs.com/package/ansi-colors) and [`glob`](https://www.npmjs.com/package/glob).

We think they are both fantastic tools, and we encourage folks to use `zx` instead of `gushio` if it makes sense for 
their use-case.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
