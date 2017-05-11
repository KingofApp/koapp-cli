var koapp         = require('koapp');
var shell         = require('shelljs');
var fs            = require('fs');
var async         = require('async');
var _             = require('lodash');
var jsonfile      = require('jsonfile');
var chalk         = require('chalk');
var data          = {};
var platform      = "";
var specificDeps  = {
  'ios': {'dep':'https://github.com/apache/cordova-plugins.git#wkwebview-engine-localhost', 'version':'@4.0.0'},
  'android': {'dep':'cordova-plugin-crosswalk-webview@1.7','version':'@5.0.0'}
};
var commandData = {};
var debugMode;

module.exports = {
  build : build,
  help  : help
};

function build(debug, projectName, platform, options) {
  if(!projectName) return koapp.debugLog('Project name is mandatory', debug);
  if(!platform) return koapp.debugLog('Platform is mandatory', debug);
  debugMode = debug;
  commandData = buildData(options);
  jsonfile.readFile(commandData.repo + '/www/core/structure.json', function(err, obj) {
    if(err) return koapp.debugLog(error, debugMode);
    var cordova = `cordova create ${projectName} ${obj.packageName || "com.kingofapp.sampleApp"} "${(obj.name || "sampleApp")}" --link-to=${commandData.repo}/www`;
    data = obj;
    shell.exec(cordova, function(err) {
      if(err) return koapp.debugLog(err, debugMode);
      shell.cd(projectName);
      var functions = buildSteps(platform, projectName, options);
      async.series(functions, function(err, result) {
        if(err) return koapp.debugLog(err, debugMode);
        koapp.debugLog(chalk.green("Done!"), debugMode);
      });
    });
  });
}

// This function is prepared to handle more options in the future
function buildData(options) {
  var commandData = {
    repo: "com.kingofapp.visualizer"
  };
  if(options.indexOf('--dev') !== -1) commandData.repo += ".dev";
  if(options.indexOf('--dist') !== -1) {
    shell.rm('-fr', commandData.repo + '/www');
    shell.cp('-Rf', commandData.repo + '/dist', commandData.repo + '/www');
  }
  return commandData;
}

function buildSteps(platform, projectName, options) {
  var functions = [
    addCordobaPreferences,
    _.partial(addCordovaPlugins, platform),
  ];
  if((['android', 'ios'].indexOf(platform) !== -1) && (platform !== 'none')) {
    functions.push(_.partial(addPlatform, platform));
    if(options.indexOf('--no-image') === -1) functions.push(_.partial(addSplashAndIcon, projectName));
  }
  return functions;
}

function addSplashAndIcon(projectName, callback) {
  koapp.debugLog(chalk.red("Generating icon and splash"), debugMode);
  shell.cp('-f',`../${commandData.repo}/www/images/icon.png`, 'icon.png');
  shell.cp('-f',`../${commandData.repo}/www/images/splash.png`, 'splash.png');
  async.parallel([
    _.partial(shell.exec, 'cordova-icon'),
    _.partial(shell.exec, 'cordova-splash'),
  ], function (err, data) {
    if(err) return callback(err);
    shell.rm(['splash.png', 'icon.png']);
    shell.cd('..');
    callback(err, data);
  });
}

//Add cordova preferences
function addCordobaPreferences(callback){
  koapp.debugLog(chalk.red("Adding cordova Dependencies..."), debugMode);
   fs.readFile('config.xml', function(err, fileData) {
     if(fileData){
       var output = cleanBody(fileData.toString());
       fs.writeFile('config.xml', output, function(err) {
         callback(null);
       });
     }else{
       callback(err);
     }
   });
}

function cleanBody(body){
  var line = 3;
  var preferences     = '  <access origin="*" />\n' +
                        '  <allow-navigation href="*" /> \n' +
                        '  <preference name="AutoHideSplashScreen" value="false" />\n' +
                        '  <preference name="SplashScreenDelay" value="10000" />\n' +
                        '  <preference name="ShowSplashScreenSpinner" value="false" />\n' +
                        '  <preference name="FadeSplashScreen" value="true" />\n' +
                        '  <preference name="FadeSplashScreenDuration" value="1" />\n' +
                        '  <preference name="target-device" value="handset" />';
   var localServer    = '  <content src="http://localhost:56969" />\n';
   var result = body;
   result = result.replace('<platform name="ios">', '<platform name="ios">\n      ' + localServer);

   result = result.split('\n');
   result.splice(line,0,preferences);
   result = result.filter(function(str){ return str; });
   return result.join('\n');
}

//Add particular cordova plugins
function addCordovaPlugins(platform, callback) {
  var plugins = ['cordova-plugin-device', 'cordova-plugin-geolocation',
    'cordova-plugin-console', 'cordova-plugin-dialogs',
    'cordova-plugin-globalization', 'cordova-plugin-statusbar',
    'cordova-plugin-splashscreen',
    'https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git'
  ];
  if(['android', 'ios'].indexOf(platform) !== -1) plugins.push(specificDeps[platform]['dep']);
  plugins = _.union(plugins, getCordobaDeps(data.modules), getCordobaDeps(data.services));
  var commands = _.map(plugins, function(plugin) {
    return "cordova plugin add " + plugin;
  });

  async.each(commands, shell.exec, function(err, result) {
    callback(err);
  });
}

function addPlatform(platform, callback) {
  koapp.debugLog(chalk.red('Adding platform...'), debugMode);
  var platformVersion = platform + specificDeps[platform]['version'];
  var addPlatformCommand = 'cordova platform add ' + platformVersion;
  shell.exec(addPlatformCommand, function(code, output) {
    callback(code, output);
  });
}

function getCordobaDeps(items) {
  return koapp.getUniqueItems(items, 'deps');
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('build') + chalk.blue('<projectName> <platform>');
  koapp.debugLog(command, true);
  koapp.debugLog('' , true);
  koapp.debugLog('Build your Cordova project with all its dependencies for the selected platform', true);
  koapp.debugLog('', true);
}
