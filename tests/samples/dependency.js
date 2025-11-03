const $ = await gushio.import('shelljs')
const stack = [$.pwd().stdout]

export function getAll() {
    return stack
}

export function testExport(x) {
    stack.push(x)
    return x + ' - ' + stack.length
}