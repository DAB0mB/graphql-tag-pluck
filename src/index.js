import { transformFileAsync, transformAsync } from '@babel/core'
import { resolve, extname } from 'path'
import plugin from './plugin'

export const pluckFromFile = async (filePath) => {
  if (typeof filePath != 'string' && !(filePath instanceof String)) {
    throw TypeError('Provided file path must be a string')
  }

  if (extname(filePath) != '.js') {
    throw TypeError('Provided file must be of type .js')
  }

  filePath = resolve(process.cwd(), filePath)

  const { gqlString } = (await transformFileAsync(filePath, {
    plugins: [plugin],
    code: false,
    ast: false,
  })).metadata

  return gqlString
}

export const pluckFromCodeString = async (codeString) => {
  if (typeof codeString != 'string' && !(codeString instanceof String)) {
    throw TypeError('Provided file path must be a string')
  }

  const { gqlString } = (await transformAsync(codeString, {
    plugins: [plugin],
    code: false,
    ast: false,
  })).metadata

  return gqlString
}

export default {
  fromFile: pluckFromFile,
  fromCodeString: pluckFromCodeString,
}
