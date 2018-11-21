import { transformFileAsync } from '@babel/core'
import { resolve, extname } from 'path'
import fs from './libs/fs'
import plugin from './plugin'
import { merge } from './utils'

const gqlExtensions = [
  '.graphql', '.gql'
]

const jsExtensions = [
  '.js', '.jsx', '.ts', '.tsx'
]

const supportedExtensions = [...gqlExtensions, ...jsExtensions]

supportedExtensions.toString = function toString() {
  return this.split().join(', ')
}

export default  async (filePath, customConfig = {}) => {
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

  const { gqlString } = (await transformFileAsync(
    filePath,
    createConfig(customConfig),
  )).metadata

  return gqlString
}

const createConfig = (customConfig) => {
  return merge({
    plugins: [plugin],
    presets: ['@babel/typescript'],
    code: false,
    ast: false,
  }, customConfig)
}
