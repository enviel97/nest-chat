const generateKeyByParams = (args: any[], keyIndex?: number[]) => {
  // Generate key for cache
  if (!keyIndex || keyIndex.length === 0) {
    // Get all params in function
    return args.reduce((keys, params) => `${keys}_${params}`, '');
  } else {
    // Get params by index in function
    return keyIndex.reduce((keys, i) => `${keys}_${args.at(i)}`, '');
  }
};

export default generateKeyByParams;
