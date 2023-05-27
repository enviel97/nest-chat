import string from 'src/utils/string';

declare global {
  interface Array<T = any> {
    isEmpty(): boolean;
  }
}

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'isEmpty', {
  value: function () {
    return (this?.length ?? 0) === 0;
  },
});

export {};
