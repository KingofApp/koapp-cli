require('console.mute');
var shell     = require('shelljs');
var chalk     = require('chalk');
var inquirer  = require('inquirer');
var jsonfile  = require('jsonfile');
var async     = require('async');
var tools     = require('koapp');

module.exports = {
  help: help,
  add: add,
  buildPlugin: buildPlugin
};
var debugMode = false;
var visualizerFolder;

function add(debug, pluginType, pluginName, env) {
  debugMode = debug;
  
  visualizerFolder = (env && env[0] === 'dev') ? 'com.kingofapp.visualizer.dev' : visualizerFolder = 'com.kingofapp.visualizer';

  console.log('Start add');
  var validType = /^(module|theme|spinner|service)$/.test(pluginType);
  if(!pluginType || !validType) return tools.debugLog(chalk.red('\nPlugin type should be "module", "service", "spinner" or "theme"\n'), debugMode);
  if(!pluginName) return tools.debugLog(chalk.red('\nPlugin name is mandatory.\n'), debugMode);

  var packageName = fixPluginName(pluginName, pluginType);

  jsonfile.readFile(`./${visualizerFolder}/www/core/structure.json`, function(err, obj) {
    if(err) return tools.debugLog(chalk.red(`\nError reading file structure.json. Please make sure the folder "${visualizerFolder}" exists in your project folder.\n`), debugMode);

    var newName = cleanPluginName(packageName);
    if (checkIfExists(pluginName, pluginType)) {
      console.log('Check if exists');
      buildPlugin(pluginType, newName, obj);
    } else {
      console.log('Read file success');
      shell.cd(`./${visualizerFolder}/www/${pluginType}s`);
      shell.exec(`npm install ${packageName} --prefix ./`, function(err, data) {
        if(err) return tools.debugLog(chalk.red(`\nError installing ${pluginName} from NPM. ${pluginType} does not exist.\n`), debugMode);
        
        shell.mv(`./node_modules/${packageName}`, `./${newName}`);
        shell.rm('-fr', ['etc', 'node_modules']);
        shell.cd(`../../../`);
        buildPlugin(pluginType, newName, obj);
      });
    }
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

function checkIfExists(pluginName, pluginType) {
  if (pluginName.indexOf(`koapp-${pluginType}-`) !== -1) pluginName = pluginName.replace(`koapp-${pluginType}-`, '');
  shell.cd(`./${visualizerFolder}/www/${pluginType}s`);
  var filesList = shell.ls().stdout;
  var found = (filesList.indexOf(pluginName) !== -1);
  shell.cd(`../../../`);
  return found;
}

function fixPluginName(pluginName, pluginType) {
  return ((pluginName.indexOf(`koapp-${pluginName}-`) === -1) ?
        `koapp-${pluginType}-${pluginName.replace(/ /g, '-')}` :
        pluginName);
}

function dumpStructureAndBowerInstall(packageName, pluginType, structure) {
  var pluginFolder = (pluginType === 'theme' || pluginType === 'spinner') ? `${pluginType}s/koapp-${pluginType}-${packageName}` :
                                                                            `${pluginType}s/${packageName}`;

  jsonfile.writeFile(`./${visualizerFolder}/www/core/structure.json`, structure, { spaces:2 }, function(err, data) {
    if(err) return tools.debugLog(chalk.red(`\nError reading file structure.json. Please make sure the folder "${visualizerFolder}" exists in your project folder.\n`), debugMode);
    if (pluginType === 'module' || pluginType === 'service') {
      shell.cd(`./${visualizerFolder}/www/${pluginFolder}`);
      shell.exec('bower install');
      tools.debugLog(chalk.green(`${packageName} dependencies have been downloaded and installed.`), debugMode);
    }
    tools.debugLog(chalk.green('Plugin has been successfuly installed.'));
  });
  

  /*async.series(
    [
      _.partial(jsonfile.writeFile, './com.kingofapp.visualizer/www/core/structure.json', structure, {spaces:2}),
      _.partial(shell.cd, './com.kingofapp.visualizer/www/' + pluginFolder),
      _.partial(shell.exec, 'bower install')
    ],
    function (err, data) {
      if(err) return tools.debugLog(chalk.red('[ERROR] ' + err), debugMode);
      tools.debugLog(chalk.green(packageName + ' has been downloaded and installed'), debugMode);
    }
  );*/
}

function buildThemeOrSpinner(name, type, structure){
  structure.config[type].identifier = name;
  structure.config[type].path = `${type}s/${name}/${name}.html`;
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
    tools.debugLog(chalk.red(`\n${err.message}\n`, debugMode));
  });
}

function buildServiceInApp(name, structure) {
  if (!structure.services) {
    structure.services = {};
  }

  if (structure.services[name]) {
    return tools.debugLog(chalk.red(`\nService already exists. You can't have duplicated services in your application.\n`), debugMode);
  } else {
    getModuleConfig(name, 'service')
    .then(function(config) {
      var packageName = cleanPluginName(name);

      insertServiceInApp(config, packageName, structure);
    })
    .catch(function(err){
      tools.debugLog(chalk.red(`\n${err.message}\n`), debugMode);
    });
  }
}

function insertModuleInApp(route, pluginConfig, packageName, app, userInput) {
  var cleanPackageName = userInput || cleanPluginName(packageName);
  var moduleName = `/${cleanPackageName}-abcd`;
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

function cleanPluginName(pluginName) {
  return pluginName.replace(/koapp-(module|spinner|theme|service)-/g, '');
}

function getModuleConfig(packageName, pluginType, userInput) {
  return new Promise(function(resolve, reject) {
    var config = jsonfile.readFileSync(`./${visualizerFolder}/www/${pluginType}s/${packageName}/config.json`);
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
  var command = chalk.yellow('koapp add <module | spinner | theme | service> <pluginName>');
  tools.debugLog(command, debugMode);
  tools.debugLog('', debugMode);
  tools.debugLog('Download and adds the selected plugin to your project.', debugMode);
  tools.debugLog('', debugMode);
}
