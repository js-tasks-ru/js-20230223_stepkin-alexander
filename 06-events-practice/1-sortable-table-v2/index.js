/* eslint-disable no-mixed-spaces-and-tabs */
export default class SortableTable {
	
	subElements = {};
	// table header
	tableHeader;
	sortedField = '';
	isSortLocally;
	
	constructor(headerConfig, {
	  data = [],
	  sorted = {}
	} = {}) {
	  this.headerConfig = headerConfig;
	  this.data = data;
	  this.sorted = sorted;
	  this.isSortLocally = true;
	  this.render();
				
	  // default sort
	  this.sort();
		
	  // start listen click
	  this.onSort();
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
		<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${id === this.sorted.id ? this.sorted.order : ""}">
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
	  this.tableHeader = this.element.querySelector('[data-element="header"]');
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
	 * @param {*} id: поле, по которому идет сортировка 
	 * @param {*} order: порядок сотртировки
	 */
	sort() {				
	  if (this.isSortLocally) {
	    this.sortOnClient();
	  } else {
	    this.sortOnServer();
	  }
	}
	
	/** 
	 * @returns sortType value (string, number)
	 */
	getsortType() {
	  let headerItem = this.headerConfig.find(headerItem => this.sorted.id === headerItem.id);
		
	  if (!(headerItem.sortType)) {
	    throw new Error(`Sorted type not defined for ${this.sorted.id} field`);
	  }
		
	  return headerItem.sortType;
	}
	
	
	/**
	 * set arrow to sorted column
	 * @param {*} direction 
	 */
	updateArrow() {	
		
	  const dataElements = this.subElements.header.querySelectorAll('.sortable-table__cell[data-id]');
		
	  // curent sorted column
	  const curentCoumn = this.subElements.header.querySelector(`.sortable-table__cell[data-id="${this.sorted.id}"]`);
		 //get current arrow
	  let order = this.sorted.order;		
	  // clear all arrow
	  dataElements.forEach(element => {
	    element.dataset.order = '';
	  });		
	  // set new arrow
	  if (order === 'asc') {
	    curentCoumn.dataset.order = 'desc';
	  } else if (order === 'desc') {
	    curentCoumn.dataset.order = 'asc';
	  }
	  // update this.sorted state
	  this.sorted.id = curentCoumn.dataset.id;
	  this.sorted.order = curentCoumn.dataset.order;
	}
	
	
	/**
	 * 
	 */
	onSort() {				
	  this.tableHeader.addEventListener('click', (event) => {
	    if (event.target.tagName === 'SPAN') {				
	      this.sorted.id = event.target.parentElement.dataset.id;
				
	    } 
	    else if (event.target.className === 'sortable-table__cell') {
	      this.sorted.id = event.target.dataset.id;
	    }			
	    // update arrow and this.sorted obj
	    this.updateArrow();
	    // call sorting
	    this.sort(this.sorted);
	  });
		
	  
	}
	
	
	sortOnClient({id = this.sorted.id, order = this.sorted.order} = {}) {
	  
	  const sortType = this.getsortType();				
	  let arrCopy = [...this.data]; 
		
	  // сотрируем в зависимости от sortType
	  if (sortType === 'string') {
	    const collator = new Intl.Collator("ru", { caseFirst: "upper" });

	    if (order === 'asc') {
	      arrCopy.sort((x, y) => collator.compare(x[id], y[id]));     
	    }
	    else if (order === 'desc') {
	      arrCopy.sort((x, y) => collator.compare(y[id], x[id]));
	    }
	  } else if (sortType === 'number') {
			 if (order === 'asc') {
	      arrCopy.sort((x, y) => (x[id] - y[id]));
     
	    }
	    else if (order === 'desc') {
	      arrCopy.sort((x, y) => (y[id] - x[id]));
	    }
	  }  
    
			
	  this.subElements.body.innerHTML = this.getTableRows(arrCopy);   
	}
	
	// for feature tasks
	sortOnServer() {
	  return;
	}
	
		
}




