// https://learn.javascript.ru/intl

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
	
  const collator = new Intl.Collator("ru", { caseFirst: "upper" });
	
  const arrCopy = [...arr];
	
  if (param === 'asc') {
    arrCopy.sort(collator.compare);
  }
  else if (param === 'desc') {
    arrCopy.sort((x, y) => collator.compare(y, x));
  }
	
  return arrCopy;    
}
