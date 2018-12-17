import * as t from '@babel/types'
import { freeText } from './utils'

export default (code, out, comments = []) => {
  // Will accumulate all template literals
  const gqlTemplateLiterals = []
  // By default, we will look for `gql` calls
  let gqlIdentifierName = 'gql'

  const pluckStringFromFile = ({ start, end }) => {
    return freeText(code
      // Slice quotes
      .slice(start + 1, end - 1)
      // Erase string interpolations as we gonna export everything as a single
      // string anyways
      .replace(/\$\{[^}]*\}/g, '')
    )
  }

  const relevantComments = comments.filter(comment => {
    if (comment.type === 'CommentBlock') {
      const value = comment.value.toLowerCase().trim();

      return value === 'graphql';
    }

    return false;
  });

  return {
    CallExpression: {
      enter(path) {
        // Find the identifier name used from graphql-tag, commonJS
        // e.g. import gql from 'graphql-tag' -> gql
        if (
          path.node.callee.name == 'require' &&
          path.node.arguments[0].value == 'graphql-tag'
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
        if (path.node.source.value != 'graphql-tag') return

        const gqlImportSpecifier = path.node.specifiers.find((importSpecifier) => {
          return t.isImportDefaultSpecifier(importSpecifier)
        })

        if (!gqlImportSpecifier) return

        gqlIdentifierName = gqlImportSpecifier.local.name
      },
    },

    TemplateLiteral: {
      exit(path) {
        const hasMagicCommentBefore = 
          !!relevantComments.find(comment => comment.end === path.node.start || comment.end === path.node.start - 1);

        if (hasMagicCommentBefore) {
          const gqlTemplateLiteral = pluckStringFromFile(path.node)

          if (gqlTemplateLiteral) {
            gqlTemplateLiterals.push(gqlTemplateLiteral)
          }
        }
      }
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
