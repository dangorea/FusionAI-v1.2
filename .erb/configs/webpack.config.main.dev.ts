/**
 * Webpack config for development electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import * as dotenv from 'dotenv';
import checkNodeEnv from '../scripts/check-node-env';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production') {
  checkNodeEnv('development');
}

const configuration: webpack.Configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.dllPath,
    filename: '[name].bundle.dev.js',
    library: {
      type: 'umd',
    },
  },

  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
      analyzerPort: 8888,
    }),

    new webpack.DefinePlugin({
      'process.type': '"browser"',
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      'process.env.AUTH0_DOMAIN': JSON.stringify(process.env.AUTH0_DOMAIN),
      'process.env.AUTH0_CLIENT_ID': JSON.stringify(
        process.env.AUTH0_CLIENT_ID,
      ),
      'process.env.AUTH0_AUDIENCE': JSON.stringify(process.env.AUTH0_AUDIENCE),
      'process.env.ELECTRON_START_URL': JSON.stringify(
        process.env.ELECTRON_START_URL || '',
      ),
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
