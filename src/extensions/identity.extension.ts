import string from 'src/utils/string';

declare global {
  interface Identity {
    getId: () => string;
  }
}
/*eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
Object.defineProperty(String.prototype, 'getId', {
  value: function () {
    return string.getId(this);
  },
});

export {};
