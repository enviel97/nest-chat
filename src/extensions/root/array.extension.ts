import string from 'src/utils/string';
import { isSubset, IsSubsetConfig } from '../utils/array';

declare global {
  interface Array<T = any> {
    isEmpty(): boolean;
    getIds(): string[];
    isEqual(array: T[]): boolean;
    /**
     * Check targets array is sub set of src array
     * @param src Src array want to check
     * @param config config compare function if array has special value
     */
    isSubsetOf(src: T[], config?: IsSubsetConfig<T>): boolean;
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

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'isEqual', {
  value: function <T = any>(array: T[]) {
    if (!array || this.length !== array.length) return false;
    if (array === this) return true;
    this.sort();
    array.sort();
    return this.every((value: T, index: number) => value === array[index]);
  },
});

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'isSubsetOf', {
  value: function <T = any>(src: T[], config?: IsSubsetConfig<T>) {
    return isSubset(src, this, config);
  },
});

export {};
