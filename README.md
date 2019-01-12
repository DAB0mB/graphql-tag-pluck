[![CircleCI](https://circleci.com/gh/DAB0mB/graphql-tag-pluck/tree/master.svg?style=svg)](https://circleci.com/gh/DAB0mB/graphql-tag-pluck/tree/master)

# GraphQL Tag Pluck

`graphql-tag-pluck` will take JavaScript code as an input and will pluck all template literals provided to `graphql-tag`.

Input:

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

Output:

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
import gqlPluck, { gqlPluckFromFile, gqlPluckFromCodeString } from 'graphql-tag-pluck'

// Returns promise
gqlPluck.fromFile(filePath, {
  useSync: true // Optional, will return string if so
})

// Returns string
gqlPluck.fromFile.sync(filePath)

// Returns string
gqlPluck.fromCodeString(codeString, {
  fileExt: '.ts' // Optional, defaults to '.js'
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

Transformation options may also be provided:

- **`defaultGqlIdentifierName`** - The default GraphQL string parser identifier to look for. Defaults to `gql`, unless imported as something else from the `graphql-tag` package. This behavior can also be changed, see the `gqlPackName` option.

- **`gqlMagicComment`** - The magic comment anchor to look for when parsing GraphQL strings. Defaults to `graphql`, which may be translated into `/* GraphQL */` in code.

- **`gqlPackName`** - The name of the package that is responsible for exporting the GraphQL string parser function. Defaults to `graphql-tag`.

I recommend you to look at the [source code](src/visitor.js) for a clearer understanding of the transformation options.

supported file extensions are: `.js`, `.jsx`, `.ts`, `.tsx`, `.flow`, `.flow.js`, `.flow.jsx`,  `.graphqls`, `.graphql`, `.gqls`, `.gql`.

### License

MIT
