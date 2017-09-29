var tools         = require('koapp');
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
    if (!projectName) return tools.debugLog('Project name is mandatory', debug);
    if (!platform) return tools.debugLog('Platform is mandatory', debug);
    if (platform !== 'ios' && platform !== 'android' && platform !== 'none') return tools.debugLog('Invalid platform. Please choose between "ios" or "android".', debug);

    debugMode   = debug;
    commandData = buildData(options);
    projectName = canonize(projectName);

    jsonfile.readFile(`${commandData.repo}/www/core/structure.json`, function(err, obj) {
        if (err) return tools.debugLog(chalk.red(`\nError reading file structure.json. Please make sure the folder "${commandData.repo}" exists in your project folder.\n`), debugMode);

        obj.name = canonize(obj.name);

        var cordova = `cordova create ${projectName} ${obj.packageName || "com.kingofapp.sampleApp"} "${obj.name || "sampleApp")}" --link-to=${commandData.repo}/www`;
        data = obj;

        var cordovaBuildExec = shell.exec(cordova, { async: false });
        if (cordovaBuildExec.stderr) return tools.debugLog(cordovaBuildExec.stderr, debug);

        shell.cd(projectName);
        var functions = buildSteps(platform, projectName, options);
        async.series(functions, function(err, result) {
            if (err) return tools.debugLog(err, debugMode);

            if (options.indexOf('--dist') !== -1) {
                shell.rm('-rf', `${commandData.repo}/www`);
                shell.mv('-f', `${commandData.repo}/dist`, `${commandData.repo}/www`);
            }

            tools.debugLog(chalk.green("Done!"), debugMode);
        });
    });
}

// This function is prepared to handle more options in the future
function buildData(options) {
    var commandData = {
        repo: "com.kingofapp.visualizer"
    };

    if (options.indexOf('--dev') !== -1) commandData.repo += ".dev";
    if (options.indexOf('--dist') !== -1) {
        shell.mkdir('-p', `${commandData.repo}/dist`);
    }

    return commandData;
}

function buildSteps(platform, projectName, options) {
    var functions = [
        addCordovaPreferences,
        _.partial(addCordovaPlugins, platform),
        _.partial(addPlatform, platform)
    ];

    if (options.indexOf('--no-image') === -1) functions.push(_.partial(addSplashAndIcon, projectName));

    return functions;
}

function addSplashAndIcon(projectName, callback) {
    tools.debugLog(chalk.green("Generating icon and splash..."), debugMode);

    shell.cp('-f', `../${commandData.repo}/www/images/icon.png`, 'icon.png');
    shell.cp('-f', `../${commandData.repo}/www/images/splash.png`, 'splash.png');
    async.parallel([
        _.partial(shell.exec, 'cordova-icon'),
        _.partial(shell.exec, 'cordova-splash'),
        ], function (err, data) {
            if (err && err.indexOf('ENOENT') > -1) {
                return callback('Error executing ImageMagick. Check the Koapp-cli documentation to learn how to fix this problem (https://github.com/KingofApp/koapp-cli).');
            }

            shell.rm(['splash.png', 'icon.png']);
            shell.cd('..');
            callback(err, data);
   });
}

//Add cordova preferences
function addCordovaPreferences(callback) {
    tools.debugLog(chalk.green("Adding cordova Dependencies..."), debugMode);

    fs.readFile('config.xml', function(err, fileData) {
        if (fileData) {
            var output = cleanBody(fileData.toString());

            fs.writeFile('config.xml', output, function(err) {
                if (err) {
                    tools.debugLog(chalk.red('\nError writing into config.xml file. Please make sure you initialized a project and you are in the right folder.\n'), debugMode);
                    callback(err);
                }

                callback(null);
            });
        } else {
            tools.debugLog(chalk.red('\nError reading config.xml. Please make sure you initialized a project and you are in the right folder.\n'), debugMode);
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
    tools.debugLog(chalk.green('Adding cordova plugins...'));

    var plugins = ['cordova-plugin-device', 'cordova-plugin-geolocation', 'cordova-plugin-console', 'cordova-plugin-dialogs', 'cordova-plugin-globalization', 'cordova-plugin-statusbar', 'cordova-plugin-splashscreen', 'https://github.com/apache/cordova-plugin-inappbrowser.git'];

    if (['android', 'ios'].indexOf(platform) !== -1) plugins.push(specificDeps[platform]['dep']);

    plugins = _.union(plugins, getCordovaDeps(data.modules), getCordovaDeps(data.services));
    var commands = _.map(plugins, function(plugin) {
        return `cordova plugin add ${plugin}`;
    });

    function executeCommand(command, callback) {
        var result = shell.exec(command, { async: false });

        if (result.indexOf('Saved plugin info for') > -1) callback(null, result.stdout);
        else callback(result.stderr);
    }

    async.each(commands, executeCommand, callback);
}

function addPlatform(platform, callback) {
    tools.debugLog(chalk.green('Adding platform...'), debugMode);

    var platformVersion = platform + specificDeps[platform]['version'];
    var addPlatformCommand = `cordova platform add ${platformVersion}`;
    shell.exec(addPlatformCommand, function(code, output) {
        callback(code, output);
    });
}

function getCordovaDeps(items) {
    return tools.getUniqueItems(items, 'deps');
}

function canonize(str){
    return camelize(str.replace('_',' ')).replace(/[^a-zA-Z0-9]/gi,'');
}

function help() {
    var command = chalk.yellow('koapp build <projectName> <platform> [--dev || --no-image]');
    tools.debugLog(command, true);
    tools.debugLog('' , true);
    tools.debugLog('Build your Cordova project with all its dependencies for the selected platform', true);
    tools.debugLog('', true);
}
