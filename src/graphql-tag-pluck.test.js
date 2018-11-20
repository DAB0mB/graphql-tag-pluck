import pluck from '.'
import fs from './libs/fs'
import tmp from './libs/tmp'
import { freeText } from './utils'

describe('graphql-tag-pluck', () => {
  it('should pluck graphql-tag template literals from file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, `
      import gql from 'graphql-tag'

      const fragment = gql\`
        fragment Foo on FooType {
          id
        }
      \`

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `)

    const gqlString = await pluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      fragment Foo on FooType {
        id
      }

      query foo {
        foo {
          ...Foo
        }
      }
    `))
  })

  it('should pluck graphql-tag template literals from code string', async () => {
    const codeString = `
      import gql from 'graphql-tag'

      const fragment = gql\`
        fragment Foo on FooType {
          id
        }
      \`

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `

    const gqlString = await pluck.fromCodeString(codeString)

    expect(gqlString).toEqual(freeText(`
      fragment Foo on FooType {
        id
      }

      query foo {
        foo {
          ...Foo
        }
      }
    `))
  })
})
