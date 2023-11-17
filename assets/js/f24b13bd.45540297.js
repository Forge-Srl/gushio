"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[727],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>f});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var c=n.createContext({}),p=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=p(e.components);return n.createElement(c.Provider,{value:t},e.children)},l="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),l=p(r),m=i,f=l["".concat(c,".").concat(m)]||l[m]||d[m]||o;return r?n.createElement(f,s(s({ref:t},u),{},{components:r})):n.createElement(f,s({ref:t},u))}));function f(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=r.length,s=new Array(o);s[0]=m;var a={};for(var c in t)hasOwnProperty.call(t,c)&&(a[c]=t[c]);a.originalType=e,a[l]="string"==typeof e?e:i,s[1]=a;for(var p=2;p<o;p++)s[p]=r[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},8061:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>d,frontMatter:()=>o,metadata:()=>a,toc:()=>p});var n=r(7462),i=(r(7294),r(3905));const o={sidebar_position:4},s="HTTP requests",a={unversionedId:"scripting-utilities/http-requests",id:"version-0.7.4/scripting-utilities/http-requests",title:"HTTP requests",description:"You can make HTTP and HTTPS requests directly using fetch, which is a wrapper around",source:"@site/versioned_docs/version-0.7.4/scripting-utilities/http-requests.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/http-requests",permalink:"/gushio/docs/scripting-utilities/http-requests",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.4/scripting-utilities/http-requests.md",tags:[],version:"0.7.4",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Read user input",permalink:"/gushio/docs/scripting-utilities/read-user-input"},next:{title:"File System",permalink:"/gushio/docs/scripting-utilities/file-system"}},c={},p=[],u={toc:p},l="wrapper";function d(e){let{components:t,...r}=e;return(0,i.kt)(l,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"http-requests"},"HTTP requests"),(0,i.kt)("p",null,"You can make HTTP and HTTPS requests directly using ",(0,i.kt)("inlineCode",{parentName:"p"},"fetch"),", which is a wrapper around\n",(0,i.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/node-fetch"},(0,i.kt)("inlineCode",{parentName:"a"},"node-fetch")),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        const googleHomePage = await fetch('https://www.google.com')\n        console.log(await googleHomePage.text())\n    }\n}\n")))}d.isMDXComponent=!0}}]);