import {parseSync, transformAsync} from '@babel/core'
import {
    blockStatement,
    isBlockStatement,
    isDeclaration,
    isFor,
    isProgram,
    isSwitchCase,
} from '@babel/types'

const escape = (str) =>
    str.replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\${/g, '$\\{')

const buildInjectLine = (line, column, source, additionalContext = {}) =>
    parseSync(`gushio.__trace__(${line}, ${column}, \`${escape(source)}\`, ${JSON.stringify(additionalContext)})`)

export const gushioTracePlugin = () => {
    const getLocation = (path) => {
        return path.node.loc ? path.node.loc.start : {line: undefined, column: undefined}
    }
    const injectSimpleLogLine = (path) => {
        const location = getLocation(path)
        path.insertBefore(buildInjectLine(location.line, location.column, path.getSource()))
    }
    const injectIfLogLine = (path) => {
        const location = getLocation(path)
        const testSource = path.get('test').getSource()

        path.insertBefore(buildInjectLine(location.line, location.column, testSource, {conditionalType: 'if'}))
    }
    const injectSwitchLogLine = (path) => {
        const location = getLocation(path)
        const discriminantSource = path.get('discriminant').getSource()

        path.insertBefore(buildInjectLine(location.line, location.column, discriminantSource, {
            conditionalType: 'switch',
        }))
        path.get('cases').forEach(casePath => {
            const caseLocation = getLocation(casePath)
            if (casePath.node.test === null) {
                casePath.get('consequent').unshift(buildInjectLine(caseLocation.line, caseLocation.column, 'default', {
                    conditionalType: 'case',
                }))
            } else {
                const testSource = casePath.get('test').getSource()
                casePath.get('consequent').unshift(buildInjectLine(caseLocation.line, caseLocation.column, testSource, {
                    conditionalType: 'case',
                }))
            }
        })
    }
    const injectLoopLogLine = (path) => {
        const location = getLocation(path)

        if (path.type === 'WhileStatement') {
            const context = {loopType: 'while'}
            const testSource = path.get('test').getSource()

            path.insertBefore(buildInjectLine(location.line, location.column, testSource, context))

            const body = path.get('body')
            body.pushContainer('body', buildInjectLine(location.line, location.column, testSource, context))
        } else if (path.type === 'DoWhileStatement') {
            const context = {loopType: 'do-while'}
            const testSource = path.get('test').getSource()

            path.get('body').pushContainer('body', buildInjectLine(location.line, location.column, testSource, context))
        } else if (path.type === 'ForStatement') {
            const context = {loopType: 'for'}
            const initSource = path.get('init').getSource()
            const testSource = path.get('test').getSource()
            const updateSource = path.get('update').getSource()
            path.insertBefore([
                buildInjectLine(location.line, location.column, initSource, context),
                buildInjectLine(location.line, location.column, testSource, context),
            ])
            path.get('body').pushContainer('body', [
                buildInjectLine(location.line, location.column, updateSource, context),
                buildInjectLine(location.line, location.column, testSource, context),
            ])
        } else if (path.type === 'ForOfStatement') {
            const context = {loopType: `for${path.node.await ? '-await' : ''}-of`}
            const leftSource = path.get('left').getSource()
            const rightSource = path.get('right').getSource()

            path.insertBefore(buildInjectLine(location.line, location.column, `${leftSource} of ${rightSource}`, context))
            path.get('body').pushContainer('body', buildInjectLine(location.line, location.column, `${leftSource} of ${rightSource}`, context))
        } else if (path.type === 'ForInStatement') {
            const context = {loopType: 'for-in'}
            const leftSource = path.get('left').getSource()
            const rightSource = path.get('right').getSource()

            path.insertBefore(buildInjectLine(location.line, location.column, `${leftSource} in ${rightSource}`, context))
            path.get('body').pushContainer('body', buildInjectLine(location.line, location.column, `${leftSource} in ${rightSource}`, context))
        }
    }
    const silentFail = (fn) => (...args) => {
        try {
            return fn(...args)
        } catch (e) {
            // This should never happen
            console.error('Babel error', e)
            return undefined
        }
    }

    return {
        name: 'gushio-tracer',
        visitor: {
            Statement: {
                enter(path, _state) {
                    if (isProgram(path.parent) || !path.node.loc) {
                        return
                    }

                    if (isBlockStatement(path.node) || isDeclaration(path.node)) {
                        return
                    }

                    if (!isBlockStatement(path.parent) && !isSwitchCase(path.parent)) {
                        path.replaceWith(blockStatement([path.node]))
                    }
                },
            },
            ExpressionStatement: {
                exit(path, _state) {
                    if (!isProgram(path.parent) && path.node.loc) {
                        silentFail(injectSimpleLogLine)(path)
                    }
                },
            },
            CompletionStatement: {
                exit(path, _state) {
                    if (!isProgram(path.parent) && path.node.loc) {
                        silentFail(injectSimpleLogLine)(path)
                    }
                },
            },
            VariableDeclaration: {
                exit(path, _state) {
                    if (!isProgram(path.parent)
                        && path.node.loc
                        && !isDeclaration(path.parent)
                        && !isFor(path.parent)) {
                        silentFail(injectSimpleLogLine)(path)
                    }
                },
            },
            IfStatement: {
                exit(path, _state) {
                    if (!isProgram(path.parent) && path.node.loc) {
                        silentFail(injectIfLogLine)(path)
                    }
                },
            },
            SwitchStatement: {
                exit(path, _state) {
                    if (!isProgram(path.parent) && path.node.loc) {
                        silentFail(injectSwitchLogLine)(path)
                    }
                },
            },
            Loop: {
                exit(path, _state) {
                    if (!isProgram(path.parent) && path.node.loc) {
                        silentFail(injectLoopLogLine)(path)
                    }
                },
            },
        },
    }
}

export const transformCode = async (code, trace) => {
    const plugins = []
    if (trace) {
        plugins.push(gushioTracePlugin)
    }

    return plugins.length > 0 ? (await transformAsync(code, {
        babelrc: false,
        plugins,
        targets: {node: 'current'}
    })).code : code
}