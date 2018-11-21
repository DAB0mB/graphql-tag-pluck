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

Once installed you can pluck GraphQL template literals like so:

```js
import gqlPluck from 'graphql-tag-pluck'

export default async (filePath) => {
  await gqlPluck(filePath)
}
```

supported file extensions are: `.js`, `.jsx`, `.ts`, `.tsx`, `.graphql`, `.gql`.

### License

MIT
