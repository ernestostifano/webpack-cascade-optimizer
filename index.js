"use strict";

/** @license webpack-cascade-optimizer-plugin v1.0.0
 *
 * Copyright (c) ernestostifano and its affiliates.
 *
 * This source code is licensed under the ISC license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

module.exports = class CascadeOptimizer {

    constructor(options) {
        this.options = options;
    }

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
            name: this.options.fileOrder[0]
        };

        compiler.hooks.thisCompilation.tap('CascadeOptimizer', (compilation) => {

            compilation.hooks.afterOptimizeChunks.tap('CascadeOptimizer', (chunks) => {

                let targetName = null;
                let targetIndex = null;
                let c = null, t = null;
                let length = chunks.length;

                // DISTRIBUTE COMMON CODE ALONG OUTPUT FILES
                for (c = length - 1; c >= 0; c--) {

                    // SEARCH FOR A CUSTOM CHUNK
                    if (chunks[c].name.match(/^custom~.+$/)) {

                        // CHOOSE TARGET CHUNK BASED ON FILE PRIORITY
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