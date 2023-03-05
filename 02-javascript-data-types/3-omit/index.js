/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
	const tmpArray = [];
	
	// преобразовать в массив, затем map, затем fromEntries обратно объект
	Object.entries(obj).map(([key, value]) => {
		if (!fields.includes(key) ) {
			tmpArray.push([key, value]); 
		}
		return tmpArray;
	});
	
	const newObj = Object.fromEntries(tmpArray);
	return newObj;
};

