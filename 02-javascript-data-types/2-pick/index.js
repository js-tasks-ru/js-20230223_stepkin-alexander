/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {

  const tmpArray = [];
	
  const sortKeys = ([key, value]) => {
   
    if (fields.includes(key)) {
      tmpArray.push([key, value]); 
    }
    return tmpArray;
  }; 
	
  /* вот так не работает 
	Object.fromEntries(Object.entries(obj).map(sortKeys);)
	*/
	
  // преобразовать в массив, затем map, затем fromEntries обратно объект
  Object.entries(obj).map(sortKeys);
  return Object.fromEntries(tmpArray);
	
};
