import string from 'src/utils/string';

declare global {
  interface Identity {
    getId: () => string;
    isSame: (another: any) => boolean;
  }
}
/*eslint no-extend-native: ["error", { "exceptions": ["Object"] }]*/
Object.defineProperty(Object.prototype, 'getId', {
  value: function () {
    return string.getId(this);
  },
});

/*eslint no-extend-native: ["error", { "exceptions": ["Object"] }]*/
Object.defineProperty(Object.prototype, 'isSame', {
  value: function (another: any) {
    const myId = string.getId(this);
    const anotherId = string.getId(another);
    if (!anotherId || !myId) return false;
    return anotherId === myId;
  },
});

export {};
