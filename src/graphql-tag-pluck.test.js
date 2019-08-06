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

  it('should pluck graphql-tag template literals from .tsx file', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.tsx',
    })

    await fs.writeFile(file.name, freeText(`
      import * as React from 'react';
      import gql from 'graphql-tag';

      export default class extends React.Component<{}, {}> {
        public render() {
          return <div />;
        }
      }

      export const pageQuery = gql\`
        query IndexQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      \`;

      // export const pageQuery = gql\`
      //   query IndexQuery {
      //     site {
      //       siteMetadata {
      //         title
      //       }
      //     }
      //   }
      // \`;
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      query IndexQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `))
  })

  it('should pluck graphql-tag template literals from .tsx file with generic jsx elements', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.tsx',
    })

    await fs.writeFile(file.name, freeText(`
      import * as React from 'react';
      import gql from 'graphql-tag';
      import Generic from './Generic'

      export default class extends React.Component<{}, {}> {
        public render() {
          return (
            <div>
              <Generic<string, number> />
              <Generic<undefined> />
              <Generic<null> />
            </div>
          )
        }
      }

      export const pageQuery = gql\`
        query IndexQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      \`;
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      query IndexQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `))
  })

  it('should pluck graphql-tag template literals from .ts file with the same const inside namespace and outside namespace', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.ts',
    })

    await fs.writeFile(file.name, freeText(`
      import gql from 'graphql-tag';

      namespace Foo {
        export const foo = 12;

        export const query = gql\`
          query myQueryInNamespace {
            fieldA
          }
        \`;
      }

      interface ModuleWithProviders {
        ngModule: string;
      }

      export class FooModule {
        static forRoot() {
          return <ModuleWithProviders>{
            ngModule: 'foo',
            value: Foo.foo
          };
        }
      }

      export const query = gql\`
        query myQuery {
          fieldA
        }
      \`;
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
      query myQueryInNamespace {
        fieldA
      }

      query myQuery {
        fieldA
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

  it('should pluck graphql-tag template literals from .js file with @flow header', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      // @flow

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

  it('should NOT pluck graphql-tag template literals from .js file without a @flow header', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
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

    const fail = Error('Function did not throw')

    try {
      await gqlPluck.fromFile(file.name)

      throw fail
    }
    catch (e) {
      expect(e).not.toEqual(fail)
    }
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

  it('should be able to specify the global GraphQL identifier name', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      const fragment = graphql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = graphql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name, {
      globalGqlIdentifierName: 'graphql'
    })

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

  it('should be able to specify the GraphQL magic comment to look for', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      const Message = /* GQL */ \`
        enum MessageTypes {
          text
          media
          draftjs
        }\`
    `))

    const gqlString = await gqlPluck.fromFile(file.name, {
      gqlMagicComment: 'GQL'
    })

    expect(gqlString).toEqual(freeText(`
      enum MessageTypes {
        text
        media
        draftjs
      }
    `))
  })

  it('should be able to specify the package name of which the GraphQL identifier should be imported from', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import mygql from 'my-graphql-tag'

      const fragment = mygql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = mygql\`
        query foo {
          foo {
            ...Foo
          }
        }

        \${fragment}
      \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name, {
      modules: [
        { name: 'my-graphql-tag' }
      ]
    })

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

  it('should pluck graphql template literal from gatsby package', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import {graphql} from 'gatsby'

      const fragment = graphql(\`
        fragment Foo on FooType {
          id
        }
      \`)

      const doc = graphql\`
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

  it('should pluck gql template literal from apollo-server-express package', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
      import { gql } from 'apollo-server-express'

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

  it('should pluck magic comment template literals with a trailing semicolon', async () => {
    const gqlString = await gqlPluck.fromCodeString("/* GraphQL */ `{}`;")
    expect(gqlString).toEqual("{}")
  })

  it('should pluck with comments having escaped backticks', async () => {
    const file = await tmp.file({
      unsafeCleanup: true,
      template: '/tmp/tmp-XXXXXX.js',
    })

    await fs.writeFile(file.name, freeText(`
    import gql from 'graphql-tag';

    export default gql\`
      type User { 
        id: ID! 
        "Choose a nice username, so users can \\\`@mention\\\` you."
        username: String! 
        email: String! 
      } 
    \`
    `))

    const gqlString = await gqlPluck.fromFile(file.name)

    expect(gqlString).toEqual(freeText(`
        type User { 
          id: ID! 
          "Choose a nice username, so users can \`@mention\` you."
          username: String! 
          email: String! 
        }
    `))
  })
})
