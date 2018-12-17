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

      const fragment = gql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it('should pluck graphql-tag template literals from .js file and remove replacements', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import gql from 'graphql-tag'

      const fragment = gql(\`
        fragment Foo on FooType {
          id
        }
      \`)
      const fragment2 = gql(\`
        fragment Foo2 on FooType {
          name
        }
      \`)

      const doc = gql\`
        query foo {
          foo {
            ...Foo
            ...Foo2
          }
        }

        \${fragment}
        \${fragment2}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      fragment Foo on FooType {
        id
      }

      fragment Foo2 on FooType {
        name
      }

      query foo {
        foo {
          ...Foo
          ...Foo2
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

      export namespace Fragments {
        interface EmptyObject {}

        const object = <EmptyObject> {}

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
      }
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it('should pluck graphql-tag template literals from .flow file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.flow',
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

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it('should pluck graphql-tag template literals from .flow.jsx file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.flow.jsx',
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

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it('should pluck graphql-tag template literals from .*.jsx file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.mutation.jsx',
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

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it('should pluck graphql-tag template literals leaded by a magic comment from .js file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      const Message = /* GraphQL */ \`
        enum MessageTypes {
          text
          media
          draftjs
        }\`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      enum MessageTypes {
        text
        media
        draftjs
      }
    `))
  })

  it('should pluck graphql-tag expression statements leaded by a magic comment from .js file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      /* GraphQL */ \`
        enum MessageTypes {
          text
          media
          draftjs
        }\`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      enum MessageTypes {
        text
        media
        draftjs
      }
    `))
  })

  it(`should NOT pluck other template literals from a .js file`, async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: `/tmp/tmp-XXXXXX.js`,
    })

    await fs.writeFile(file.name, freeText(`
      test(
        \`test1\`
      )
      test.test(
        \`test2\`
      )
      test\`
        test3
      \`
      test.test\`
        test4
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual('')
  })

  it ('should pluck template literals when graphql-tag is imported differently', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import graphqltag from 'graphql-tag'

      const fragment = graphqltag(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = graphqltag\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

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

  it ('should pluck template literals from gql by default even if not imported from graphql-tag', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import gql from 'graphql-tag'

      const fragment = gql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

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

    const gqlString = await gqlPluck.fromFile(file.name)

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
    const gqlString = await gqlPluck.fromCodeString(freeText(`
      import gql from 'graphql-tag'

      const fragment = gql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

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

  it('should pluck graphql-tag template literals from a .js file synchronously', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import gql from 'graphql-tag'

      const fragment = gql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = gql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = gqlPluck.fromFile.sync(file.name)

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
