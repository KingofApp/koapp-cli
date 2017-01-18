var shell   = require('shelljs');

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


module.exports = function(vorpal){
  vorpal
  .command('create <plugin>', 'create a new koapp plugin')
  .autocomplete(createOptions)
  .action(createPlugin)
}

function createPlugin(args, callback){
  var option = args.plugin;
  return this.prompt(prompt, function (answers) {
    var generate = 'yo koapp-' + option;
    generate += ' -n ' + answers.pluginName;
    createPluginOptions.forEach(function(keyAndAlias) {
      var answer = answers[keyAndAlias[0]];
      if(answer) generate += ' ' + keyAndAlias[1] + ' ' + answer;
    });
    shell.exec(generate, function (err, data) {
      callback(err, data);
    });
  });
}
