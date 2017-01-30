var koappTools    = require('koapp');
var shell         = require('shelljs');
var fs            = require('fs');
var async         = require('async');
var _             = require('lodash');
var data          = {};
var platform      = "";
var specificDeps  = {
  'ios': {'dep':'https://github.com/apache/cordova-plugins.git#master:wkwebview-engine-localhost', 'version':'@4.0.0'},
  'android': {'dep':'cordova-plugin-crosswalk-webview','version':'@6.0.0'}
};

module.exports = {
  build : build,
  help  : help
}

function build(platformArg) {
  platform = platformArg;
  //TODO Check splash screen, logo and name

  //Read Config
  koappTools.readConfig(function(err, obj) {
    data = obj;

    async.series([
      removePlatform,
      addCordovaPlugins,
      addPlatform
    ], function(err, result) {
      //TODO nice logs formatting
      console.log("---Done!");
    });
  });
}

//Add particular cordova plugins
function addCordovaPlugins(callback) {
  //TODO Check and compare plugin list with cordova plugins list and install consequently
  var plugins = ['cordova-plugin-device', 'cordova-plugin-geolocation',
    'cordova-plugin-console', 'cordova-plugin-dialogs',
    'cordova-plugin-globalization', 'cordova-plugin-statusbar',
    'cordova-plugin-splashscreen',
    'https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git',
    specificDeps[platform]['dep']
  ];
  plugins = _.union(plugins, getCordobaDeps(data.modules), getCordobaDeps(data.services));

  var commands = _.map(plugins, function(plugin) {
    return "cordova plugin add " + plugin;
  });

  async.each(commands, shell.exec, function(err, result) {
    callback(err);
  });
}

function removePlatform(callback) {
  console.log('---Removing platform...');
  var removePlatform = 'cordova platform remove ios && cordova platform remove android' ;
  shell.exec(removePlatform + ';', function(code, output) {
    console.log("Output Code", code);
    callback(code, output);
  });
}

function addPlatform(callback) {
  console.log('---Adding platform...');

  var platformVersion = platform + specificDeps[platform]['version'];
  var addPlatform = 'cordova platform add ' + platformVersion;
  shell.exec(addPlatform, function(code, output) {
    callback(code, output);
  });
}

function getCordobaDeps(items) {
  return koappTools.getUniqueItems(items, 'deps');
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('build ') + chalk.blue('<platform>');
  console.info(command);
  console.info();
  console.info('Build your Cordova project with all its dependencies for the selected platform');
  console.info();
}
