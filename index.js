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

                let customChunk = null;
                let customIndex = null;
                let commonTargetsNames = null;
                let targetName = null;
                let targetIndex = null;
                let targetChunk = null;
                let i = null;
                let length = null;
                let toRemove = [];

                // DISTRIBUTE COMMON CODE ALONG OUTPUT FILES
                chunks.forEach((chunkA, indexA) => {

                    // SEARCH FOR A CUSTOM CHUNK
                    if (chunkA.name.match(/^custom~.+$/)) {

                        customChunk = chunkA;
                        customIndex = indexA;
                        commonTargetsNames = chunkA.name.replace(/^custom~/, '').split('~');

                        // CHOOSE TARGET CHUNK BASED ON FILE PRIORITY
                        targetName = null;
                        targetIndex = null;
                        commonTargetsNames.forEach((name) => {
                            this.options.fileOrder.forEach((fileName, indexB) => {
                                if (fileName === name && (targetName === null || indexB < targetIndex)) {
                                    targetName = fileName;
                                    targetIndex = indexB;
                                }
                            });
                        });

                        // SEARCH FOR TARGET CHUNK
                        chunks.forEach((chunkB) => {
                            if (chunkB.name === targetName) {
                                targetChunk = chunkB;
                                // MOVE MODULES FROM CUSTOM CHUNK TO TARGET CHUNK
                                customChunk.modulesIterable.forEach((module) => {
                                    customChunk.moveModule(module, targetChunk);
                                    // ADD CUSTOM CHUNK TO REMOVE LIST
                                    toRemove.push(customChunk.name);
                                });
                            }
                        });

                    }

                });

                // REMOVE CHUNKS IN REMOVE LIST
                length = chunks.length;
                for (i = length - 1; i >= 0; i--) {
                    if (toRemove.includes(chunks[i].name) && chunks[i].isEmpty() && !chunks[i].hasRuntime() && !chunks[i].hasEntryModule()) {
                        chunks[i].remove();
                        chunks.splice(i, 1);
                    }
                }

            });

        });

    }

};