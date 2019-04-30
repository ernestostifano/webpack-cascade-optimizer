"use strict";

/** @license webpack-cascade-optimizer-plugin v1.0.3
 *
 * Copyright (c) 2019, ernestostifano
 *
 * This source code is licensed under the ISC license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

module.exports = class CascadeOptimizer {

    /**
     * @param {Object}      options
     * @param {Array}       options.fileOrder
     */

    constructor(options) {
        this.options = options;
    }

    /**
     * @param {Object}      compiler
     * @param {Object}      compiler.options
     * @param {Object}      compiler.options.optimization
     * @param {Object}      compiler.options.splitChunks
     * @param {Object}      compiler.hooks
     * @param {Object}      compiler.hooks.thisCompilation
     * @param {function}    compiler.hooks.thisCompilation.tap
     */

    apply(compiler) {

        // OVERRIDE OPTIONS
        compiler.options.optimization.splitChunks.chunks = 'async';
        compiler.options.optimization.splitChunks.name = true;
        compiler.options.optimization.splitChunks.automaticNameDelimiter = '~';
        compiler.options.optimization.splitChunks.cacheGroups = {
            default: false,
            vendors: false,
            custom: {
                test: /(node_modules)/,
                chunks: 'all',
                enforce: true
            }
        };
        compiler.options.optimization.runtimeChunk = {
            name: typeof this.options.fileOrder[0] === "string" ? this.options.fileOrder[0] : compiler.options.optimization.runtimeChunk.name
        };

        compiler.hooks.thisCompilation.tap('CascadeOptimizer',

            /**
             * @param {Object}      compilation
             * @param {Object}      compilation.hooks
             * @param {Object}      compilation.hooks.afterOptimizeChunks
             * @param {function}    compilation.hooks.afterOptimizeChunks.tap
             */

            (compilation) => {

            compilation.hooks.afterOptimizeChunks.tap('CascadeOptimizer',

                /**
                 * @param {Array[]}     chunks
                 * @param {function}    chunks[].moveModule
                 * @param {function}    chunks[].isEmpty
                 * @param {function}    chunks[].hasRuntime
                 * @param {function}    chunks[].hasEntryModule
                 * @param {Array}       chunks[].modulesIterable
                 */

                (chunks) => {

                let targetName = null;
                let targetIndex = null;
                let c = null, t = null;
                let length = chunks.length;

                // DISTRIBUTE COMMON CODE ALONG OUTPUT FILES
                for (c = length - 1; c >= 0; c--) {

                    // SEARCH FOR A CUSTOM CHUNK
                    if (chunks[c].name.match(/^custom~.+$/)) {

                        // CHOOSE TARGET CHUNK BASED ON PROVIDED FILE NAME ORDER
                        targetName = null;
                        targetIndex = null;
                        chunks[c].name.replace(/^custom~/, '').split('~').forEach((name) => {
                            this.options.fileOrder.forEach((fileName, index) => {
                                if (name === fileName && (targetName === null || index < targetIndex)) {
                                    targetName = fileName;
                                    targetIndex = index;
                                }
                            });
                        });

                        // SEARCH FOR TARGET CHUNK
                        for (t = 0; t < length; t++) {
                            if (chunks[t].name === targetName) {
                                // MOVE MODULES FROM CUSTOM CHUNK TO TARGET CHUNK
                                chunks[c].modulesIterable.forEach((module) => {
                                    chunks[c].moveModule(module, chunks[t]);
                                });
                                // REMOVE CUSTOM CHUNK
                                if (chunks[c].isEmpty() && !chunks[c].hasRuntime() && !chunks[c].hasEntryModule()) {
                                    chunks[c].remove();
                                    chunks.splice(c, 1);
                                }
                                break;
                            }
                        }

                    }

                }

            });

        });

    };

};