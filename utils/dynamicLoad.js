/* istanbul ignore file */

// Because CJS and ESM hate each other...
// https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
// We (and jest) have chosen the CJS side, but we use some ESM modules and ESM support in jest sucks (see:
// https://jestjs.io/docs/ecmascript-modules), so we hide the import here and will mock this file in tests!
const dynamicLoad = async (dependency) => await import(dependency)
module.exports = {dynamicLoad}