# webpack-cascade-optimizer-plugin

A Webpack plugin that distributes common code along output files on a First-come, First-served basis.

**This simple Webpack plugin allows you to get splitChunksPlugin's optimizations without splitting!**

**NOTE:**

* This plugin may be necessary only for some projects with a particular structure.

* This plugin is intended to be used in the case of an ***entry object*** configuration. (SEE Usage)

* I just wanted to share this with people who may need it as I did.

* Obviously, functionality and customization should be extended in future releases. First release is basic.

## Why?

Generally, Webpack splitChunksPlugin does a very good job finding out common modules along generated chunks, but gives us little control on **how those common modules should be distributed.**

Our options are practically limited to creating one or more chunks where common modules will be placed, but if we wanted to go beyond that, especially in a multiple entry setup (using an ***entry object***) things can get complicated very fast.

The following example of what webpack-cascade-optimizer-plugin does should be self-explanatory:

```
/*

    ENTRY FILES:

        - fileA.js
            - fileAUniqueContent
            - dep1.js
            - dep3.js
            - dep4.js
            
        - fileB.js
            - fileBUniqueContent
            - dep1.js
            - dep2.js
            - dep3.js
            - dep5.js
        
        - fileC.js
            - fileCUniqueContent
            - dep1.js
            - dep3.js
            - dep4.js
            - dep5.js
        
        
    OUTPUT FILES:
    
        WITH webpack-cascade-optimizer-plugin
        
        - fileA.js
            - runtime
            - fileAUniqueContent
            - dep1.js
            - dep3.js
            - dep4.js
            
        - fileB.js
            - fileBUniqueContent
            - dep2.js
            - dep5.js
        
        - fileC.js
            - fileCUniqueContent
            
            
        WITH splitChunksPlugin ALONE (USING AN AGGRESSIVE CONFIGURATION)
        
        - fileA.js
            - fileAUniqueContent
            
        - fileB.js
            - fileBUniqueContent
        
        - fileC.js
            - fileCUniqueContent
            
        - vendors~fileA~fileB~fileC
            - dep1.js
            - dep3.js
       
        - vendors~fileA~fileC
            - dep4.js
            
        - vendors~fileB~fileC
            - dep5.js
            
        - vendors~fileB
            - dep2.js
            
        - runtime.js
        
 */
```

**This is specially useful if** you are loading your files in a sequence (fileA.js -> fileB.js -> fileC.js) and you want your code to be usable before all files are loaded. **Successive files while reuse modules already loaded by previous files!**

### Install

```
npm install webpack-cascade-optimizer-plugin --save-dev
```

### Usage

```
const CascadeOptimizer = require('webpack-cascade-optimizer-plugin');
```

```
// webpack.config.js

{
    [...]
    entry: {
        fileA: 'path/to/fileA.js',
        fileB: 'path/to/fileB.js',
        fileC: 'path/to/fileC.js',
    },
    output: {
        filename: '[name].js',
        path: 'output/path'
    },
    plugins: [
        new CascadeOptimizer({
            fileOrder: ['fileA, 'fileB', 'fileC', '[...]']
        })
    ]
    [...]
}
```

No additional configuration needed!

This plugin will override the following properties in Webpack configuration:

* ***chunks***, ***name***, ***automaticNameDelimiter*** and ***cacheGroups*** in ***optimization.splitChunks***
 
* ***runtimeChunk*** in ***optimization***

Runtime will be included only once in the first file of ***fileOrder*** array.

### Options

**fileOrder [array]** ***required***

Array of files names in the order in which the plugin should prioritize common code distribution.

## Authors

* **Ernesto Stifano** - *Initial work* - [ernestostifano](https://github.com/ernestostifano)

See also the list of [contributors](https://github.com/ernestostifano/webpack-cascade-optimizer-plugin/graphs/contributors) who participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Webpack splitChunksPlugin
* Webpack removeEmptyChunksPlugin

