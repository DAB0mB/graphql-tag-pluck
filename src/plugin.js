import { freeText } from './utils'

export default ({ types: t }) => {
  return {
    pre() {
      // Will accumulate all template literals
      this.gqlTemplateLiterals = []
    },

    visitor: {
      CallExpression: {
        enter(path) {
          // Find the identifier name used from graphql-tag, commonJS
          // e.g. import gql from 'graphql-tag' -> gql
          if (!t.isCallExpression(path.node, {
            'callee.name': 'require',
            'arguments[0].value': 'graphql-tag',
          })) return

          if (!t.isVariableDeclarator(path.parent)) return
          if (!t.isIdentifier(path.parent.id)) return

          this.gqlIdentifierName = path.parent.id.name
        },
      },

      ImportDeclaration: {
        enter(path) {
          // Find the identifier name used from graphql-tag, es6
          // e.g. import gql from 'graphql-tag' -> gql
          if (path.node.source.value != 'graphql-tag') return

          const gqlImportSpecifier = path.node.specifiers.find((importSpecifier) => {
            return t.isImportDefaultSpecifier(importSpecifier)
          })

          if (!gqlImportSpecifier) return

          this.gqlIdentifierName = gqlImportSpecifier.local.name
        },
      },

      TaggedTemplateExpression: {
        exit(path) {
          // Push all template literals provided to the found identifier name
          // e.g. gql `query myQuery {}` -> query myQuery {}
          if (path.node.tag.name != this.gqlIdentifierName) return

          const gqlTemplateLiteral = freeText(path.hub.getCode().slice(
            path.node.quasi.start + 1,
            path.node.quasi.end - 1,
          )
          // Erase string interpolations as we gonna export everything as a single
          // string anyways
          .replace(/\$\{[^}]*\}/, ''))

          // If the entire template was made out of interpolations it should be an empty
          // string by now and thus should be ignored
          if (gqlTemplateLiteral) {
            this.gqlTemplateLiterals.push(gqlTemplateLiteral)
          }
        },
      },
    },

    post(state) {
      // Export template literals
      state.metadata.gqlString = this.gqlTemplateLiterals.join('\n\n')
    },
  }
}
