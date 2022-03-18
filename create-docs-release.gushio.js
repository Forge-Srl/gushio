export const run = async () => {
    const $ = await gushio.import('shelljs')

    const pack = await fs.readJson(fs.path.join(__dirname, 'package.json'))

    $.cd(fs.path.join(__dirname, 'documentation'))
    $.exec(`npm run docusaurus docs:version ${(pack.version)}`)
    $.exec('git add .')
}