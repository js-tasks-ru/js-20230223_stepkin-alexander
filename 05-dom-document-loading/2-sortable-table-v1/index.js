/* eslint-disable no-mixed-spaces-and-tabs */
export default class SortableTable {
	
	subElements = {};
	
	constructor(headerConfig = [], data = []) {
		
	  this.headerConfig = headerConfig;
	  this.data = data;
		
	  this.render();
	}
	
	/**
	 * 
	 * @returns table header builder
	 */
	getTableHeader() {
	    return `
			<div data-element="header" class="sortable-table__header sortable-table__row">
				${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
	    </div>`;			
	}
	
	// see headerConfig
	getHeaderRow({id, title, sortable}) {
	  return `
		<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
			<span>${title}</span>
			<span data-element="arrow" class="sortable-table__sort-arrow">
				<span class="sort-arrow"></span>
			</span>
		</div>`;
	}
	
	/**
	 * 
	 * @returns table body builder
	 */
	getTableBody() {
	  return `
		<div data-element="body" class="sortable-table__body">
			 ${this.getTableRows(this.data)}
		</div>
		`;		
	}
	
	
	
	getTableRows(data = []) {
	  return data.map(item =>{
	    return `
				<a href="/products/${item.id}" class="sortable-table__row">
					${this.getTableRow(item)}
				</a>`;
	  }).join('');
	}
	
	getTableRow(product) {
	  const cells = this.headerConfig.map(({id, template}) => {
	    return { 
	      id, 
	      template
	    };
	  });
		
	  return cells.map(({id, template}) => {
		
	    return template ? template(product[id]) : `<div class="sortable-table__cell">${product[id]}</div>`;
	  }).join('');
	}
	
	
	buildTable() {
	  return `
			<div class="sortable-table">
				${this.getTableHeader()}
				${this.getTableBody()}
			</div>`;
	}
	
	
	
	render() {
	  const wrapper = document.createElement('div');

	  wrapper.innerHTML = this.buildTable();
	  this.element = wrapper.firstElementChild;


	  this.subElements = this.getSubElements();
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
	  this.element = null;
	  this.subElements = {};
	}

	
	
	/**
	 * 
	 * @param {*} fieldName: поле, по которому идет сортировка 
	 * @param {*} param: порядок сотртировки
	 */
	sort(fieldName, param = 'asc') {
		
	  const sortType = this.getsortType(fieldName);
	  this.updateArrow(fieldName, param);
				
	  let arrCopy = [...this.data]; 
		
	  // сотрируем в зависимости от sortType
	  if (sortType === 'string') {
	    const collator = new Intl.Collator("ru", { caseFirst: "upper" });

	    if (param === 'asc') {
	      arrCopy.sort((x, y) => collator.compare(x[fieldName], y[fieldName]));     
	    }
	    else if (param === 'desc') {
	      arrCopy.sort((x, y) => collator.compare(y[fieldName], x[fieldName]));
	    }
	  } else if (sortType === 'number') {
			 if (param === 'asc') {
	      arrCopy.sort((x, y) => (x[fieldName] - y[fieldName]));
     
	    }
	    else if (param === 'desc') {
	      arrCopy.sort((x, y) => (y[fieldName] - x[fieldName]));
	    }
	  }  
    
			
	  this.subElements.body.innerHTML = this.getTableRows(arrCopy);   
	}
	
	/** 
	 * @param {*} fieldName 
	 * @returns sortType value (string, number)
	 */
	getsortType(fieldName) {
	  let headerItem = this.headerConfig.find(headerItem => fieldName === headerItem.id);
		
	  if (!['string', 'number'].includes(headerItem.sortType)) {
	    throw new Error(`Sorted type not defined for ${fieldName} field`);
	  }
		
	  return headerItem.sortType;
	}
	
	
	/**
	 * set arrow to sorted column
	 * @param {*} fieldName 
	 * @param {*} direction 
	 */
	updateArrow(fieldName, direction) {
		
	  const dataElements = this.subElements.header.querySelectorAll('.sortable-table__cell[data-id]');
		
	  // curent sorted column
	  const curentCoumn = this.subElements.header.querySelector(`.sortable-table__cell[data-id="${fieldName}"]`);
		
	  // clear current arrow
	  dataElements.forEach(element => {
	    element.dataset.order = '';
	  });
		
	  //set arrow
	  curentCoumn.dataset.order = direction;
	}
	
	
}




