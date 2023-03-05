/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const state = [];
  const set = new Set(arr);
  set.forEach(value => state.push(value));
  return state;
}


console.log(uniq(['a', 'a', 'b', 'c', 'c'])); // [1, 2, 3, 4]

/*
uniq([1, 2, 2, 3, 1, 4]); // [1, 2, 3, 4]
uniq(['a', 'a', 'b', 'c', 'c']); // ['a', 'b', 'c']
*/