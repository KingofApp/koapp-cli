require('console.mute');
var shell = require('shelljs');
var inquirer = require('inquirer');
var chalk = require('chalk');
var jsonfile = require('jsonfile');
var addHelpers = require('./add');
var tools = require('koapp');

var prompt = [{
  type: 'input',
  name: 'pluginName',
  message: 'Plugin name',
  required: true
}, {
  type: 'input',
  name: 'userName',
  message: 'Author\'s name'
}, {
  type: 'input',
  name: 'homepage',
  message: 'Author\'s homepage'
}, {
  type: 'input',
  name: 'spanishDescription',
  message: 'Spanish description'
}, {
  type: 'input',
  name: 'englishDescription',
  message: 'English description'
}, {
  type: 'input',
  name: 'license',
  message: 'License',
  default: 'MIT'
}, {
  type: 'input',
  name: 'categories',
  message: 'Categories (comma to split)'
}, {
  type: 'input',
  name: 'price',
  message: 'Price',
  default: 0
}];

var createPluginOptions = [
  ['userName', '-u'],
  ['homepage', '-w'],
  ['spanishDescription', '-s'],
  ['englishDescription', '-e'],
  ['price', '-p'],
  ['license', '-l'],
  ['categories', '-c']
];

var createOptions = ['module, theme, spinner, service'];

module.exports = {
  help: help,
  create: create
};

var debugMode = false;
var visualizerFolder;

function create(debug, pluginType, env) {
  visualizerFolder = env === 'dev' ? 'com.kingofapp.visualizer.dev' : 'com.kingofapp.visualizer';

  if (!debug) console.resume();
  var validType = /^(module|theme|spinner|service)/.test(pluginType);
  if (!pluginType || !validType) return console.error(chalk.red('[ERROR]Plugin type should be "module", "spinner", "theme" or "service"'));
  inquirer.prompt(prompt).then(function(answers) {
    var generate = 'yo koapp-' + pluginType + ' ' + answers.pluginName;

    shell.cd('./' + visualizerFolder + '/www/' + pluginType + 's');
    createPluginOptions.forEach(function(keyAndAlias) {
      var answer = answers[keyAndAlias[0]];
      if (answer) generate += ' ' + keyAndAlias[1] + ' ' + answer;
    });

    shell.exec(generate, function(err, data) {
      if (err) return console.error(chalk.red('[ERROR] Reading structure.json. Call "koapp create" from the folder initialized by "koapp init" that contains ' + visualizerFolder));

      shell.cd('../../..');
      jsonfile.readFile('./' + visualizerFolder + '/www/core/structure.json', function(err, obj) {
        if (err) return console.error(chalk.red('[ERROR] Reading structure.json. Call "koapp create" from the folder initialized by "koapp init" that contains ' + visualizerFolder));

        buildPlugin(pluginType, answers.pluginName, obj);
      });

      console.log(chalk.green(pluginType + ' has been created'));
    });

    /*shell.exec(generate, function(err, data) {
      jsonfile.readFile('./com.kingofapp.visualizer/www/core/structure.json', function(err, obj) {
        if (err) return console.error(chalk.red('[ERROR] Reading structure.json. Call "koapp create" from the folder initialized by "koapp init" that contains com.kingofapp.visualizer'));
        if (pluginType === 'service') addHelpers.buildServiceInApp(answers.pluginName, obj);
        if (pluginType === 'module') {
          var config = addHelpers.getModuleConfig(answers.pluginName);
          addHelpers.insertModuleInApp('root', config, answers.pluginName, obj);
        }
        if (pluginType === 'theme' || pluginType === 'spinner') addHelpers.buildThemeOrSpinner(answers.pluginName, obj);
      });
    });*/
  });
}

function buildPlugin(pluginType, newName, structure, userInput) {
  if (pluginType === 'module') {
    buildModuleInApp(newName, structure, userInput);
  } else if (pluginType === 'service') {
    buildServiceInApp(newName, structure);
  } else {
    buildThemeOrSpinner(newName, pluginType, structure);
  }
}

function buildThemeOrSpinner(name, type, structure){
  shell.cd('../../..');
  structure.config[type].identifier = name;
  structure.config[type].path = type + 's/' + name + '/' + name + '.html';
  dumpStructureAndBowerInstall(name, type, structure);
}

function buildModuleInApp(moduleName, structure, userInput) {
  var menus = getMenusFromApp(structure);
  var promptList = buildPromptList(menus);

  getModuleConfig(moduleName, 'module')
  .then(function(config) {
    if(config.scope.menuItems) promptList.choices.push('root');
    console.resume();
    inquirer.prompt(promptList).then(function(answers) {
      insertModuleInApp(answers.menuList, config, moduleName, structure, userInput);
      if(!debugMode) console.mute();
    });
  })
  .catch(function(err){
    tools.debugLog(err.message);
  });
}

function buildServiceInApp(name, structure) {
  if (!structure.services) {
    structure.services = {};
  }

  if (structure.services[name]) {
    return tools.debugLog('Service already exists', debugMode);
  } else {
    getModuleConfig(name, 'service')
    .then(function(config) {
      var packageName = cleanPluginName(name);

      insertServiceInApp(config, packageName, structure);
    })
    .catch(function(err){
      tools.debugLog(err.message);
    });
  }
}

function getModuleConfig(packageName, pluginType, userInput) {
  return new Promise(function(resolve, reject) {
    var config = jsonfile.readFileSync('./' + visualizerFolder + '/www/' + pluginType + 's/' + packageName + '/config.json');
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
    if (!config) reject();
    if(config.descriptionShort) delete config.descriptionShort;
    if(packageName !== config.identifier) {
      config = replaceByUserInput(config, packageName, userInput);
    }
    
    resolve(config);
  });
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
  dumpStructureAndBowerInstall(packageName, 'module', app);
}

function insertServiceInApp(pluginConfig, packageName, app) {
  app.services[packageName] = pluginConfig;
  app.services[packageName].identifier = packageName;

  dumpStructureAndBowerInstall(packageName, 'service', app);
}

function dumpStructureAndBowerInstall(packageName, pluginType, structure) {
  var pluginFolder = (pluginType === 'theme' || pluginType === 'spinner') ? pluginType + 's/koapp-' + pluginType + '-' + packageName :
                                                                            pluginFolder = pluginType + 's/' + packageName;

  jsonfile.writeFile('./' + visualizerFolder + '/www/core/structure.json', structure, {spaces:2}, function(err, data) {
    if(err) return tools.debugLog(chalk.red('[ERROR] ' + err), debugMode);

    if (pluginType === 'module' || pluginType === 'service') {

      shell.cd('./' + visualizerFolder + '/www/' + pluginFolder);
      shell.exec('bower install');
    }
    tools.debugLog(chalk.green(packageName + ' dependencies have been downloaded and installed'), debugMode);
  });
}

function cleanPluginName(pluginName) {
  return pluginName.replace(/koapp-(module|spinner|theme|service)-/g, '');
}

function checkIfExists(pluginName, pluginType) {
  if(pluginName.indexOf('koapp-' + pluginType + '-') !== -1) pluginName = pluginName.replace('koapp-' + pluginType + '-', '');
  var filesList = shell.ls().stdout;
  var found = (filesList.indexOf(pluginName) !== -1);
  return found;
}

function fixPluginName(pluginName, pluginType) {
  return ((pluginName.indexOf('koapp-' + pluginName + '-') === -1) ?
        'koapp-' + pluginType + '-' + pluginName.replace(/ /g, '-') :
        pluginName);
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
  console.resume();
  var command = chalk.yellow('koapp create <module | spinner | theme | service>');
  console.info(command);
  console.info();
  console.info('Create a new module, spinner, theme or service.');
  console.info();
}