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

  it('should pluck graphql-tag template literals from .ts file (with TS features)', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXXX.ts',
    })

    const code = `
    import gql from 'graphql-tag'
    import { Document } from 'graphql'

    interface ModuleWithProviders {
      ngModule: string;
    }
    
    export class FooModule {
      static forRoot() {
        return <ModuleWithProviders>{
          ngModule: 'foo'
        };
      }
    }

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
  `;

    await fs.writeFile(file.name, freeText(code))

    const fromFile = await gqlPluck.fromFile(file.name)

    expect(fromFile).toEqual(freeText(`
      fragment Foo on FooType {
        id
      }

      query foo {
        foo {
          ...Foo
        }
      }
    `))

    const fromString = await gqlPluck.fromCodeString(code)

    expect(fromString).toEqual(freeText(`
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
