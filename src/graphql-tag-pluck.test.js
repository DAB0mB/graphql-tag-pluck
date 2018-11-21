import gqlPluck from '.'
import fs from './libs/fs'
import tmp from './libs/tmp'
import { freeText } from './utils'

describe('graphql-tag-pluck', () => {
  it('should pluck graphql-tag template literals from .js file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
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
    `))

    const gqlString = await gqlPluck(file.name)

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

  it('should pluck graphql-tag template literals from .ts file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.ts',
    })

    await fs.writeFile(file.name, freeText(`
      import gql from 'graphql-tag'
      import { Document } from 'graphql'

      const fragment: Document = gql\`
        fragment Foo on FooType {
          id
        }
      \`

      const doc: Document = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck(file.name)

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

  it('should pluck graphql-tag template literals from .graphql file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.graphql',
    })

    await fs.writeFile(file.name, freeText(`
      fragment Foo on FooType {
        id
      }

      query foo {
        foo {
          ...Foo
        }
      }
    `))

    const gqlString = await gqlPluck(file.name)

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
