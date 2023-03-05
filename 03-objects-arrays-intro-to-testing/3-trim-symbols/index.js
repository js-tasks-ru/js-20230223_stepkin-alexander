/**
	* trimSymbols - removes consecutive identical symbols if they quantity bigger that size
	* @param {string} string - the initial string
	* @param {number} size - the allowed size of consecutive identical symbols
	* @returns {string} - the new string without extra symbols according passed size
	*/
export function trimSymbols(string, size) {
  
  let state = [];
  let arr = string.split("");
  
  function normalize(arrayFromString, size) {
    for (let i = 0; i < arr.length + 1; i++) {
      let tmp = [];
      // console.log("0: arr ", arr);
      // console.log("1: start arr " + arr + " from " + arr[i] + " at index " + i);
      // console.log("2: tmp zero", tmp);
      // size === 1    
      if (size === 1) { 
        if (arr[i] !== arr[i + 1]) {
          state.push(arr[i]);
        }
        // size > 1    
      } else {            
        // console.log("2.1: arr[i] ", arr[i]);
        // console.log("2.2: arr[i + 1] ", arr[i + 1]);
        if (arr[i] !== arr[i + 1] || arr[i + 1] === undefined) {
          // console.log("3: i - border ", i, arr[i] + " | " + arr[i + 1]);
          tmp = arr.splice(0, i + 1) ;
          // console.log("4: tmp ", tmp);
          if (tmp.length > size) {
            tmp.splice(size);
            // console.log("5: tmp splice", tmp);
          }
          state = [...state, ...tmp];        
          // console.log("6: state: ", state);
          // console.log("7: new arr: ", arr);
          // console.log("8: i reset to: ", i);
     
          // рекурсия
          if (arr.length > 0) {
            normalize(arr, size);  
          }
          
        } else {
        //  console.log("bypass.. \n\n");
        }
      }  
    }	
  }
	
  normalize(arr, size);
  return state.join("");
}

console.log(trimSymbols('eedaaad', 2));
//                         ^  
//                      []  

/*
trimSymbols('xxx', 3); // 'xxx' - ничего не удалили т.к разрешено 3 символа подряд
trimSymbols('xxx', 2); // 'xx' - удалили один символ
trimSymbols('xxx', 1); // 'x'

trimSymbols('xxxaaaaa', 2); // 'xxaa'
trimSymbols('xxxaaaaab', 3); // 'xxxaaab'
*/