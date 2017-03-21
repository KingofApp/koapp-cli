var koappTools    = require('koapp');
var shell         = require('shelljs');
var fs            = require('fs');
var async         = require('async');
var _             = require('lodash');
var jsonfile      = require('jsonfile');
var chalk         = require('chalk');
var data          = {};
var platform      = "";
var specificDeps  = {
  'ios': {'dep':'https://github.com/apache/cordova-plugins.git#master:wkwebview-engine-localhost', 'version':'@4.0.0'},
  'android': {'dep':'cordova-plugin-crosswalk-webview@1.7','version':'@5.0.0'}
};

module.exports = {
  build : build,
  help  : help
}

function build(projectName, platform, options) {
  if(!projectName) return console.error(new Error('Project name is mandatory'));
  if(!platform) return console.error(new Error('Platform is mandatory'));
  jsonfile.readFile('com.kingofapp.visualizer/www/core/structure.json', function(err, obj) {
    var cordova = `cordova create ${projectName} ${obj.packageName || "com.kingofapp.sampleApp"} ${(obj.name || "sampleApp")} --link-to=com.kingofapp.visualizer/www`;
    //Read Config
    data = obj;
    shell.exec(cordova, function(err) {
      if(err) return console.error(new Error(err));
      shell.cd(projectName);
      var functions = buildSteps(platform, options);
      async.series(functions, function(err, result) {
        //TODO nice logs formatting
        if(err) return console.error(err);
        console.log(chalk.green("Done!"));
      });
    })
  });
}

function buildSteps(platform, options) {
  var functions = [
    addCordobaPreferences,
    _.partial(addCordovaPlugins, platform),
  ];
  if(options.indexOf('--no-platform') === -1) {
    functions.push(_.partial(addPlatform, platform));
    if(options.indexOf('--no-image') === -1) functions.push(_.partial(addSplashAndIcon, projectName));
  }
  return functions;
}

function addSplashAndIcon(projectName, callback) {
  console.log(chalk.red("Generating icon and splash"));
  shell.cp('-f','../com.kingofapp.visualizer/www/images/icon.png', 'icon.png');
  shell.cp('-f','../com.kingofapp.visualizer/www/images/splash.png', 'splash.png');
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
  console.log(chalk.red("Adding cordova Dependencies..."));
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
};

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

function addPlatform(platform, callback) {
  console.log(chalk.red('Adding platform...'));

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
  var command = chalk.red('koapp ') + chalk.green('build') + chalk.blue('<projectName> <platform>');
  console.info(command);
  console.info();
  console.info('Build your Cordova project with all its dependencies for the selected platform');
  console.info();
}
