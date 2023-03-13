/* eslint-disable no-mixed-spaces-and-tabs */
export default class SortableTable {
	
	subElements = {};
	sortType = '';
	
	constructor(headerConfig = [], data = []) {
		
	  this.headerConfig = headerConfig;
	  this.data = data;
		
	  this.render();
	}
	
	
	getTableHeader(headerConfig) {
	  let tableHeadKeys = [];
	  if (headerConfig.length) {
	    tableHeadKeys = Object.keys(headerConfig[1]);
	  }
		
	  // console.log(tableHeadKeys);
		
	  return headerConfig.map(item => {     
	    return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-sortType="${item.sortType}" data-order="">
			<span>${item.title}</span>
		</div>`;
	  }).join('');		
	}
	
  
	getImg(item) {
	  return item.images?.length ? `<img class="sortable-table-image" alt="Image" src="${item.images[0].url}"></img>` : " ";
	}
	
  
	getTableBody(data) {
	  const cellIndex = this.headerConfig.findIndex(obj => obj.id === field);
		
	  return data.map(item => {
	    return `<a href="/products/${item.id}" class="sortable-table__row">
			<div class="sortable-table__cell">
				${this.getImg(item)}
			</div>
			<div class="sortable-table__cell">${item.title}</div>
			<div class="sortable-table__cell">${item.quantity}</div>
			<div class="sortable-table__cell">${item.price}</div>
			<div class="sortable-table__cell">${item.sales}</div>
		</a>`;
	  }).join('');		
	}
	
	
	
	get template() {
	  return `<div data-element="productsContainer" class="products-list__container">
		<div class="sortable-table">
			<div data-element="header" class="sortable-table__header sortable-table__row">
				${this.getTableHeader(this.headerConfig)}
			</div>
	
			<div data-element="body" class="sortable-table__body">
				${this.getTableBody(this.data)}
			</div>
	
			<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
	
			<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
				<div>
					<p>No products satisfies your filter criteria</p>
					<button type="button" class="button-primary-outline">Reset all filters</button>
				</div>
			</div>
	
		</div>
	</div>
		`;
	}
	
	
	render() {
	  const wrapper = document.createElement('div');

	  wrapper.innerHTML = this.template;
	  this.element = wrapper.firstElementChild;

	  // if (this.data.length) {
	  //   this.element.classList.remove('column-chart_loading');
	  // }

	  this.subElements = this.getSubElements();
		//console.error("this.subElements: ", this.subElements.body.firstElementChild.children);
	}

	getSubElements() {
	  const result = {};
	  const elements = this.element.querySelectorAll("[data-element]");
				
	  for (const subElement of elements) {
	    const name = subElement.dataset.element;
	    result[name] = subElement;
	  }
		
	  return result;
    
	}
	
	update(data = []) {
	  // if (!data.length) {
	  //   this.element.classList.add("column-chart_loading");
	  // }

	  this.data = data;

	  this.subElements.body.innerHTML = this.getTableBody(this.data);
	}
	

	remove() {
	  if (this.element) {
	    this.element.remove();
	  }
	}

	destroy() {
	  this.remove();
	  this.element = {};
	  this.subElements = {};
	}

	
	
	/**
	 * 
	 * @param {*} fieldName: поле, по которому идет сортировка 
	 * @param {*} param: порядок сотртировки
	 */
	sort(fieldName, param = 'asc') {
		
	  // получаем sortType
	  this.headerConfig.forEach(headerItem => {
	    if (fieldName === headerItem.id) {
	      this.sortType = headerItem.sortType;
	    }				
	  });
				
	  let arrCopy = [...this.data]; 
		
	  // сотрируем в зависимости от sortType
	  if (this.sortType === 'string') {
	    const collator = new Intl.Collator("ru", { caseFirst: "upper" });

	    if (param === 'asc') {
	      arrCopy.sort((x, y) => collator.compare(x[fieldName], y[fieldName]));
     
	    }
	    else if (param === 'desc') {
	      arrCopy.sort((x, y) => collator.compare(y[fieldName], x[fieldName]));
	    }
	  } else if (this.sortType === 'number') {
			 if (param === 'asc') {
	      arrCopy.sort((x, y) => (x[fieldName] - y[fieldName]));
     
	    }
	    else if (param === 'desc') {
	      arrCopy.sort((x, y) => (y[fieldName] - x[fieldName]));
	    }
	  }  
    
			
	  this.update(arrCopy);    
	}
	
	
	
}




