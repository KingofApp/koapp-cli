var shell = require('shelljs');

module.exports = {
  help  : help,
  serve : serve
}


function serve() {
  shell.exec('npm start');
}
