var shell     = require('shelljs');
var inquirer  = require('inquirer');
var chalk     = require('chalk');

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
  type: 'inpt',
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
  ['userName'           , '-u'],
  ['homepage'           , '-w'],
  ['spanishDescription' , '-s'],
  ['englishDescription' , '-e'],
  ['price'              , '-p'],
  ['license'            , '-l'],
  ['categories'         , '-c']
];

var createOptions = ['module, theme, spinner'];

module.exports = {
  help    : help,
  create  : create
}

function create(pluginType){
  var validType = /^(module|theme|spinner)/.test(pluginType);
  if(!pluginType || !validType) return console.error('Plugin type should be "module", "spinner" or "theme"');

  inquirer.prompt(prompt).then(function (answers) {
    var generate = 'yo koapp-' + pluginType;
    generate += ' -n ' + answers.pluginName;
    createPluginOptions.forEach(function(keyAndAlias) {
      var answer = answers[keyAndAlias[0]];
      if(answer) generate += ' ' + keyAndAlias[1] + ' ' + answer;
    });
    shell.exec(generate, function (err, data) {
      console.log(pluginType + ' has been created');
    });
  });
}

function help() {
  var command = chalk.red('koapp ') + chalk.green('create ') + chalk.blue('<module | spinner | theme>');
  console.info(command);
  console.info();
  console.info('Create a new module, spinner or theme.');
  console.info();
}
