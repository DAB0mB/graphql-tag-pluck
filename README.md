[![CircleCI](https://circleci.com/gh/DAB0mB/graphql-tag-pluck/tree/master.svg?style=svg)](https://circleci.com/gh/DAB0mB/graphql-tag-pluck/tree/master)
[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH9)

# GraphQL Tag Pluck

`graphql-tag-pluck` will take JavaScript code as an input and will pluck all template literals provided to `graphql-tag`.

**Input:**

```js
import gql from 'graphql-tag'

const fragment = gql`
  fragment Foo on FooType {
    id
  }
`

const doc = gql`
  query foo {
    foo {
      ...Foo
    }
  }

  ${fragment}
`
```

**Output:**

```graphql
fragment Foo on FooType {
  id
}

query foo {
  foo {
    ...Foo
  }
}
```

Originally created because of https://graphql-code-generator.com/.

### Usage

`graphql-tag-pluck` is installable via NPM (or Yarn):

    $ npm install graphql-tag-pluck

Once installed you can pluck GraphQL template literals using one of the following methods:

```js
import gqlPluck, {
  gqlPluckFromFile,
  gqlPluckFromCodeString,
} from 'graphql-tag-pluck'

// Returns promise
gqlPluck.fromFile(filePath, {
  useSync: true, // Optional, will return string if so
})

// Returns string
gqlPluck.fromFile.sync(filePath)

// Returns string
gqlPluck.fromCodeString(codeString, {
  fileExt: '.ts', // Optional, defaults to '.js'
})
```

Template literals leaded by magic comments will also be extracted :-)

```js
/* GraphQL */ `
  enum MessageTypes {
    text
    media
    draftjs
  }
`
```

supported file extensions are: `.js`, `.jsx`, `.ts`, `.tsx`, `.flow`, `.flow.js`, `.flow.jsx`, `.graphqls`, `.graphql`, `.gqls`, `.gql`.

### Options

I recommend you to look at the [source code](src/visitor.js) for a clearer understanding of the transformation options.

- **`gqlMagicComment`**

  The magic comment anchor to look for when parsing GraphQL strings. Defaults to `graphql`, which may be translated into `/* GraphQL */` in code.

- **`globalGqlIdentifierName`**

  Allows to use a global identifier instead of a module import.

  ```js
  // `graphql` is a global function
  export const usersQuery = graphql`
    {
      users {
        id
        name
      }
    }
  `
  ```

-  **`modules`**

    An array of packages that are responsible for exporting the GraphQL string parser function. The following modules are supported by default:

    ```js
    {
        modules: [
            {
              // import gql from 'graphql-tag'
              name: 'graphql-tag',
            },
            {
              name: 'graphql-tag.macro',
            },
            {
              // import { graphql } from 'gatsby'
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
            }
        ]
    }
    ```

### License

MIT
