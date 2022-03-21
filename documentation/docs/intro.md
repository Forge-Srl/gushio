---
sidebar_position: 1
---

# Introduction

Install Gushio with npm:

```shell
npm install -g gushio
```

Now write your first Gushio script!
Create a new text file `my_first_script.js` with the following content:
```js
export const run = async () => {
    console.log('Hello World!')
}
```
...what did you expect? of course we start from *hello world*!

Run the script with:
```shell
gushio my_first_script.js
```

That's it!