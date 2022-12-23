"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7087],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return m}});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),f=l(r),m=i,d=f["".concat(c,".").concat(m)]||f[m]||u[m]||o;return r?n.createElement(d,a(a({ref:t},p),{},{components:r})):n.createElement(d,a({ref:t},p))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,a=new Array(o);a[0]=f;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var l=2;l<o;l++)a[l]=r[l];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},4794:function(e,t,r){r.r(t),r.d(t,{assets:function(){return p},contentTitle:function(){return c},default:function(){return m},frontMatter:function(){return s},metadata:function(){return l},toc:function(){return u}});var n=r(7462),i=r(3366),o=(r(7294),r(3905)),a=["components"],s={sidebar_position:6},c="File Parsing",l={unversionedId:"scripting-utilities/file-parsing",id:"scripting-utilities/file-parsing",title:"File Parsing",description:"JavaScript already provides JSON object for handling JSON format. Gushio adds a similar support for the YAML format",source:"@site/docs/scripting-utilities/file-parsing.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/file-parsing",permalink:"/gushio/docs/next/scripting-utilities/file-parsing",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/docs/scripting-utilities/file-parsing.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"File System",permalink:"/gushio/docs/next/scripting-utilities/file-system"},next:{title:"Timers",permalink:"/gushio/docs/next/scripting-utilities/timers"}},p={},u=[],f={toc:u};function m(e){var t=e.components,r=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"file-parsing"},"File Parsing"),(0,o.kt)("p",null,"JavaScript already provides ",(0,o.kt)("inlineCode",{parentName:"p"},"JSON")," object for handling JSON format. Gushio adds a similar support for the YAML format\nvia the ",(0,o.kt)("inlineCode",{parentName:"p"},"YAML")," global objects which is the ",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/yaml/v/next"},(0,o.kt)("inlineCode",{parentName:"a"},"yaml"))," library:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        const yamlFile = await fs.readFile('myFile.yml').toString()\n        const asJson = JSON.stringify(YAML.parse(yamlFile))\n        console.log(asJson)\n    }\n}\n")))}m.isMDXComponent=!0}}]);