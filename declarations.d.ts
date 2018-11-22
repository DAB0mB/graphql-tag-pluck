declare module 'graphql-tag-pluck' {
  type FilePlucker = {
    (filePath: string, options?: object): string;
    sync(filePath: string, options?: object): string;
  };

  type CodeStringPlucker = {
    (codeString: string, options?: object): string;
    sync(codeString: string, options?: object): string;
  };

  type CommonPlucker = {
    fromFile: FilePlucker;
    fromCodeString: CodeStringPlucker;
  };

  export var gqlPluckFromFile: FilePlucker;
  export var gqlPluckFromCodeString: CodeStringPlucker;
  export default CommonPlucker;
}
