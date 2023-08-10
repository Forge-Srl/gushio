"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[4846],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>g});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=i,g=u["".concat(s,".").concat(m)]||u[m]||d[m]||a;return n?r.createElement(g,o(o({ref:t},c),{},{components:n})):r.createElement(g,o({ref:t},c))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3892:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(7462),i=(n(7294),n(3905));const a={sidebar_position:4},o="Running a script",l={unversionedId:"running-script",id:"version-0.7.1/running-script",title:"Running a script",description:"To run a Gushio script pass the script to the gushio executable. If your script needs arguments and/or options, you",source:"@site/versioned_docs/version-0.7.1/running-script.md",sourceDirName:".",slug:"/running-script",permalink:"/gushio/docs/0.7.1/running-script",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.1/running-script.md",tags:[],version:"0.7.1",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Gushio utilities",permalink:"/gushio/docs/0.7.1/scripting-utilities/gushio-utilities"}},s={},p=[{value:"Gushio flags",id:"gushio-flags",level:2}],c={toc:p},u="wrapper";function d(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"running-a-script"},"Running a script"),(0,i.kt)("p",null,"To run a Gushio script pass the script to the ",(0,i.kt)("inlineCode",{parentName:"p"},"gushio")," executable. If your script needs arguments and/or options, you\ncan pass them after the script path."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-shell"},"gushio path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau\n")),(0,i.kt)("p",null,"You can also run remote scripts directly: if the script path is a URL, the ",(0,i.kt)("inlineCode",{parentName:"p"},"gushio")," executable automatically retrieves\nthe remote code before running it."),(0,i.kt)("p",null,"On Linux and macOS you can also run the script directly:"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Add the shabang to the script (",(0,i.kt)("inlineCode",{parentName:"li"},"#!/usr/bin/gushio")," or ",(0,i.kt)("inlineCode",{parentName:"li"},"#!/usr/bin/env gushio"),")"),(0,i.kt)("li",{parentName:"ol"},"Make the script executable",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell"},"chmod +x path/to/script_file.js\n"))),(0,i.kt)("li",{parentName:"ol"},"Run the script",(0,i.kt)("pre",{parentName:"li"},(0,i.kt)("code",{parentName:"pre",className:"language-shell"},"path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau\n")))),(0,i.kt)("h2",{id:"gushio-flags"},"Gushio flags"),(0,i.kt)("p",null,"Gushio can receive options before the script argument. The following options are available:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"-v"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"--verbose")," enable verbose logging (also available by setting ",(0,i.kt)("inlineCode",{parentName:"li"},"GUSHIO_VERBOSE")," environment variable)."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"--trace")," enable instruction tracing (also available by setting ",(0,i.kt)("inlineCode",{parentName:"li"},"GUSHIO_TRACE")," environment variable)."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"-f <folder>"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"--gushio-folder <folder>")," change gushio cache folder (also available by setting ",(0,i.kt)("inlineCode",{parentName:"li"},"GUSHIO_FOLDER"),"\nenvironment variable). The default value is the ",(0,i.kt)("inlineCode",{parentName:"li"},".gushio")," folder in the user home directory."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"-c"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"--clean-run")," clear gushio cache folder before running the script (dependencies will be re-downloaded).")))}d.isMDXComponent=!0}}]);