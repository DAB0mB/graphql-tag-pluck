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

  ;['js', 'ts'].forEach(ext => {
    it(`shouldn\'t pluck other template literals from a .${ext} file`, async () => {
      const file = await tmp.file({
        unsafeCleanup: true,
        template: `/tmp/tmp-XXXXXX.${ext}`,
      })

      await fs.writeFile(file.name, freeText(`
        test(
          \`test1\`
        );
        test.test(
          \`test2\`
        );
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

  it('should pluck graphql-tag template literals from code string synchronously', async () => {
    const gqlString = gqlPluck.fromCodeString.sync(freeText(`
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
})
