import Config from './config'
import babel from './libs/babel'
import fs from './libs/fs'
import { resolve, extname } from './libs/path'
import createVisitor from './visitor'

const gqlExtensions = [
  '.graphqls', '.graphql', '.gqls', '.gql'
]

const jsExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.flow', '.flow.js', '.flow.jsx'
]

const supportedExtensions = [...gqlExtensions, ...jsExtensions]

supportedExtensions.toString = function toString() {
  return this.join(', ')
}

export const gqlPluckFromFile = (filePath, options = {}) => {
  if (typeof filePath != 'string' && !(filePath instanceof String)) {
    throw TypeError('Provided file path must be a string')
  }

  const fileExt = extname(filePath)

  if (!supportedExtensions.includes(fileExt)) {
    throw TypeError(`Provided file type must be one of ${supportedExtensions}`)
  }

  if (gqlExtensions.includes(fileExt)) {
    return fs.readFile(filePath, { encoding: 'utf8' })
  }

  if (!(options instanceof Object)) {
    throw TypeError(`Options arg must be an object`)
  }

  filePath = resolve(process.cwd(), filePath)
  options = { ...options, fileExt }

  if (options.useSync) {
    const code = fs.readFileSync(filePath, { encoding: 'utf8' })
    const config = new Config(code, options)

    return gqlPluckFromCodeString(code, config)
  }

  return fs.readFile(filePath, { encoding: 'utf8' }).then((code) => {
    const config = new Config(code, options)
    return gqlPluckFromCodeString(code, config)
  })
}

gqlPluckFromFile.sync = (filePath, options = {}) => {
  options = { ...options, useSync: true }

  return gqlPluckFromFile(filePath, options)
}

export const gqlPluckFromCodeString = (code, options = {}) => {
  if (typeof code != 'string' && !(code instanceof String)) {
    throw TypeError('Provided code must be a string')
  }

  if (!(options instanceof Object)) {
    throw TypeError(`Options arg must be an object`)
  }

  if (options.fileExt) {
    if (gqlExtensions.includes(options.fileExt)) {
      return code
    }

    if (!jsExtensions.includes(options.fileExt)) {
      throw TypeError(`options.fileExt must be one of ${supportedExtensions}`)
    }
  }

  const out = {}
  const config = new Config(code, options)
  const ast = babel.parse(code, config)
  const visitor = createVisitor(ast.code, out, config._options)

  babel.traverse(ast, visitor)

  return out.returnValue
}

export default {
  fromFile: gqlPluckFromFile,
  fromCodeString: gqlPluckFromCodeString,
}
