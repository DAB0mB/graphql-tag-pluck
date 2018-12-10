export default function Config(options) {
  if (options instanceof Config) {
    return options
  }

  const plugins = [
    'asyncGenerators',
    'bigInt',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    ['decorators', { decoratorsBeforeExport: true }],
    'doExpressions',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'functionBind',
    'functionSent',
    'importMeta',
    'logicalAssignment',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    ['pipelineOperator', { proposal: 'smart' }],
    'throwExpressions',
  ]

  switch (options.fileExt) {
    case '.jsx': plugins.push('jsx'); break
    case '.ts': plugins.push('typescript'); break
    case '.tsx': plugins.push('typescript', 'jsx'); break
    case '.flow': plugins.push('flow', 'flowComments'); break
    case '.flow.js': plugins.push('flow', 'flowComments'); break
    case '.flow.jsx': plugins.push('flow', 'flowComments', 'jsx'); break
  }

  Object.assign(this, {
    sourceType: 'module',
    plugins,
  })
}
