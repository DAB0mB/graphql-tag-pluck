import babel from '@babel/core'
import { resolve, extname } from 'path'
import plugin from './plugin'

export default async (filePath) => {
  if (typeof filePath != 'string' && !(filePath instanceof String)) {
    throw TypeError('Provided file path must be a string')
  }

  if (extname(filePath) != '.js') {
    throw TypeError('Provided file must be of type .js')
  }

  filePath = resolve(process.cwd(), filePath)

  const { gqlString } = await babel.transformFileAsync(filePath, {
    plugins: [plugin],
    code: false,
    ast: false,
  }).metadata

  return gqlString
}
