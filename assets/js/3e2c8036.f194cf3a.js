"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[3984],{3905:function(e,t,i){i.d(t,{Zo:function(){return c},kt:function(){return f}});var n=i(7294);function r(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function o(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,n)}return i}function s(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?o(Object(i),!0).forEach((function(t){r(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):o(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function a(e,t){if(null==e)return{};var i,n,r=function(e,t){if(null==e)return{};var i,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||(r[i]=e[i]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)i=o[n],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}var u=n.createContext({}),l=function(e){var t=n.useContext(u),i=t;return e&&(i="function"==typeof e?e(t):s(s({},t),e)),i},c=function(e){var t=l(e.components);return n.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var i=e.components,r=e.mdxType,o=e.originalType,u=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),g=l(i),f=r,h=g["".concat(u,".").concat(f)]||g[f]||p[f]||o;return i?n.createElement(h,s(s({ref:t},c),{},{components:i})):n.createElement(h,s({ref:t},c))}));function f(e,t){var i=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=i.length,s=new Array(o);s[0]=g;var a={};for(var u in t)hasOwnProperty.call(t,u)&&(a[u]=t[u]);a.originalType=e,a.mdxType="string"==typeof e?e:r,s[1]=a;for(var l=2;l<o;l++)s[l]=i[l];return n.createElement.apply(null,s)}return n.createElement.apply(null,i)}g.displayName="MDXCreateElement"},3737:function(e,t,i){i.r(t),i.d(t,{assets:function(){return c},contentTitle:function(){return u},default:function(){return f},frontMatter:function(){return a},metadata:function(){return l},toc:function(){return p}});var n=i(7462),r=i(3366),o=(i(7294),i(3905)),s=["components"],a={sidebar_position:9},u="Gushio utilities",l={unversionedId:"scripting-utilities/gushio-utilities",id:"version-0.7.2/scripting-utilities/gushio-utilities",title:"Gushio utilities",description:"Gushio provides one additional global object gushio containing utilities and information about Gushio itself.",source:"@site/versioned_docs/version-0.7.2/scripting-utilities/gushio-utilities.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/gushio-utilities",permalink:"/gushio/docs/scripting-utilities/gushio-utilities",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.2/scripting-utilities/gushio-utilities.md",tags:[],version:"0.7.2",sidebarPosition:9,frontMatter:{sidebar_position:9},sidebar:"tutorialSidebar",previous:{title:"Exit with error",permalink:"/gushio/docs/scripting-utilities/exit-with-error"},next:{title:"Running a script",permalink:"/gushio/docs/running-script"}},c={},p=[{value:"Running version",id:"running-version",level:2},{value:"Import libraries",id:"import-libraries",level:2},{value:"Run other scripts",id:"run-other-scripts",level:2}],g={toc:p};function f(e){var t=e.components,i=(0,r.Z)(e,s);return(0,o.kt)("wrapper",(0,n.Z)({},g,i,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"gushio-utilities"},"Gushio utilities"),(0,o.kt)("p",null,"Gushio provides one additional global object ",(0,o.kt)("inlineCode",{parentName:"p"},"gushio")," containing utilities and information about Gushio itself."),(0,o.kt)("h2",{id:"running-version"},"Running version"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"gushio.version")," returns the version of Gushio running the script. The version is wrapped as a\n",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/semver"},"SemVer")," object."),(0,o.kt)("h2",{id:"import-libraries"},"Import libraries"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"gushio.import()")," allows to import external libraries in your script. For more information see\n",(0,o.kt)("a",{parentName:"p",href:"../creating-script#dependencies"},"Dependencies"),"."),(0,o.kt)("h2",{id:"run-other-scripts"},"Run other scripts"),(0,o.kt)("p",null,"With ",(0,o.kt)("inlineCode",{parentName:"p"},"gushio.run()"),' you can execute another gushio script. The target script runs in the same process of the "parent"\nscript and inherits its Gushio settings (folder, verbose mode, ...).'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        await gushio.run('somePath/simpleScript.js')\n        \n        // the following notations are the same\n        await gushio.run('somePath/myOtherScript.js', 'arg1 arg2 --flag \"flag value 1\" --other-flag')\n        await gushio.run('somePath/myOtherScript.js', ['arg1', 'arg2', '--flag', 'flag value 1', '--other-flag'])\n    }\n}\n")))}f.isMDXComponent=!0}}]);