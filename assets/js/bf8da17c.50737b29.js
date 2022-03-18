"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[40],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),m=p(n),d=i,f=m["".concat(s,".").concat(d)]||m[d]||l[d]||o;return n?r.createElement(f,u(u({ref:t},c),{},{components:n})):r.createElement(f,u({ref:t},c))}));function d(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,u=new Array(o);u[0]=m;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:i,u[1]=a;for(var p=2;p<o;p++)u[p]=n[p];return r.createElement.apply(null,u)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},6322:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return s},default:function(){return d},frontMatter:function(){return a},metadata:function(){return p},toc:function(){return l}});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),u=["components"],a={sidebar_position:3},s="Read user input",p={unversionedId:"scripting-utilities/read-user-input",id:"scripting-utilities/read-user-input",title:"Read user input",description:"You can read user input with console.input(). For example:",source:"@site/docs/scripting-utilities/read-user-input.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/read-user-input",permalink:"/gushio/docs/scripting-utilities/read-user-input",editUrl:"https://github.com/forge-srl/gushio/main/documentation/docs/scripting-utilities/read-user-input.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"Await with spinners",permalink:"/gushio/docs/scripting-utilities/spinners"},next:{title:"HTTP requests",permalink:"/gushio/docs/scripting-utilities/http-requests"}},c={},l=[],m={toc:l};function d(e){var t=e.components,n=(0,i.Z)(e,u);return(0,o.kt)("wrapper",(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"read-user-input"},"Read user input"),(0,o.kt)("p",null,"You can read user input with ",(0,o.kt)("inlineCode",{parentName:"p"},"console.input()"),". For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        const userInput = await console.input(\n            {type: 'input', name: 'username', message: 'Tell me your username'},\n            {type: 'input', name: 'email', message: 'And your email address'}\n        )\n        console.log(`Your name is \"${userInput.name}\" and your email address is <${userInput.email}>`)\n    }\n}\n")),(0,o.kt)("p",null,"For a complete reference of the available input types and configurations see\n",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/enquirer"},(0,o.kt)("inlineCode",{parentName:"a"},"enquirer")),"."))}d.isMDXComponent=!0}}]);