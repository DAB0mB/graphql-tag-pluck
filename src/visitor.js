import * as t from '@babel/types'
import { freeText } from './utils'

const defaults = {
  modules: [
    {
      name: 'graphql-tag',
    },
    {
      name: 'graphql-tag.macro',
    },
    {
      name: 'gql',
      identifier: '@apollo/client',
    },
    {
      name: 'gatsby',
      identifier: 'graphql',
    },
    {
      name: 'apollo-server-express',
      identifier: 'gql'
    },
    {
      name: 'apollo-server',
      identifier: 'gql'
    },
    {
      name: 'react-relay',
      identifier: 'graphql'
    },
    {
      name: 'apollo-boost',
      identifier: 'gql'
    },
    {
      name: 'apollo-server-koa',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-hapi',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-fastify',
      identifier: 'gql',
    },
    {
      name: ' apollo-server-lambda',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-micro',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-azure-functions',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-cloud-functions',
      identifier: 'gql',
    },
    {
      name: 'apollo-server-cloudflare',
      identifier: 'gql',
    },
    {
      name: 'graphql.macro',
      identifier: 'gql',
    },
  ],
  gqlMagicComment: 'graphql',
}

export default (code, out, options = {}) => {
  // Apply defaults to options
  let { modules, globalGqlIdentifierName, gqlMagicComment } = {
    ...defaults,
    ...options,
  }

  // Prevent case related potential errors
  gqlMagicComment = gqlMagicComment.toLowerCase()
  // normalize `name` and `identifier` values
  modules = modules.map(mod => {
    return {
      name: mod.name,
      identifier: mod.identifier && mod.identifier.toLowerCase(),
    }
  })
  globalGqlIdentifierName = globalGqlIdentifierName && globalGqlIdentifierName.toLowerCase()

  // Keep imported identifiers
  // import gql from 'graphql-tag' -> gql
  // import { graphql } from 'gatsby' -> graphql
  // Will result with ['gql', 'graphql']
  const definedIdentifierNames = []

  // Will accumulate all template literals
  const gqlTemplateLiterals = []

  // Check if package is registered
  function isValidPackage(name) {
    return modules.some(pkg => pkg.name && name && pkg.name.toLowerCase() === name.toLowerCase())
  }

  // Check if identifier is defined and imported from registered packages
  function isValidIdentifier(name) {
    return (
      definedIdentifierNames.some(id => id === name) ||
      (globalGqlIdentifierName && name === globalGqlIdentifierName)
    )
  }

  const pluckStringFromFile = ({ start, end }) => {
    return freeText(
      code
        // Slice quotes
        .slice(start + 1, end - 1)
        // Erase string interpolations as we gonna export everything as a single
        // string anyways
        .replace(/\$\{[^}]*\}/g, '')
        .split('\\`').join('`')
    )
  }

  // Push all template literals leaded by graphql magic comment
  // e.g. /* GraphQL */ `query myQuery {}` -> query myQuery {}
  const pluckMagicTemplateLiteral = (node, takeExpression) => {
    const leadingComments = node.leadingComments

    if (!leadingComments) return
    if (!leadingComments.length) return

    const leadingComment = leadingComments[leadingComments.length - 1]
    const leadingCommentValue = leadingComment.value.trim().toLowerCase()

    if (leadingCommentValue != gqlMagicComment) return

    const gqlTemplateLiteral = pluckStringFromFile(takeExpression ? node.expression : node)

    if (gqlTemplateLiteral) {
      gqlTemplateLiterals.push(gqlTemplateLiteral)
    }
  }

  return {
    CallExpression: {
      enter(path) {
        // Find the identifier name used from graphql-tag, commonJS
        // e.g. import gql from 'graphql-tag' -> gql
        if (path.node.callee.name == 'require' && isValidPackage(path.node.arguments[0].value)) {
          if (!t.isVariableDeclarator(path.parent)) return
          if (!t.isIdentifier(path.parent.id)) return

          definedIdentifierNames.push(path.parent.id.name)

          return
        }

        const arg0 = path.node.arguments[0]

        // Push strings template literals to gql calls
        // e.g. gql(`query myQuery {}`) -> query myQuery {}
        if (
          t.isIdentifier(path.node.callee) &&
          isValidIdentifier(path.node.callee.name) &&
          t.isTemplateLiteral(arg0)
        ) {
          const gqlTemplateLiteral = pluckStringFromFile(arg0)

          // If the entire template was made out of interpolations it should be an empty
          // string by now and thus should be ignored
          if (gqlTemplateLiteral) {
            gqlTemplateLiterals.push(gqlTemplateLiteral)
          }
        }
      },
    },

    ImportDeclaration: {
      enter(path) {
        // Find the identifier name used from graphql-tag, es6
        // e.g. import gql from 'graphql-tag' -> gql
        if (!isValidPackage(path.node.source.value)) return

        const moduleNode = modules.find(pkg => pkg.name.toLowerCase() === path.node.source.value.toLowerCase())

        const gqlImportSpecifier = path.node.specifiers.find(importSpecifier => {
          // When it's a default import and registered package has no named identifier
          if (t.isImportDefaultSpecifier(importSpecifier) && !moduleNode.identifier) {
            return true
          }

          // When it's a named import that matches registered package's identifier
          if (
            t.isImportSpecifier(importSpecifier) &&
            importSpecifier.imported.name === moduleNode.identifier
          ) {
            return true
          }

          return false
        })

        if (!gqlImportSpecifier) return

        definedIdentifierNames.push(gqlImportSpecifier.local.name)
      },
    },

    ExpressionStatement: {
      exit(path) {
        // Push all template literals leaded by graphql magic comment
        // e.g. /* GraphQL */ `query myQuery {}` -> query myQuery {}

        if (!t.isTemplateLiteral(path.node.expression)) return

        pluckMagicTemplateLiteral(path.node, true)
      },
    },

    TemplateLiteral: {
      exit(path) {
        pluckMagicTemplateLiteral(path.node)
      },
    },

    TaggedTemplateExpression: {
      exit(path) {
        // Push all template literals provided to the found identifier name
        // e.g. gql `query myQuery {}` -> query myQuery {}
        if (!t.isIdentifier(path.node.tag) || !isValidIdentifier(path.node.tag.name)) {
          return
        }

        const gqlTemplateLiteral = pluckStringFromFile(path.node.quasi)

        if (gqlTemplateLiteral) {
          gqlTemplateLiterals.push(gqlTemplateLiteral)
        }
      },
    },

    exit() {
      out.returnValue = gqlTemplateLiterals.join('\n\n')
    },
  }
}
