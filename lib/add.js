var shell = require('shelljs');
var chalk = require('chalk');
var inquirer = require('inquirer');
var jsonfile = require('jsonfile');
var _         = require('lodash');
var async     = require('async');

module.exports = {
  help  : help,
  add   : add
}

function add(pluginType, pluginName) {
  var validType = /^(module|theme|spinner)/.test(pluginType);
  if(!pluginType || !validType) return console.error('Plugin type should be "module", "spinner" or "theme"');
  if(!pluginName) return console.error('Plugin name is mandatory');

  var packageName = fixPluginName(pluginName, pluginType);

  try{
    async.series(
      [
        _.partial(jsonfile.readFile, '../core/structure.json'),
        _.partial(shell.exec, 'npm install ' + packageName + ' --prefix ./'),
      ],
      function(err, data) {
        var newName = cleanPluginName(packageName);
        if(err) return console.error(new Error(err));
        shell.mv('node_modules/' + packageName, newName);
        shell.rm('-fr', ['etc', 'node_modules']);
        var structure = data[0];

        if (pluginType === 'module') buildModuleInApp(newName, structure)
        else buildThemeOrSpinner(newName, pluginType, structure);
      }
    );
  }catch(err){
    return console.error('structure.json not found')
  }
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
      if(err) return console.error(new Error(err));
      console.info(packageName + ' has been downloaded and installed');
    }
  )
}
function buildThemeOrSpinner(name, type, structure){
  structure[type].identifier = name;
  structure[type].path = type + 's/' + name + '/' + name + '.html';
  dumpStructureAndBowerInstall(name, structure);
}

function buildModuleInApp(moduleName, structure, callback) {
  var menus = getMenusFromApp(structure);
  var promptList = buildPromptList(menus);

  var config = getPluginConfig(moduleName);
  if(config.scope.menuItems) promptList.choices.push('root');

  inquirer.prompt(promptList).then(function(answers) {
    insertModuleInApp(answers.menuList, config, moduleName, structure, callback);
  });
}

function insertModuleInApp(route, pluginConfig, packageName, app) {
  var cleanPackageName = cleanPluginName(packageName);
  var moduleName = '/' + cleanPackageName + '-abcd';
  var newRoute = ((route === 'root') ? moduleName : route + moduleName);
  var newMenuItem = {
    path: newRoute,
    bgImage: "",
    bgColor: ""
  }
  if(route !== 'root') app.modules[route].scope.menuItems.push(newMenuItem)
  app.modules[newRoute] = pluginConfig;
  dumpStructureAndBowerInstall(packageName, app);
}

function cleanPluginName(pluginName) {
  return pluginName.replace(/koapp-(module|spinner|theme)-/g, '');
}

function getPluginConfig(packageName){
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
  })
  if(config.descriptionShort) delete config.descriptionShort;
  return config;
}

function getMenusFromApp(app) {
  var menus = [];
  for(var module in app.modules){
    if(app.modules[module].scope && app.modules[module].scope.menuItems) menus.push(module);
  }
  return menus;
}

function buildPromptList(menuList) {
  var routeList = []
  for(var menu in menuList) routeList.push(menuList[menu]);
  var prompt = {
    type: 'list',
    name: 'menuList',
    message: 'Choose a menu',
    required: true,
    choices: routeList
  }
  return prompt;
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('add ') + chalk.blue('<projectName> <pluginName>');
  console.info(command);
  console.info();
  console.info('Download the selected plugin on the current folder');
  console.info();
}
