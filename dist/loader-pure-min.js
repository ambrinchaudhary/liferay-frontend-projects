!function(){var global={};global.__CONFIG__=window.__CONFIG__,function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.EventEmitter=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){this._events={}}return t.prototype={constructor:t,on:function(e,t){var n=this._events[e]=this._events[e]||[];n.push(t)},off:function(e,t){var n=this._events[e];if(n){var o=n.indexOf(t);o>-1&&n.splice(o,1)}},emit:function(e,t){var n=this._events[e];if(n){n=n.slice(0);for(var o=0;o<n.length;o++){var i=n[o];i.call(i,t)}}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.ConfigParser=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._config={},this._modules={},this._conditionalModules={},this._parseConfig(e)}return t.prototype={constructor:t,addModule:function(e){var t=this._modules[e.name];if(t)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);else this._modules[e.name]=e;return this._registerConditionalModule(e),this._modules[e.name]},getConfig:function(){return this._config},getConditionalModules:function(){return this._conditionalModules},getModules:function(){return this._modules},mapModule:function(e){if(!this._config.maps)return e;var t;t=Array.isArray(e)?e:[e];for(var n=0;n<t.length;n++){var o=t[n],i=!1;for(var r in this._config.maps)if(Object.prototype.hasOwnProperty.call(this._config.maps,r)&&(o===r||0===o.indexOf(r+"/"))){o=this._config.maps[r]+o.substring(r.length),t[n]=o,i=!0;break}i||"function"!=typeof this._config.maps["*"]||(t[n]=this._config.maps["*"](o))}return Array.isArray(e)?t:t[0]},_parseConfig:function(e){for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&("modules"===t?this._parseModules(e[t]):this._config[t]=e[t]);return this._config},_parseModules:function(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t)){var n=e[t];n.name=t,this.addModule(n)}return this._modules},_registerConditionalModule:function(e){if(e.condition){var t=this._conditionalModules[e.condition.trigger];t||(this._conditionalModules[e.condition.trigger]=t=[]),t.push(e.name)}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.DependencyBuilder=n}("undefined"!=typeof global?global:this,function(global){"use strict";function DependencyBuilder(e){this._configParser=e,this._pathResolver=new global.PathResolver,this._result=[]}var hasOwnProperty=Object.prototype.hasOwnProperty;return DependencyBuilder.prototype={constructor:DependencyBuilder,resolveDependencies:function(e){this._queue=e.slice(0);var t;try{this._resolveDependencies(),t=this._result.reverse().slice(0)}finally{this._cleanup()}return t},_cleanup:function(){var e=this._configParser.getModules();for(var t in e)if(hasOwnProperty.call(e,t)){var n=e[t];n.conditionalMark=!1,n.mark=!1,n.tmpMark=!1}this._queue.length=0,this._result.length=0},_processConditionalModules:function(e){var t=this._configParser.getConditionalModules()[e.name];if(t&&!e.conditionalMark){for(var n=this._configParser.getModules(),o=0;o<t.length;o++){var i=n[t[o]];-1===this._queue.indexOf(i.name)&&this._testConditionalModule(i.condition.test)&&this._queue.push(i.name)}e.conditionalMark=!0}},_resolveDependencies:function(){for(var e=this._configParser.getModules(),t=0;t<this._queue.length;t++){var n=e[this._queue[t]];n||(n=this._configParser.addModule({name:this._queue[t],dependencies:[]})),n.mark||this._visit(n)}},_testConditionalModule:function(testFunction){return"function"==typeof testFunction?testFunction():eval("false || "+testFunction)()},_visit:function(e){if(e.tmpMark)throw new Error("Error processing module: "+e.name+". The provided configuration is not Directed Acyclic Graph.");if(this._processConditionalModules(e),!e.mark){e.tmpMark=!0;for(var t=this._configParser.getModules(),n=0;n<e.dependencies.length;n++){var o=e.dependencies[n];if("exports"!==o&&"module"!==o){o=this._pathResolver.resolvePath(e.name,o);var i=this._configParser.mapModule(o),r=t[i];r||(r=this._configParser.addModule({name:i,dependencies:[]})),this._visit(r)}}e.mark=!0,e.tmpMark=!1,this._result.unshift(e.name)}},_queue:[]},DependencyBuilder}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.URLBuilder=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._configParser=e}var n=/^https?:\/\/|\/\/|www\./;return t.prototype={constructor:t,build:function(e){var t=[],o=[],i=[],r=[],s=[],u=this._configParser.getConfig(),a=u.basePath||"",l=this._configParser.getModules();a.length&&"/"!==a.charAt(a.length-1)&&(a+="/");for(var d=0;d<e.length;d++){var f=l[e[d]];if(f.fullPath)s.push({modules:[f.name],url:f.fullPath});else{var c=this._getModulePath(f),p=0===c.indexOf("/");n.test(c)?s.push({modules:[f.name],url:c}):!u.combine||f.anonymous?s.push({modules:[f.name],url:u.url+(p?"":a)+c}):p?(t.push(c),i.push(f.name)):(o.push(c),r.push(f.name))}f.requested=!0}return o.length&&(s.push({modules:r,url:u.url+a+o.join("&"+a)}),o.length=0),t.length&&(s.push({modules:i,url:u.url+t.join("&")}),t.length=0),s},_getModulePath:function(e){var t=e.path||e.name,o=this._configParser.getConfig().paths||{},i=!1;return Object.keys(o).forEach(function(e){t!==e&&0!==t.indexOf(e+"/")||(t=o[e]+t.substring(e.length))}),i||"function"!=typeof o["*"]||(t=o["*"](t)),n.test(t)||t.indexOf(".js")===t.length-3||(t+=".js"),t}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.PathResolver=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){}return t.prototype={constructor:t,resolvePath:function(e,t){if("exports"===t||"module"===t||0!==t.indexOf(".")&&0!==t.indexOf(".."))return t;var n=e.split("/");n.splice(-1,1);for(var o=t.split("/"),i=o.splice(-1,1),r=0;r<o.length;r++){var s=o[r];if("."!==s)if(".."===s){if(!n.length){n=n.concat(o.slice(r));break}n.splice(-1,1)}else n.push(s)}return n.push(i),n.join("/")}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.Loader=new n,e.require=e.Loader.require.bind(e.Loader),e.define=e.Loader.define.bind(e.Loader),e.define.amd={}}("undefined"!=typeof global?global:this,function(e){"use strict";function t(n){t.superclass.constructor.apply(this,arguments),this._config=n||e.__CONFIG__,this._modulesMap={}}t.prototype=Object.create(e.EventEmitter.prototype),t.prototype.constructor=t,t.superclass=e.EventEmitter.prototype;var n={addModule:function(e){return this._getConfigParser().addModule(e)},define:function(e,t,n,o){var i=this;o=o||{};var r=arguments.length;if(o.anonymous=!1,2>r?(n=arguments[0],t=["module","exports"],o.anonymous=!0):2===r&&("string"==typeof e?(t=["module","exports"],n=arguments[1]):(t=arguments[0],n=arguments[1],o.anonymous=!0)),o.anonymous){var s=function(e){if(i.off("scriptLoaded",s),1!==e.length)throw new Error("Multiple anonymous modules cannot be served via combo service. Please set `combine` to `false` or describe the modules in the config and mark them as anonymous.",e);var r=e[0];i._define(r,t,n,o)};i.on("scriptLoaded",s)}else this._define(e,t,n,o)},getConditionalModules:function(){return this._getConfigParser().getConditionalModules()},getModules:function(){return this._getConfigParser().getModules()},require:function(){var e,t,n,o,i=this;if(Array.isArray(arguments[0]))n=arguments[0],o="function"==typeof arguments[1]?arguments[1]:null,e="function"==typeof arguments[2]?arguments[2]:null;else for(n=[],t=0;t<arguments.length;++t)if("string"==typeof arguments[t])n[t]=arguments[t];else if("function"==typeof arguments[t]){o=arguments[t],e="function"==typeof arguments[++t]?arguments[t]:null;break}var r,s=i._getConfigParser(),u=s.mapModule(n);new Promise(function(e,t){i._resolveDependencies(u).then(function(o){var a=s.getConfig();0!==a.waitTimeout&&(r=setTimeout(function(){var e=s.getModules(),i=new Error("Load timeout for modules: "+n);i.dependecies=o,i.mappedModules=u,i.missingDependencies=o.filter(function(t){return!e[t].implementation}),i.modules=n,t(i)},a.waitTimeout||7e3)),i._loadModules(o).then(e,t)},t)}).then(function(e){if(clearTimeout(r),o){var t=i._getModuleImplementations(u);o.apply(o,t)}},function(t){clearTimeout(r),e&&e.call(e,t)})},_createModulePromise:function(e){var t=this;return new Promise(function(n,o){var i=t._getConfigParser().getModules(),r=i[e];if(r.exports){var s=t._getValueGlobalNS(r.exports);if(s)n(s);else{var u=function(i){if(i.indexOf(e)>=0){t.off("scriptLoaded",u);var s=t._getValueGlobalNS(r.exports);s?n(s):o(new Error("Module "+e+" does not export the specified value: "+r.exports))}};t.on("scriptLoaded",u)}}else{var a=function(o){o===e&&(t.off("moduleRegister",a),t._modulesMap[e]=!0,n(e))};t.on("moduleRegister",a)}})},_define:function(e,t,n,o){var i=o||{},r=this._getConfigParser(),s=this._getPathResolver();t=t.map(function(t){return s.resolvePath(e,t)}),i.name=e,i.dependencies=t,i.pendingImplementation=n,r.addModule(i),this._modulesMap[i.name]||(this._modulesMap[i.name]=!0),this.emit("moduleRegister",e)},_getConfigParser:function(){return this._configParser||(this._configParser=new e.ConfigParser(this._config)),this._configParser},_getDependencyBuilder:function(){return this._dependencyBuilder||(this._dependencyBuilder=new e.DependencyBuilder(this._getConfigParser())),this._dependencyBuilder},_getValueGlobalNS:function(e){return(0,eval)("this")[e]},_getMissingDepenencies:function(e){for(var t=this._getConfigParser(),n=t.getModules(),o=Object.create(null),i=0;i<e.length;i++)for(var r=n[e[i]],s=t.mapModule(r.dependencies),u=0;u<s.length;u++){var a=s[u],l=n[a];"exports"===a||"module"===a||l&&l.pendingImplementation||(o[a]=1)}return Object.keys(o)},_getModuleImplementations:function(e){for(var t=[],n=this._getConfigParser().getModules(),o=0;o<e.length;o++){var i=n[e[o]];t.push(i?i.implementation:void 0)}return t},_getPathResolver:function(){return this._pathResolver||(this._pathResolver=new e.PathResolver),this._pathResolver},_getURLBuilder:function(){return this._urlBuilder||(this._urlBuilder=new e.URLBuilder(this._getConfigParser())),this._urlBuilder},_filterModulesByProperty:function(e,t){var n=t;"string"==typeof t&&(n=[t]);for(var o=[],i=this._getConfigParser().getModules(),r=0;r<e.length;r++){var s=e[r],u=i[e[r]];if(u){if("exports"!==u&&"module"!==u){for(var a=0,l=0;l<n.length;l++)if(u[n[l]]){a=!0;break}a||o.push(s)}}else o.push(s)}return o},_loadModules:function(e){var t=this;return new Promise(function(n,o){var i=t._filterModulesByProperty(e,["requested","pendingImplementation"]);if(i.length){for(var r=t._getURLBuilder().build(i),s=[],u=0;u<r.length;u++)s.push(t._loadScript(r[u]));Promise.all(s).then(function(n){return t._waitForModules(e)}).then(function(e){n(e)})["catch"](function(e){o(e)})}else t._waitForModules(e).then(function(e){n(e)})["catch"](function(e){o(e)})})},_loadScript:function(e){var t=this;return new Promise(function(n,o){var i=document.createElement("script");i.src=e.url,i.onload=i.onreadystatechange=function(){this.readyState&&"complete"!==this.readyState&&"load"!==this.readyState||(i.onload=i.onreadystatechange=null,n(i),t.emit("scriptLoaded",e.modules))},i.onerror=function(){document.head.removeChild(i),o(i)},document.head.appendChild(i)})},_resolveDependencies:function(e){var t=this;return new Promise(function(n,o){try{var i=t._getDependencyBuilder().resolveDependencies(e);n(i)}catch(r){o(r)}})},_setModuleImplementation:function(e){for(var t=this._getConfigParser().getModules(),n=0;n<e.length;n++){var o=e[n];if(!o.implementation)if(o.exports)o.pendingImplementation=o.implementation=this._getValueGlobalNS(o.exports);else{for(var i,r=[],s=this._getConfigParser(),u=0;u<o.dependencies.length;u++){var a=o.dependencies[u];if("exports"===a)i={},r.push(i);else if("module"===a)i={exports:{}},r.push(i);else{var l=t[s.mapModule(a)],d=l.implementation;r.push(d)}}var f;f="function"==typeof o.pendingImplementation?o.pendingImplementation.apply(o.pendingImplementation,r):o.pendingImplementation,f?o.implementation=f:i&&(o.implementation=i.exports||i)}}},_waitForModule:function(e){var t=this,n=t._modulesMap[e];return n||(n=t._createModulePromise(e),t._modulesMap[e]=n),n},_waitForModules:function(e){var t=this;return new Promise(function(n,o){for(var i=[],r=0;r<e.length;r++)i.push(t._waitForModule(e[r]));Promise.all(i).then(function(i){var r=t._getConfigParser().getModules(),s=function(){for(var o=[],i=0;i<e.length;i++)o.push(r[e[i]]);t._setModuleImplementation(o),n(o)},u=t._getMissingDepenencies(e);u.length?t.require(u,s,o):s()},o)})}};return Object.keys(n).forEach(function(e){t.prototype[e]=n[e]}),t}),window.Loader=global.Loader,window.require=global.require,window.define=global.define}();