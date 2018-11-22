import {
  transformFileAsync,
  transformAsync,
  transformFileSync,
  transformSync,
} from '@babel/core'
import { resolve, extname } from 'path'
import fs from './libs/fs'
import pluckPlugin from './babel-plugin'
import { merge } from './utils'

const gqlExtensions = [
  '.graphqls', '.graphql', '.gql'
]

const jsExtensions = [
  '.js', '.jsx', '.ts', '.tsx'
]

const supportedExtensions = [...gqlExtensions, ...jsExtensions]

supportedExtensions.toString = function toString() {
  return this.split().join(', ')
}

export const gqlPluckFromFile = (filePath, customConfig = {}) => {
  if (typeof filePath != 'string' && !(filePath instanceof String)) {
    throw TypeError('Provided file path must be a string')
  }

  const fileExt = extname(filePath)

  if (!supportedExtensions.includes(fileExt)) {
    throw TypeError(`Provided file type must be one of ${supportedExtensions}`)
  }

  if (gqlExtensions.includes(fileExt)) {
    return fs.readFile(filePath, { encoding: 'utf-8' })
  }

  if (!(customConfig instanceof Object)) {
    throw TypeError(`Provided config must be an object`)
  }


  filePath = resolve(process.cwd(), filePath)

  customConfig = createConfig(customConfig)
  const sync = customConfig.sync
  delete customConfig.sync

  if (sync) {
    return transformFileSync(
      filePath,
      customConfig,
    ).metadata.gqlString
  }
  else {
    return transformFileAsync(
      filePath,
      customConfig,
    ).then(({ metadata }) => metadata.gqlString)
  }
}

gqlPluckFromFile.sync = (filePath, customConfig = {}) => {
  customConfig = { ...customConfig, sync: true }

  return gqlPluckFromFile(filePath, customConfig)
}

export const gqlPluckFromCodeString = (codeString, customConfig = {}) => {
  if (typeof codeString != 'string' && !(codeString instanceof String)) {
    throw TypeError('Provided code must be a string')
  }

  if (!(customConfig instanceof Object)) {
    throw TypeError(`Provided config must be an object`)
  }

  customConfig = createConfig({ filename: '.tsx', babelrc: false }, customConfig)
  const sync = customConfig.sync
  delete customConfig.sync

  if (sync) {
    return transformSync(
      codeString,
      customConfig,
    ).metadata.gqlString
  }
  else {
    return transformAsync(
      codeString,
      customConfig,
    ).then(({ metadata }) => metadata.gqlString)
  }
}

gqlPluckFromCodeString.sync = (codeString, customConfig = {}) => {
  customConfig = { ...customConfig, sync: true }

  return gqlPluckFromCodeString(codeString, customConfig)
}

const createConfig = (...customConfigs) => {
  return merge({
    plugins: [
      pluckPlugin,

      // Stage 0
      require('@babel/plugin-proposal-function-bind'),

      // Stage 1
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-logical-assignment-operators'),
      [require('@babel/plugin-proposal-optional-chaining'), { 'loose': true }],
      [require('@babel/plugin-proposal-pipeline-operator'), { 'proposal': 'minimal' }],
      [require('@babel/plugin-proposal-nullish-coalescing-operator'), { 'loose': true }],
      require('@babel/plugin-proposal-do-expressions'),

      // Stage 2
      [require('@babel/plugin-proposal-decorators'), { 'legacy': true }],
      require('@babel/plugin-proposal-function-sent'),
      require('@babel/plugin-proposal-export-namespace-from'),
      require('@babel/plugin-proposal-numeric-separator'),
      require('@babel/plugin-proposal-throw-expressions'),

      // Stage 3
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-syntax-import-meta'),
      [require('@babel/plugin-proposal-class-properties'), { 'loose': true }],
      require('@babel/plugin-proposal-json-strings'),
    ],
    presets: [
      require('@babel/preset-typescript'),
    ],
    code: false,
    ast: false,
  }, ...customConfigs)
}

export default {
  fromFile: gqlPluckFromFile,
  fromCodeString: gqlPluckFromCodeString,
}
