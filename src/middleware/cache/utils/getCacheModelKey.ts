const getCacheModelKey = (prefix: string, id: string) => `${prefix}:_${id}`;

export default getCacheModelKey;
