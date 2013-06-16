# grunt-parallel-behat [![Build Status](https://travis-ci.org/linusnorton/grunt-parallel-behat.png?branch=master)](https://travis-ci.org/linusnorton/grunt-parallel-behat)

> Run Behat Features in Parallel

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-parallel-behat
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-parallel-behat');
```

## Usage Examples

### Basic (using default options)

```javascript
grunt.loadNpmTasks('grunt-parallel-behat');
```

```sh
> grunt behat
```

By default it will assume the behat.yml is in the same folder as the grunt file and it will run any feature files under the current directory.

### Advanced usage

```js

grunt.initConfig({
    behat: {
        src: '/path/to/features/**/*.feature',
        config: './behat/behat.yml',
        maxProcesses: 5,
        bin: './bin/behat',
        flags: '--tags @wip'
    }
});
```

## License

Copyright (c) 2013 Linus Norton

Licensed under the MIT license.
