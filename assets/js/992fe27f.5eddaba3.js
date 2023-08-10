"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[142],{3905:(e,t,i)=>{i.d(t,{Zo:()=>p,kt:()=>m});var r=i(7294);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function o(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,r)}return i}function s(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?o(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):o(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function a(e,t){if(null==e)return{};var i,r,n=function(e,t){if(null==e)return{};var i,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)i=o[r],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)i=o[r],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var u=r.createContext({}),l=function(e){var t=r.useContext(u),i=t;return e&&(i="function"==typeof e?e(t):s(s({},t),e)),i},p=function(e){var t=l(e.components);return r.createElement(u.Provider,{value:t},e.children)},c="mdxType",g={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var i=e.components,n=e.mdxType,o=e.originalType,u=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),c=l(i),h=n,m=c["".concat(u,".").concat(h)]||c[h]||g[h]||o;return i?r.createElement(m,s(s({ref:t},p),{},{components:i})):r.createElement(m,s({ref:t},p))}));function m(e,t){var i=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=i.length,s=new Array(o);s[0]=h;var a={};for(var u in t)hasOwnProperty.call(t,u)&&(a[u]=t[u]);a.originalType=e,a[c]="string"==typeof e?e:n,s[1]=a;for(var l=2;l<o;l++)s[l]=i[l];return r.createElement.apply(null,s)}return r.createElement.apply(null,i)}h.displayName="MDXCreateElement"},664:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>g,frontMatter:()=>o,metadata:()=>a,toc:()=>l});var r=i(7462),n=(i(7294),i(3905));const o={sidebar_position:9},s="Gushio utilities",a={unversionedId:"scripting-utilities/gushio-utilities",id:"version-0.7.0/scripting-utilities/gushio-utilities",title:"Gushio utilities",description:"Gushio provides one additional global object gushio containing utilities and information about Gushio itself.",source:"@site/versioned_docs/version-0.7.0/scripting-utilities/gushio-utilities.md",sourceDirName:"scripting-utilities",slug:"/scripting-utilities/gushio-utilities",permalink:"/gushio/docs/0.7.0/scripting-utilities/gushio-utilities",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.0/scripting-utilities/gushio-utilities.md",tags:[],version:"0.7.0",sidebarPosition:9,frontMatter:{sidebar_position:9},sidebar:"tutorialSidebar",previous:{title:"Exit with error",permalink:"/gushio/docs/0.7.0/scripting-utilities/exit-with-error"},next:{title:"Running a script",permalink:"/gushio/docs/0.7.0/running-script"}},u={},l=[{value:"Running version",id:"running-version",level:2},{value:"Import libraries",id:"import-libraries",level:2},{value:"Run other scripts",id:"run-other-scripts",level:2}],p={toc:l},c="wrapper";function g(e){let{components:t,...i}=e;return(0,n.kt)(c,(0,r.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"gushio-utilities"},"Gushio utilities"),(0,n.kt)("p",null,"Gushio provides one additional global object ",(0,n.kt)("inlineCode",{parentName:"p"},"gushio")," containing utilities and information about Gushio itself."),(0,n.kt)("h2",{id:"running-version"},"Running version"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"gushio.version")," returns the version of Gushio running the script. The version is wrapped as a\n",(0,n.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/semver"},"SemVer")," object."),(0,n.kt)("h2",{id:"import-libraries"},"Import libraries"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"gushio.import()")," allows to import external libraries in your script. For more information see\n",(0,n.kt)("a",{parentName:"p",href:"../creating-script#dependencies"},"Dependencies"),"."),(0,n.kt)("h2",{id:"run-other-scripts"},"Run other scripts"),(0,n.kt)("p",null,"With ",(0,n.kt)("inlineCode",{parentName:"p"},"gushio.run()"),' you can execute another gushio script. The target script runs in the same process of the "parent"\nscript and inherits its Gushio settings (folder, verbose mode, ...).'),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n    run: async () => {\n        await gushio.run('somePath/simpleScript.js')\n        \n        // the following notations are the same\n        await gushio.run('somePath/myOtherScript.js', 'arg1 arg2 --flag \"flag value 1\" --other-flag')\n        await gushio.run('somePath/myOtherScript.js', ['arg1', 'arg2', '--flag', 'flag value 1', '--other-flag'])\n    }\n}\n")))}g.isMDXComponent=!0}}]);