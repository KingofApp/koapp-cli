# koapp-cli

![Koa-logo](http://kingofapp.es/wp-content/uploads/2015/02/logoking-r1.png)

### Installation

```bash
$ npm install -g koapp-cli
```
### Requirements
- ImageMagick installed (*Mac*: `brew install imagemagick`, *Debian/Ubuntu*: `sudo apt-get install imagemagick`, *Windows*: [See here, install "Legacy tools"](http://www.imagemagick.org/script/binary-releases.php#windows))

- [npm](https://www.npmjs.com/). Once you have installed it run the following commands:
```bash
$ npm install -g cordova
$ npm install -g yo
$ npm install -g generator-koapp-module
$ npm install -g generator-koapp-theme
$ npm install -g generator-koapp-spinner
$ npm install -g generator-koapp-service
$ npm install -g cordova-icon
$ npm install -g cordova-splash
```

If you have issues with ``EACCESS`` you should check [npm guide to fix permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions).


### Usage

King of App Command-Line Interface provides developers some helpful commands that can assist you while you build your app.

You have the following command tools which you can use:

* ``koapp init <projectName>``

  Create a new King of App Project on the given path and download our [Visualizer]('http://docs.kingofapp.com/visualizer') to preview your app.

* ``koapp create <module|spinner|theme|service>``

  Create a new module, spinner, theme or service. An assistant will ask you for some parameters.

* ``koapp serve``

  This command will launch King of App Visualizer at ```http://localhost:9001```. You need to be inside the King of App Visualizer folder of your project.

* ``koapp add <module|spinner|theme|service> <pluginName> [moduleName]``

  Use this command to download and install modules, themes, spinners or services in your app. After you download a module, an assistant will guide you with the routes.

* ``koapp build <cordovaProjectName> <platform>``

  Create and build your Cordova project with all its dependencies for the selected platform. You need [Android SDK](https://developer.android.com/studio/index.html?hl=es-419) or [XCode](https://developer.apple.com/xcode/) to build your project.

  If you want your own icon and splash, you can replace them on 'com.kingofapp.visualizer/www/images' yourself. The splash screen image should be 2208x2208 px with a square center of around 1200x1200 px

* ``koapp help``

  Display the list of avaliable commands and some help.

### License
MIT © [King of App](https://github.com/KingofApp)
