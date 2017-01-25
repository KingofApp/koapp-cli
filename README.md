# koapp-cli

![Koa-logo](http://kingofapp.es/wp-content/uploads/2015/02/logoking-r1.png)


### Installation

First, you need [npm](https://www.npmjs.com/). Once you have installed that run the following commands:

```bash
#dependencies
npm install -g cordova
npm install -g yo
npm install -g generator-koapp-module
npm install -g generator-koapp-theme
npm install -g generator-koapp-spinner
#koapp-cli
npm install -g koapp-cli
```

If you have issues with ``EACCESS`` you should check [npm guide to fix permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions).


### Usage

King of App Command-Line Interface provides developers some helpful commands that can assist you while you build your app.

Launching King of App CLI is very easy:

```bash
koapp
```

* ``init <template>``

  Create a new Cordova Project on the given path and download our [Visualizer]('http://docs.kingofapp.com/visualizer') to preview your app.

* ``create <module|spinner|theme>``

  Create a new module, spinner or theme. An assistant will ask you for some parameters.

* ``serve``

  This command will launch King of App Visualizer at ```http://localhost:9001```. You need to be inside the King of App Visualizer folder of your project.

* ``add``

  Use this command to download and install modules, themes or spinners in your app. After you download a module, an assistant will guide you with the routes.

* ``help``

  Display the list of avaliable commands and some help.

### License
MIT © [King of App](https://github.com/KingofApp)
