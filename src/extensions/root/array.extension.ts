import string from 'src/utils/string';

declare global {
  interface Array<T = any> {
    isEmpty(): boolean;
    getIds(): string[];
    /**
     * Check current array is subset of target array
     * @param source target need compare
     * @param key key use build hash map, use item in source if key undefine
     */
    isSubsetOf(source: Array<T>, key?: string): boolean;
  }
}

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'isEmpty', {
  value: function () {
    return (this?.length ?? 0) === 0;
  },
});

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'getIds', {
  value: function () {
    if (this.length === 0) return [];
    return this.map((identity: any) => string.getId(identity));
  },
});

Object.defineProperty(Array.prototype, 'isSubsetOf', {
  value: function (source: any[], key?: string) {
    if (source.length < this.length) return false;
    // build hashmap
    const hashmap = new Map<any, any>();
    source.forEach((item) => {
      const _key = key ?? item;
      hashmap.set(_key, item);
    });
    const elements = [...this];
    for (let element of elements) {
      if (hashmap.has(element)) {
        elements.pop();
      }
    }
    return elements.length === 0;
  },
});

export {};
