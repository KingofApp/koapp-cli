var chalk     = require('chalk');
var jsonfile  = require('jsonfile');

module.exports = {
  help  : help,
  remove  : remove
};

function remove(pluginType, pluginId) {
  if(!checkPlugin(pluginType)) return console.error(chalk.red('Plugin must be "module" or "service"'));
  console.log('Trying to remove ' + pluginId);
  jsonfile.readFile('../core/structure.json', function(err, obj) {
    var plugin = obj[pluginType + 's'];
    if(err)                          return console.error(chalk.red(err));
    if(!plugin || !plugin[pluginId]) return console.error(chalk.red(pluginType + ' not found'));
    removeDeps(obj, pluginType, pluginId);
    delete plugin[pluginId];
    jsonfile.writeFile('../core/structurecp.json', obj, {spaces: 2}, function(err, data) {
      if(err) return console.error(err);
      console.log(chalk.green(pluginType + ' has been removed'));
    });
  });
}

function checkPlugin(pluginType) {
  var validPlugins = ['module', 'service'];
  return pluginType.indexOf(pluginType !== -1);
}

function removeDeps(app, pluginType, pluginId) {
  console.log('Looking for dependencies:')
  if (pluginType === 'module') {
    console.log(' - Modules');
    if(app.modules[pluginId].scope.menuItems) reestructurePaths(app, pluginId);
    var pathsToCheck = removeDepsInModules(app, pluginId);
    pathsToCheck.push(pluginId);
    removeInMenus(app, pathsToCheck);
    changeIndex(app, pluginId);
  }
  if(app.services){
    console.log(' - Services');
    removeDepsInServices(app, pluginType, pluginId);
  }
}

function changeIndex(app, path) {
  var index = app.config.index;
  var modulesPaths = Object.keys(app.modules);
  if(modulesPaths.indexOf(index) === -1){
    var newIndex = ((app.modules[modulesPaths[0]].scope.menuItems) ? modulesPaths[1] : modulesPaths[0]);
    app.config.index = newIndex;
  }
}

function reestructurePaths(app, modulePath) {
  var newModule = {}
  for(var moduleData in app.modules){
    if(moduleData.indexOf(modulePath)!==-1){
      var menuPath = app.modules[moduleData].path;
      var newModulePath = removeFromModulePath(moduleData, menuPath);
      app.modules[newModulePath] = copy(app.modules[moduleData]);
      delete app.modules[moduleData];
    }
  }
}

function removeInMenus(app, paths) {
  console.log('   - Menus');
  for(var module in app.modules){
    var moduleScope = app.modules[module].scope;
    if(moduleScope.menuItems){
      removeItemInMenu(moduleScope.menuItems, paths);
    }
  }
}

function removeItemInMenu(menuData, paths) {
  for(var menuItem in menuData){
    for(var path in paths){
      if(menuData[menuItem].path === paths[path])
        menuData.splice(menuItem, 1);
    }
  }
}

function removeDepsInModules(app, pluginId) {
  console.log('   - Requires');
  var identifier = modulePathToIdentifier(pluginId);
  var menuPathsToRemove = [];
  for(var module in app.modules){
    var currentModule = app.modules[module];
    var requireData = currentModule.requires;
    if(requireData &&
        checkDepsInRequire(identifier, pluginId, requireData) &&
        checkIfIsRequiredModule(identifier, pluginId, currentModule)){
          menuPathsToRemove.push(module);
          delete app.modules[module];
    }
  }
  return menuPathsToRemove;
}

function removeDepsInServices(app, pluginType, pluginId) {
  var identifier = ((pluginType === 'service') ? pluginId : modulePathToIdentifier(pluginId));
  for(var service in app.services){
    var currentService = app.services[service];
    if(currentService.require &&
      (currentService.require.indexOf(plugin) !== -1)) delete app.services[service];
  }
  if(Object.keys(app.services).length === 0) delete app.services;
}

function checkDepsInRequire(identifier, pluginId, requireData) {
  var result = false;
  if(Array.isArray(requireData) && (requireData.indexOf(identifier) !== -1)) return true;
  ['in', 'out'].forEach(function(key) {
    if(requireData[key] && requireData[key].indexOf(identifier) !== -1) result = true;
  });
  return result;
}

function removeFromModulePath(modulePath, menuPath) {
  var moduleArray = modulePath.split('/');
  var menuPathIndex = moduleArray.indexOf(menuPath);
  var newModulePathArray = moduleArray.splice(menuPathIndex, 1);
  return '/' + newModulePathArray.join('/');
}

/*
* From: http://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript
*/
function copy(o) {
  var _out, v, _key;
  _out = (Array.isArray(o) ? [] : {});
  for (_key in o) {
    v = o[_key];
    _out[_key] = (typeof v === "object") ? copy(v) : v;
  }
  return _out;
}

function checkIfIsRequiredModule(identifier, pluginId, moduleData) {
  if(moduleData.scope && moduleData.scope.childrenUrl)
    return moduleData.scope.childrenUrl[identifier] === pluginId;
}

function modulePathToIdentifier(modulePath) {
  var pathArray = modulePath.split('/');
  var moduleUniqueId = pathArray[pathArray.length - 1];
  return moduleUniqueId.split('-')[0];
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('init ') + chalk.blue('<projectName>');
  console.info(command);
  console.info();
  console.info('  Remove plugin module or service from your app.');
  console.info();
}
