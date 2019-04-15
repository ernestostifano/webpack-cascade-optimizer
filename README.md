# webpack-cascade-optimizer-plugin

A Webpack plugin that distributes common code along output files on a First-come, First-served basis.

## Why?



### Install

```
npm install webpack-cascade-optimizer-plugin --save-dev
```

### Usage

```
const CascadeOptimizer = require('webpack-cascade-optimizer-plugin');
```

```
{
    [...]
    plugins: [
        new CascadeOptimizer({
            fileOrder: ['filename1', 'filename2', 'filename3', '[...]']
        })
    ]
    [...]
}
```

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

