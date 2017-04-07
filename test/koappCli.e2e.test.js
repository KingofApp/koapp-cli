(function() {
  'use strict';
  var expect  = require('chai').expect;
  var shell   = require('shelljs');
  var fs      = require('fs');
  var ls      = shell.ls;


  var projectNameMock            = 'testProject';
  var projectNameWithoutDepsMock = 'testProjectNoDeps';
  var projectNameDevMock         = 'testProjectDev';

  describe('[e2e] koappCli', function() {
    this.timeout(180000);

    describe('init', function() {
      describe('on success', function () {
        it('should create a standard koapp project', function(done) {
          var command = 'koapp init ' + projectNameMock;
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer';
            var projectFiles = ls(projectNameMock).stdout.replace(/\n/g, '');
            expect(err).to.be.equal(0);
            expect(files.indexOf('testProject')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });

        it('should create a no deps koapp project', function(done) {
          var command = 'koapp init ' + projectNameWithoutDepsMock + ' --no-deps';
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer';
            var projectFiles = ls(projectNameWithoutDepsMock).stdout.replace(/\n/g, '');
            expect(err).to.be.equal(0);
            expect(files.indexOf('testProject')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });

        it('should create a dev koapp project', function(done) {
          var command = 'koapp init ' + projectNameDevMock + ' --dev';
          shell.exec(command, function(err) {
            var files = ls().stdout;
            var visualizer = 'com.kingofapp.visualizer.dev';
            var projectFiles = ls(projectNameDevMock).stdout.replace(/\n/g, '');
            expect(err).to.be.equal(0);
            expect(files.indexOf('testProjectDev')).to.be.not.equal(-1);
            expect(projectFiles).to.be.a('string');
            expect(projectFiles).to.be.equal(visualizer);
            done();
          });
        });
      });
    });

    describe('add', function() {
      beforeEach(function() {
        shell.cd(__dirname);
      });

      describe('test add on a standard koapp project', function() {
        describe('on success', function() {
          it('should add a service to a standard koapp project', function(done) {
            testPlugin({ env: 'standard', pluginType: 'service', pluginName: 'test', folder: 'services', done: done });
          });

          it('should add a theme to a standard koapp project', function(done) {
            testPlugin({ env: 'standard', pluginType: 'theme', pluginName: 'candy', folder: 'themes', done: done });
          });

          it('should add a spinner to a standard koapp project', function(done) {
            testPlugin({ env: 'standard', pluginType: 'spinner', pluginName: 'fitness', folder: 'spinners', done: done });
          });
        });
      });

      describe('test add on a dev koapp project', function() {
        describe('on success', function() {
          it('should add a service to a dev koapp project', function(done) {
            testPlugin({ env: 'dev', pluginType: 'service', pluginName: 'test', folder: 'services', done: done });
          });

          it('should add a theme to a dev koapp project', function(done) {
            testPlugin({ env: 'dev', pluginType: 'theme', pluginName: 'candy', folder: 'themes', done: done });
          });

          it('should add a spinner to a dev koapp project', function(done) {
            testPlugin({env: 'dev', pluginType: 'spinner', pluginName: 'fitness', folder: 'spinners', done: done});
          });
        });
      });
    });

    xdescribe('remove', function() {
      describe('test remove on a standard koapp project', function() {
        describe('on success', function() {

        });
      });
    });

    after(function(done) {
      shell.exec('rm -fr testProject && rm -fr testProjectNoDeps && rm -fr testProjectDev', function(err) {
          var files = shell.ls().stdout;
          expect(err).to.be.equal(0);
          expect(files.indexOf(projectNameMock)).to.be.equal(-1);
          expect(files.indexOf(projectNameWithoutDepsMock)).to.be.equal(-1);
          expect(files.indexOf(projectNameDevMock)).to.be.equal(-1);
          done();
      });
    });
  });





  function testPlugin(options) {
    var command = 'koapp add ' + options.pluginType + ' ' + options.pluginName;
    var visualizerFolder = options.env === 'standard' ?
                                    './../' + projectNameMock + '/com.kingofapp.visualizer/www/' + options.folder :
                                    './../' + projectNameDevMock + '/com.kingofapp.visualizer.dev/www/' + options.folder;

    shell.cd(visualizerFolder);
    shell.exec(command, function(err) {
      expect(err).to.be.equal(0);

      var files = shell.ls().stdout.split('\n');
      
      expect(files.indexOf(options.pluginName)).to.be.not.equal(-1);
      checkStructureOnAdd(options.pluginType, options.pluginName, options.done);
    });
  }

  function checkStructureOnAdd(pluginType, pluginName, done) {
    shell.cd('./../core');

    fs.readFile('structure.json', 'utf-8', function(err, data) {
      expect(err).to.be.a('null');
      
      var jsonData = JSON.parse(data);
      pluginType === 'service' ?
                    performServiceExpects(jsonData) :
                    performThemeExpects(pluginType, pluginName, jsonData);
      done();
    });
  }

  function performServiceExpects(jsonData) {
    expect(jsonData).to.have.property('services');
    expect(jsonData.services).to.have.property('test');
    expect(jsonData.services.test).to.have.property('name', 'test');
  }

  function performThemeExpects(pluginType, pluginName, jsonData) {
    expect(jsonData).to.have.property('config');
    expect(jsonData.config).to.have.property(pluginType);
    expect(jsonData.config[pluginType]).to.have.property('identifier');
    expect(jsonData.config[pluginType].identifier).to.have.equal(pluginName);
  }
})();