const path = require('path');
const appPkg = require(path.join(__dirname, 'release', 'app', 'package.json'));

const REF = appPkg.version;
const CHANNEL = process.env.APP_CHANNEL || 'stable';
const SCHEME =
  process.env.PROTOCOL_SCHEME ||
  (CHANNEL === 'beta' ? 'angenai-beta' : 'angenai');

const strip = (v = '') => v.replace(/^['"]|['"]$/g, '');

module.exports = {
  productName: strip(process.env.APP_NAME),
  appId: strip(process.env.APP_ID),

  extraMetadata: {
    name: strip(process.env.APP_NAME_LOWERCASE),
    author: { name: 'Dan Gorea', email: 'dangorea9@gmail.com' },
    homepage: 'https://angen.ai',
  },

  buildVersion: REF,

  asar: true,
  asarUnpack: '**/*.{node,dll,dylib,so}',
  afterSign: '.erb/scripts/notarize.js',

  files: ['dist/**', 'node_modules/**', 'package.json'],

  protocols: {
    name: strip(process.env.APP_NAME),
    schemes: [SCHEME],
  },

  mac: {
    target: [{ target: 'default', arch: ['arm64', 'x64'] }],
    artifactName: `${strip(process.env.APP_NAME_LOWERCASE)}-${REF}-\${arch}.\${ext}`,
    icon: 'assets/icon',
    type: 'distribution',
    hardenedRuntime: true,
    gatekeeperAssess: true,
    entitlements: 'assets/entitlements.mac.plist',
    entitlementsInherit: 'assets/entitlements.mac.inherit.plist',
    extendInfo: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: `com.${strip(process.env.APP_NAME_LOWERCASE)}`,
          CFBundleURLSchemes: [SCHEME],
        },
      ],
    },
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' },
    ],
  },

  win: {
    icon: 'assets/icon.ico',
    artifactName: `${strip(process.env.APP_NAME_LOWERCASE)}-${REF}-\${arch}.\${ext}`,
    target: [{ target: 'portable', arch: ['x64'] }],
    legalTrademarks: 'Dan Gorea',
    signtoolOptions: {
      certificateFile: process.env.CSC_LINK,
      certificatePassword: process.env.CSC_KEY_PASSWORD,
    },
  },

  linux: {
    icon: 'assets/icon.png',
    target: [
      { target: 'AppImage', arch: ['x64', 'arm64'] },
      { target: 'deb', arch: ['x64', 'arm64'] },
    ],
    artifactName: `${strip(process.env.APP_NAME_LOWERCASE)}-${REF}-\${arch}.\${ext}`,
    maintainer: 'Dan Gorea <dangorea9@gmail.com>',
    category: 'Development',
  },

  deb: { compression: 'xz' },

  directories: {
    app: 'release/app',
    buildResources: 'assets',
    output: 'release/build',
  },

  extraResources: ['./assets/**', { from: '.env', to: 'env.production' }],

  publish: { provider: 'github', owner: 'fusionworks', repo: 'FusionWorks' },
};
