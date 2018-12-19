import { parse as babelParse } from '@babel/parser'
import babelTraverse from '@babel/traverse'
import * as ts from 'typescript'

export const traverse = babelTraverse

export const parse = (code, config) => {
  // The 'typescript' plug-in has few bugs... It's just better to use the native one
  // even though it affects performance
  if (config.plugins.includes('typescript')) {
    code = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2018,
        jsx: config.plugins.includes('jsx'),
      }
    }).outputText

    const plugins = config.plugins.slice()
    const tsIndex = plugins.indexOf('typescript')
    plugins.splice(tsIndex, 1)

    config = { ...config, plugins }
  }

  const ast = babelParse(code, config)
  // Necessary to get the original code in case it was transformed by TypeScript
  ast.code = code

  return ast
}

export default {
  traverse,
  parse,
}
