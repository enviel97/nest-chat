import string from 'src/utils/string';

declare global {
  interface Array<T = any> {
    isEmpty(): boolean;
    getIds(): string[];
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

export {};
