// https://learn.javascript.ru/intl

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
 export function sortStrings(arr, param = 'asc') {
	
	let collator = new Intl.Collator("ru", { caseFirst: "upper" });
	
	const arrCopy = [...arr];
	arrCopy.sort(collator.compare);
	
	if (param === 'asc')
		return arrCopy;
	else if (param === 'desc')
		return arrCopy.reverse()
}

