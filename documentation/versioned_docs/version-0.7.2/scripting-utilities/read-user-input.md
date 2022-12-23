---
sidebar_position: 3
---

# Read user input

You can read user input with `console.input()`. For example:
```javascript
module.exports = {
    run: async () => {
        const userInput = await console.input(
            {type: 'input', name: 'username', message: 'Tell me your username'},
            {type: 'input', name: 'email', message: 'And your email address'}
        )
        console.log(`Your name is "${userInput.name}" and your email address is <${userInput.email}>`)
    }
}
```
For a complete reference of the available input types and configurations see
[`enquirer`](https://www.npmjs.com/package/enquirer).