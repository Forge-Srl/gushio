---
sidebar_position: 6
---

# File Parsing

JavaScript already provides `JSON` object for handling JSON format. Gushio adds a similar support for the YAML format
via the `YAML` global objects which is the [`yaml`](https://www.npmjs.com/package/yaml/v/next) library:
```javascript
module.exports = {
    run: async () => {
        const yamlFile = await fs.readFile('myFile.yml').toString()
        const asJson = JSON.stringify(YAML.parse(yamlFile))
        console.log(asJson)
    }
}
```