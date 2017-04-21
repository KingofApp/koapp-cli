require('console.mute');
var _         = require('lodash');
var shell     = require('shelljs');
var chalk     = require('chalk');
var inquirer  = require('inquirer');
var jsonfile  = require('jsonfile');
var async     = require('async');
var tools     = require('koapp');

module.exports = {
  help  : help,
  add   : add
};
var debugMode = false;

function add(debug, pluginType, pluginName, directory) {
  directory = directory[0];
  debugMode = debug;
  var validType = /^(module|theme|spinner|service)$/.test(pluginType);
  if(!pluginType || !validType) return tools.debugLog('Plugin type should be "module", "spinner" or "theme"', debugMode)
  if(!pluginName) return tools.debugLog(chalk.red('[ERROR]Plugin name is mandatory'), debugMode)

  var packageName = fixPluginName(pluginName, pluginType);
  jsonfile.readFile('../core/structure.json', function(err, obj) {
    if(err) return tools.debugLog(chalk.red('[ERROR] Reading ../core/structure.json') , debugMode)
    var newName = cleanPluginName(packageName);
    if(checkIfExists(pluginName)) buildPlugin(pluginType, newName, obj, directory);
    else
      shell.exec('npm install ' + packageName + ' --prefix ./', function(err, data) {
        if(err) return tools.debugLog(chalk.red('[ERROR] Installing ' + pluginName + ' from NPM.'), debugMode)
        shell.mv('node_modules/' + packageName, newName);
        shell.rm('-fr', ['etc', 'node_modules']);
        buildPlugin(pluginType, newName, obj, directory);
      });
  });
}

function buildPlugin(pluginType, newName, structure, userInput) {
  if (pluginType === 'module') buildModuleInApp(newName, structure, userInput);
  else if (pluginType === 'service') buildServiceInApp(newName, structure);
  else buildThemeOrSpinner(newName, pluginType, structure);
}

function checkIfExists(pluginName) {
  if(pluginName.indexOf('koapp-module-') !== -1) pluginName = pluginName.replace('koapp-module-', '');
  var filesList = shell.ls().stdout;
  var found = (filesList.indexOf(pluginName) !== -1);
  return found;
}

function fixPluginName(pluginName, pluginType) {
  return ((pluginName.indexOf('koapp-' + pluginName + '-') === -1) ?
        'koapp-' + pluginType + '-' + pluginName.replace(/ /g, '-') :
        pluginName);
}

function dumpStructureAndBowerInstall(packageName, structure) {
  async.series(
    [
      _.partial(jsonfile.writeFile, '../core/structure.json', structure, {spaces:2}),
      _.partial(shell.cd, packageName),
      _.partial(shell.exec, 'bower install')
    ],
    function (err, data) {
      if(err) return tools.debugLog(chalk.red('[ERROR] ' + err), debugMode)
      tools.debugLog(chalk.green(packageName + ' has been downloaded and installed'), debugMode)
    }
  );
}
function buildThemeOrSpinner(name, type, structure){
  structure.config[type].identifier = name;
  structure.config[type].path = type + 's/' + name + '/' + name + '.html';
  dumpStructureAndBowerInstall(name, structure);
}

function buildModuleInApp(moduleName, structure, userInput) {
  var menus = getMenusFromApp(structure);
  var promptList = buildPromptList(menus);

  var config = getModuleConfig(moduleName);
  if(config.scope.menuItems) promptList.choices.push('root');
  console.resume();
  inquirer.prompt(promptList).then(function(answers) {
    insertModuleInApp(answers.menuList, config, moduleName, structure, userInput);
    if(!debugMode) console.mute();
  });
}

function buildServiceInApp(name, structure) {
  if (!structure.services) {
    structure.services = {};
  }

  if (structure.services[name]) {
    return tools.debugLog('Service already exists', debugMode)
  } else {
    var config = getModuleConfig(name);
    var packageName = cleanPluginName(name);

    insertServiceInApp(config, packageName, structure);
  }
}

function insertModuleInApp(route, pluginConfig, packageName, app, userInput) {
  var cleanPackageName = userInput || cleanPluginName(packageName);
  var moduleName = '/' + cleanPackageName + '-abcd';
  var newRoute = ((route === 'root') ? moduleName : route + moduleName);
  var newMenuItem = {
    path: newRoute,
    bgImage: "",
    bgColor: ""
  };
  if(route !== 'root') app.modules[route].scope.menuItems.push(newMenuItem);
  app.modules[newRoute] = pluginConfig;
  dumpStructureAndBowerInstall(packageName, app);
}

function insertServiceInApp(pluginConfig, packageName, app) {
  app.services[packageName] = pluginConfig;
  app.services[packageName].identifier = packageName;

  dumpStructureAndBowerInstall(packageName, app);
}

function cleanPluginName(pluginName) {
  return pluginName.replace(/koapp-(module|spinner|theme|service)-/g, '');
}

function getModuleConfig(packageName, userInput){
  var config = jsonfile.readFileSync(packageName + '/config.json');
  [
    'description',
    'documentation',
    'downloads',
    'reviews',
    'comments',
    'config',
    'images'
  ].forEach(function(key) {
    delete config[key];
  });
  if(config.descriptionShort) delete config.descriptionShort;
  if(packageName !== config.identifier) {
    config = replaceByUserInput(config, packageName, userInput);
  }
  return config;
}

function replaceByUserInput(config, newIdentifier) {
  var toReplace = new RegExp(config.identifier, 'g');
  var configString = JSON.stringify(config);
  configString = configString.replace(toReplace, newIdentifier);
  return JSON.parse(configString);
}

function getMenusFromApp(app) {
  var menus = [];
  for(var module in app.modules){
    if(app.modules[module].scope && app.modules[module].scope.menuItems) menus.push(module);
  }
  return menus;
}

function buildPromptList(menuList) {
  var routeList = [];
  for(var menu in menuList) routeList.push(menuList[menu]);
  var prompt = {
    type: 'list',
    name: 'menuList',
    message: 'Choose a menu',
    required: true,
    choices: routeList
  };
  return prompt;
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('add ') + chalk.blue('<projectName> <pluginName>');
  tools.debugLog(command, debugMode)
  tools.debugLog('', debugMode)
  tools.debugLog('Download the selected plugin on the current folder', debugMode)
  tools.debugLog('', debugMode)
}
