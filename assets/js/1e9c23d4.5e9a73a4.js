"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[737],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return d}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),m=c(n),d=i,f=m["".concat(l,".").concat(d)]||m[d]||p[d]||o;return n?r.createElement(f,a(a({ref:t},u),{},{components:n})):r.createElement(f,a({ref:t},u))}));function d(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var c=2;c<o;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},1862:function(e,t,n){n.r(t),n.d(t,{assets:function(){return u},contentTitle:function(){return l},default:function(){return d},frontMatter:function(){return s},metadata:function(){return c},toc:function(){return p}});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),a=["components"],s={sidebar_position:7},l="Timers",c={unversionedId:"scripting-utilities/timers",id:"scripting-utilities/timers",title:"Timers",description:"In case you need to wait some time or handle concurrent promises you can use the global object timer.",source:"@site/docs/scripting-utilities/timers.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/timers",permalink:"/gushio/docs/next/scripting-utilities/timers",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/docs/scripting-utilities/timers.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"File Parsing",permalink:"/gushio/docs/next/scripting-utilities/file-parsing"},next:{title:"Exit with error",permalink:"/gushio/docs/next/scripting-utilities/exit-with-error"}},u={},p=[],m={toc:p};function d(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"timers"},"Timers"),(0,o.kt)("p",null,"In case you need to wait some time or handle concurrent promises you can use the global object ",(0,o.kt)("inlineCode",{parentName:"p"},"timer"),"."),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"timer.sleep()")," is a promisified version of ",(0,o.kt)("inlineCode",{parentName:"p"},"setTimeout()")," with support to ",(0,o.kt)("inlineCode",{parentName:"p"},"AbortController"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        // Simple sleep\n        await timer.sleep(500)\n        \n        // Sleep with result\n        const myValue = await timer.sleep(1000, 'this is the resolved value')\n        \n        // Sleep with AbortController\n        const controller = new AbortController()\n        const sleepPromise = time.sleep(95000, 'the result', {signal: controller.signal})\n        if (someCondition()) {\n            controller.abort()\n        } else {\n            await sleepPromise\n        }\n    }\n}\n")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"timer.race()")," is a wrapper around ",(0,o.kt)("inlineCode",{parentName:"p"},"Promise.race()")," that internally use an AbortController to abort all the pending\npromises after race ends:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        // Fetch Google only if it takes less than 500 millisecond\n        const result = await timer.race([\n            async signal => await timer.sleep(500, 'default', {signal}),\n            async signal => await fetch('https://www.google.it', {signal})\n        ])\n    }\n}\n")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"timer.track()")," is a utility function to add ",(0,o.kt)("inlineCode",{parentName:"p"},"AbortController")," support to an existing async function:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        const someFunction = async (arg1, arg2, arg3) => { /*...*/ }\n\n        const someFunctionWithAbort = timer.track(someFunction)\n\n        const result = await timer.race([\n            async signal => await timer.sleep(500, 'default', {signal}),\n            async signal => await someFunctionWithAbort('value1', 'value2', 'value3', {signal})\n        ])\n    }\n}\n")))}d.isMDXComponent=!0}}]);