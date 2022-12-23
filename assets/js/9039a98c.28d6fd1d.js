"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3120],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return m}});var a=t(7294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var l=a.createContext({}),p=function(e){var n=a.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},u=function(e){var n=p(e.components);return a.createElement(l.Provider,{value:n},e.children)},c={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},d=a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,i=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=p(t),m=r,f=d["".concat(l,".").concat(m)]||d[m]||c[m]||i;return t?a.createElement(f,o(o({ref:n},u),{},{components:t})):a.createElement(f,o({ref:n},u))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=t.length,o=new Array(i);o[0]=d;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:r,o[1]=s;for(var p=2;p<i;p++)o[p]=t[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,t)}d.displayName="MDXCreateElement"},7927:function(e,n,t){t.r(n),t.d(n,{assets:function(){return u},contentTitle:function(){return l},default:function(){return m},frontMatter:function(){return s},metadata:function(){return p},toc:function(){return c}});var a=t(7462),r=t(3366),i=(t(7294),t(3905)),o=["components"],s={sidebar_position:2},l="Creating a script",p={unversionedId:"creating-script",id:"version-0.7.2/creating-script",title:"Creating a script",description:"A Gushio script file is a standard JavaScript file which exports an asynchronous run function. You can use either ESM",source:"@site/versioned_docs/version-0.7.2/creating-script.md",sourceDirName:".",slug:"/creating-script",permalink:"/gushio/docs/creating-script",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.2/creating-script.md",tags:[],version:"0.7.2",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/gushio/docs/intro"},next:{title:"Write styled text",permalink:"/gushio/docs/scripting-utilities/write-styled-text"}},u={},c=[{value:"Dependencies",id:"dependencies",level:2},{value:"Default dependencies",id:"default-dependencies",level:3},{value:"Arguments",id:"arguments",level:2},{value:"Options",id:"options",level:2},{value:"Input parsing",id:"input-parsing",level:2},{value:"Script metadata",id:"script-metadata",level:2}],d={toc:c};function m(e){var n=e.components,t=(0,r.Z)(e,o);return(0,i.kt)("wrapper",(0,a.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"creating-a-script"},"Creating a script"),(0,i.kt)("p",null,"A Gushio script file is a standard JavaScript file which exports an asynchronous ",(0,i.kt)("inlineCode",{parentName:"p"},"run")," function. You can use either ESM"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"export const run = async () => {\n    console.log('Hello world!')\n}\n")),(0,i.kt)("p",null,"or CJS"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        console.log('Hello world!')\n    }\n}\n")),(0,i.kt)("h2",{id:"dependencies"},"Dependencies"),(0,i.kt)("p",null,"You can use NPM packages in your Gushio script. All dependencies are automatically downloaded by the Gushio runner and\n",(0,i.kt)("strong",{parentName:"p"},"they are available for import using ",(0,i.kt)("inlineCode",{parentName:"strong"},"await gushio.import()")," only inside the ",(0,i.kt)("inlineCode",{parentName:"strong"},"run()")," function"),". Importing a dependency\noutside such function will fail."),(0,i.kt)("p",null,"To add a dependency to your script, you need to export a ",(0,i.kt)("inlineCode",{parentName:"p"},"deps")," array like this:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"export const deps = [\n    {name: 'my-dependecy'}\n]\nexport const run = async () => {\n    await gushio.import('my-dependency')\n    //...\n}\n")),(0,i.kt)("p",null,"For each dependency you must specify the name (as found on NPM). You can add a ",(0,i.kt)("inlineCode",{parentName:"p"},"version")," field to specify the version of\nthe dependency you desire. When it is not specified, the ",(0,i.kt)("inlineCode",{parentName:"p"},"latest")," version of that package is used."),(0,i.kt)("p",null,"Additionally, you can specify an ",(0,i.kt)("inlineCode",{parentName:"p"},"alias")," field to use multiple versions of the same module:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    deps: [\n        {name: 'is-odd', version: '^3.0.1'},\n        {name: 'is-odd', version: '1.0.0', alias: 'old-odd'},\n    ],\n    run: async () => {\n        const {default: isOdd} = await gushio.import('is-odd')\n        const {default: old_isOdd} = await gushio.import('old-odd')\n        console.log('15 is odd: ' + isOdd(15))\n        console.log('15 was odd: ' + old_isOdd(15))\n    }\n}\n")),(0,i.kt)("p",null,"When you provide an ",(0,i.kt)("inlineCode",{parentName:"p"},"alias"),", the dependency is accessible via such string, otherwise the dependency ",(0,i.kt)("inlineCode",{parentName:"p"},"name")," is used."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Here are some examples of libraries you can add to superpower your scripts:"),(0,i.kt)("ul",{parentName:"blockquote"},(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/simple-git"},"simple-git")," for Git;"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/jimp"},"jimp")," for image processing;"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/dockerode"},"dockerode")," for Docker;"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/aws-sdk"},"aws-sdk")," for AWS."))),(0,i.kt)("h3",{id:"default-dependencies"},"Default dependencies"),(0,i.kt)("p",null,"By default, Gushio provides ",(0,i.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/shelljs"},(0,i.kt)("inlineCode",{parentName:"a"},"shelljs")),", a portable implementation of unix shell\ncommands (it is available via ",(0,i.kt)("inlineCode",{parentName:"p"},"await gushio.import('shelljs')"),")."),(0,i.kt)("h2",{id:"arguments"},"Arguments"),(0,i.kt)("p",null,"If your script needs some arguments, you can specify them in the ",(0,i.kt)("inlineCode",{parentName:"p"},"cli")," object:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"export const cli = {\n    arguments: [\n        {name: '<quix>', description: 'the first argument'},\n        {name: '<layout>', choices: ['qwerty', 'dvorak']},\n        {name: '[quak]', description: 'the third (and optional) argument', default: 69420}\n    ]\n}\nexport const run = async (args, options) => {\n    const [quix, quak] = args\n    //...\n}\n")),(0,i.kt)("p",null,"Use angular brackets (",(0,i.kt)("inlineCode",{parentName:"p"},"<>"),") for required arguments and square brackets (",(0,i.kt)("inlineCode",{parentName:"p"},"[]"),") for optional arguments. For each argument\nyou can add a ",(0,i.kt)("inlineCode",{parentName:"p"},"description")," to be shown in the help and a ",(0,i.kt)("inlineCode",{parentName:"p"},"default")," value to be used when the argument is not provided.\nYou can also allow a limited set of values by adding a ",(0,i.kt)("inlineCode",{parentName:"p"},"choices")," array of strings."),(0,i.kt)("p",null,"The last argument (and only the last argument) can also be variadic (can receive multiple values) by appending ",(0,i.kt)("inlineCode",{parentName:"p"},"...")," to\nits name:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    cli: {\n        arguments: [\n            {name: '<quix>', description: 'the first argument'},\n            {name: '[quaks...]', description: 'the last argument (can have many values)'}\n        ]\n    }\n}\n")),(0,i.kt)("p",null,"The values of the arguments are provided as an array in the first parameter of the ",(0,i.kt)("inlineCode",{parentName:"p"},"run")," function."),(0,i.kt)("h2",{id:"options"},"Options"),(0,i.kt)("p",null,"If your script needs some flags, you can specify them in the ",(0,i.kt)("inlineCode",{parentName:"p"},"cli")," object:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"export const cli = {\n    options: [\n        {flags: '-f, --foo', description: 'the foo flag (boolean)'},\n        {flags: '-b, --bar [broom]', description: 'the bar flag (optional)', default: 'no_broom', env: 'MY_BAR'},\n        {flags: '-B, --baz <baam>', description: 'the baz flag', choices: ['swish', 'swoosh']},\n    ],\n}\nexport const run = async (args, options) => {\n    const {foo, bar, baz} = options\n    //...\n}\n")),(0,i.kt)("p",null,"Use angular brackets (",(0,i.kt)("inlineCode",{parentName:"p"},"<>"),") for required flag values and square brackets (",(0,i.kt)("inlineCode",{parentName:"p"},"[]"),") for optional flag values. If you need a\nboolean flag don't add a flag argument. For each flag you can add:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"a ",(0,i.kt)("inlineCode",{parentName:"li"},"description")," to be shown in the help;"),(0,i.kt)("li",{parentName:"ul"},"a ",(0,i.kt)("inlineCode",{parentName:"li"},"default")," value to be used when the flag is not provided;"),(0,i.kt)("li",{parentName:"ul"},"a ",(0,i.kt)("inlineCode",{parentName:"li"},"choices")," array of strings to allow only a limited set of values;"),(0,i.kt)("li",{parentName:"ul"},"a ",(0,i.kt)("inlineCode",{parentName:"li"},"env")," variable name to read the value from (if the flag is not provided, then the environment variable is checked;\nif such variable is not set, then the default value is used).")),(0,i.kt)("p",null,"An option can also be variadic (can receive multiple values) by appending ",(0,i.kt)("inlineCode",{parentName:"p"},"...")," to its argument name:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    cli: {\n        options: [\n            {flags: '-B, --baz <values...>', description: 'the baz flag (multiple values allowed)'},\n        ],\n    }\n}\n")),(0,i.kt)("p",null,"The values of the flags are provided as an object in the second parameter of the ",(0,i.kt)("inlineCode",{parentName:"p"},"run")," function."),(0,i.kt)("h2",{id:"input-parsing"},"Input parsing"),(0,i.kt)("p",null,"Both arguments and options support a ",(0,i.kt)("inlineCode",{parentName:"p"},"parser")," option to allow input value parsing before the ",(0,i.kt)("inlineCode",{parentName:"p"},"run")," is executed. This\noption can be specified as follows:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    cli: {\n        arguments: [\n            {name: '[quaks...]', parser: async (valuesArray, defaultIfAny) => { return 'parsed result'}}\n        ],\n        options: [\n            {flags: '-B, --baz [values...]', parser: async (valuesArray, defaultIfAny) => { return 'parsed result'}},\n        ],\n    }\n}\n")),(0,i.kt)("p",null,"As you can see ",(0,i.kt)("inlineCode",{parentName:"p"},"parser")," is an asynchronous function which takes in the input value (or values) as an array and the\ndefault value (if set in the argument/option)."),(0,i.kt)("p",null,"The execution of the ",(0,i.kt)("inlineCode",{parentName:"p"},"parser")," functions is delayed after dependencies are installed and the gushio context is set up;\nthus you can use all the scripting utilities and access the dependencies if you need to."),(0,i.kt)("p",null,"The return value of the parser can be anything, for example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    cli: {\n        arguments: [\n            {name: '[argNumber1]', parser: async ([value]) => Number.parseInt(value)},\n            {name: '[complex]', parser: async ([value]) => JSON.parse(value)},\n            {name: '[quaks...]', parser: async (valuesArray) => valuesArray.join('-')},\n        ],\n        options: [\n            {flags: '-C, --count', parser: async (valuesArray) => valuesArray.length},\n        ],\n    }\n}\n")),(0,i.kt)("h2",{id:"script-metadata"},"Script metadata"),(0,i.kt)("p",null,"In the ",(0,i.kt)("inlineCode",{parentName:"p"},"cli")," object you can also add some metadata which can be displayed in the script help:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    cli: {\n        name: 'my-awesome-script',\n        description: 'An awesome description of what this script does',\n        version: '4.2.0',\n        afterHelp: 'This string will be shown after the script help',\n    },\n    run: async (args, options) => {\n        //...\n    }\n}\n")))}m.isMDXComponent=!0}}]);