declare module 'graphql-tag-pluck' {
  type FilePlucker = {
    (filePath: string, options?: object): Promise<string>;
    sync(filePath: string, options?: object): string;
  };

  type CodeStringPlucker = {
    (codeString: string, options?: object): Promise<string>;
    sync(codeString: string, options?: object): string;
  };

  type Plucker = {
    fromFile: FilePlucker;
    fromCodeString: CodeStringPlucker;
  };

  var gqlPluck: Plucker;
  export var gqlPluckFromFile: FilePlucker;
  export var gqlPluckFromCodeString: CodeStringPlucker;
  export default gqlPluck;
}
