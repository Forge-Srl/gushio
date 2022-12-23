"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[9035],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return d}});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var a=n.createContext({}),l=function(e){var t=n.useContext(a),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(a.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,a=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),f=l(r),d=i,m=f["".concat(a,".").concat(d)]||f[d]||p[d]||o;return r?n.createElement(m,s(s({ref:t},u),{},{components:r})):n.createElement(m,s({ref:t},u))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,s=new Array(o);s[0]=f;var c={};for(var a in t)hasOwnProperty.call(t,a)&&(c[a]=t[a]);c.originalType=e,c.mdxType="string"==typeof e?e:i,s[1]=c;for(var l=2;l<o;l++)s[l]=r[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},149:function(e,t,r){r.r(t),r.d(t,{assets:function(){return u},contentTitle:function(){return a},default:function(){return d},frontMatter:function(){return c},metadata:function(){return l},toc:function(){return p}});var n=r(7462),i=r(3366),o=(r(7294),r(3905)),s=["components"],c={sidebar_position:1},a="Write styled text",l={unversionedId:"scripting-utilities/write-styled-text",id:"version-0.7.0/scripting-utilities/write-styled-text",title:"Write styled text",description:"You can change output text color directly from the string itself. For example:",source:"@site/versioned_docs/version-0.7.0/scripting-utilities/write-styled-text.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/write-styled-text",permalink:"/gushio/docs/0.7.0/scripting-utilities/write-styled-text",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.0/scripting-utilities/write-styled-text.md",tags:[],version:"0.7.0",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Creating a script",permalink:"/gushio/docs/0.7.0/creating-script"},next:{title:"Await with spinners",permalink:"/gushio/docs/0.7.0/scripting-utilities/spinners"}},u={},p=[],f={toc:p};function d(e){var t=e.components,r=(0,i.Z)(e,s);return(0,o.kt)("wrapper",(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"write-styled-text"},"Write styled text"),(0,o.kt)("p",null,"You can change output text color directly from the string itself. For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        console.log('Hello stylish world!'.blue.bold.italic)\n    }\n}\n")),(0,o.kt)("p",null,"For a complete reference of the available styles see ",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/ansi-colors"},(0,o.kt)("inlineCode",{parentName:"a"},"ansi-colors")),"."))}d.isMDXComponent=!0}}]);