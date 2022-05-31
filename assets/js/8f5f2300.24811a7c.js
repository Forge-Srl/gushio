"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[233],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return f}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=u(n),f=i,m=d["".concat(s,".").concat(f)]||d[f]||p[f]||o;return n?r.createElement(m,a(a({ref:t},c),{},{components:n})):r.createElement(m,a({ref:t},c))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var u=2;u<o;u++)a[u]=n[u];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9398:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return s},default:function(){return f},frontMatter:function(){return l},metadata:function(){return u},toc:function(){return p}});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),a=["components"],l={sidebar_position:4},s="Running a script",u={unversionedId:"running-script",id:"version-0.7.0/running-script",title:"Running a script",description:"To run a Gushio script pass the script to the gushio executable. If your script needs arguments and/or options, you",source:"@site/versioned_docs/version-0.7.0/running-script.md",sourceDirName:".",slug:"/running-script",permalink:"/gushio/docs/running-script",draft:!1,editUrl:"https://github.com/forge-srl/gushio/main/documentation/versioned_docs/version-0.7.0/running-script.md",tags:[],version:"0.7.0",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Gushio utilities",permalink:"/gushio/docs/scripting-utilities/gushio-utilities"}},c={},p=[{value:"Gushio flags",id:"gushio-flags",level:2}],d={toc:p};function f(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"running-a-script"},"Running a script"),(0,o.kt)("p",null,"To run a Gushio script pass the script to the ",(0,o.kt)("inlineCode",{parentName:"p"},"gushio")," executable. If your script needs arguments and/or options, you\ncan pass them after the script path."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"gushio path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau\n")),(0,o.kt)("p",null,"You can also run remote scripts directly: if the script path is a URL, the ",(0,o.kt)("inlineCode",{parentName:"p"},"gushio")," executable automatically retrieves\nthe remote code before running it."),(0,o.kt)("p",null,"On Linux and macOS you can also run the script directly:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Add the shabang to the script (",(0,o.kt)("inlineCode",{parentName:"li"},"#!/usr/bin/gushio")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"#!/usr/bin/env gushio"),")"),(0,o.kt)("li",{parentName:"ol"},"Make the script executable",(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"chmod +x path/to/script_file.js\n"))),(0,o.kt)("li",{parentName:"ol"},"Run the script",(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau\n")))),(0,o.kt)("h2",{id:"gushio-flags"},"Gushio flags"),(0,o.kt)("p",null,"Gushio can receive options before the script argument. The following options are available:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"-v"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"--verbose")," enable verbose logging (also available by setting ",(0,o.kt)("inlineCode",{parentName:"li"},"GUSHIO_VERBOSE")," environment variable)."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"-f <folder>"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"--gushio-folder <folder>")," change gushio cache folder (also available by setting ",(0,o.kt)("inlineCode",{parentName:"li"},"GUSHIO_FOLDER"),"\nenvironment variable). The default value is the ",(0,o.kt)("inlineCode",{parentName:"li"},".gushio")," folder in the user home directory."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"-c"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"--clean-run")," clear gushio cache folder before running the script (dependencies will be re-downloaded).")))}f.isMDXComponent=!0}}]);