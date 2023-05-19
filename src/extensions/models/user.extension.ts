import string from 'src/utils/string';

declare global {
  interface UserDetail {
    getFullName: () => string;
  }
}

/*eslint no-extend-native: ["error", { "exceptions": ["Object"] }]*/
Object.defineProperty(Object.prototype, 'getFullName', {
  value: function () {
    return string.getFullName(this);
  },
});

export {};
