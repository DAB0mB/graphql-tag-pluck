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

Once installed you can pluck GraphQL template literals using the `pluckFromFile` method:

```js
import pluck, { pluckFromFile } from 'graphql-tag-pluck'

assert(pluck.fromFile === pluckFromFile)

export default async (filePath) => {
  await pluckFromFile(filePath)
}
```

Or using the `pluckFromCodeString` method:

```js
import pluck, { pluckFromCodeString } from 'graphql-tag-pluck'

assert(pluck.fromCodeString === pluckFromCodeString)

export default async (codeString) => {
  await pluckFromCodeString(codeString)
}
```

It's preferable to use the `pluckFromFile` method since it should take the relative `.babelrc` file into account

### License

MIT
