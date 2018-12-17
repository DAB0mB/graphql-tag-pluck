import * as t from '@babel/types'
import { freeText } from './utils'

const defaultGqlIdentifierName = 'gql'
const gqlMagicComment = 'graphql'
const gqlPackName = 'graphql-tag'

export default (code, out) => {
  // Will accumulate all template literals
  const gqlTemplateLiterals = []
  // By default, we will look for `gql` calls
  let gqlIdentifierName = defaultGqlIdentifierName

  const pluckStringFromFile = ({ start, end }) => {
    return freeText(code
      // Slice quotes
      .slice(start + 1, end - 1)
      // Erase string interpolations as we gonna export everything as a single
      // string anyways
      .replace(/\$\{[^}]*\}/g, '')
    )
  }

  // Push all template literals leaded by graphql magic comment
  // e.g. /* GraphQL */ `query myQuery {}` -> query myQuery {}
  const pluckMagicTemplateLiteral = (node) => {
    const leadingComments = node.leadingComments

    if (!leadingComments) return
    if (!leadingComments.length) return

    const leadingComment = leadingComments[leadingComments.length - 1]
    const leadingCommentValue = leadingComment.value.trim().toLowerCase()

    if (leadingCommentValue != gqlMagicComment) return

    const gqlTemplateLiteral = pluckStringFromFile(node)

    if (gqlTemplateLiteral) {
      gqlTemplateLiterals.push(gqlTemplateLiteral)
    }
  }

  return {
    CallExpression: {
      enter(path) {
        // Find the identifier name used from graphql-tag, commonJS
        // e.g. import gql from 'graphql-tag' -> gql
        if (
          path.node.callee.name == 'require' &&
          path.node.arguments[0].value == gqlPackName
        ) {
          if (!t.isVariableDeclarator(path.parent)) return
          if (!t.isIdentifier(path.parent.id)) return

          gqlIdentifierName = path.parent.id.name

          return
        }

        const arg0 = path.node.arguments[0]

        // Push strings template literals to gql calls
        // e.g. gql(`query myQuery {}`) -> query myQuery {}
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name == gqlIdentifierName &&
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
        if (path.node.source.value != gqlPackName) return

        const gqlImportSpecifier = path.node.specifiers.find((importSpecifier) => {
          return t.isImportDefaultSpecifier(importSpecifier)
        })

        if (!gqlImportSpecifier) return

        gqlIdentifierName = gqlImportSpecifier.local.name
      },
    },

    ExpressionStatement: {
      exit(path) {
        // Push all template literals leaded by graphql magic comment
        // e.g. /* GraphQL */ `query myQuery {}` -> query myQuery {}
        if (!t.isTemplateLiteral(path.node.expression)) return

        pluckMagicTemplateLiteral(path.node)
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
        if (
          !t.isIdentifier(path.node.tag) ||
          path.node.tag.name != gqlIdentifierName
        ) {
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
