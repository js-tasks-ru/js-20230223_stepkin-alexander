/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
	
  const tmpArray = path.split('.');
  
  return function(obj) {
    
    if (!obj) {
      console.error("There is no object");
      return;
    }  
    // just for training ang safety
    let copyObj = {...obj};
        
    for (let i = 0; i < tmpArray.length; i++) {
      
      if (!copyObj[tmpArray[i]]) {
        console.error(`The key ${copyObj[tmpArray[i]]} not found! Please check the path`);
        return;
      }
      
      copyObj = copyObj[tmpArray[i]];
    }
    return copyObj;
  };

}
