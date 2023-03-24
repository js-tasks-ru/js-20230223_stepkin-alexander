import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

/* eslint-disable no-mixed-spaces-and-tabs */
export default class SortableTable {
	
	subElements = {};
	data = [];
	// table header
	tableHeader;
	sortedField = '';
	isSortLocally;
	start = 0;
	step = 20;
	lastRow;
	
	constructor(headerConfig, {
	  url = '',
	  sorted = {}
	} = {}) {
	  this.headerConfig = headerConfig;
	  this.sorted = sorted;
	  this.url = new URL(url, BACKEND_URL);
	  this.isSortLocally = false;
	  
		
	  this.render();
	  this.update(); 		
				
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
		
	  console.log("data: ", data);
		
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
	
	 /**
	 * 
	 * @returns data from server array
	 */
	 async loadData() {
		
	  this.url.searchParams.set("_embed", "subcategory.category");
	  this.url.searchParams.set("_sort", this.sorted.id);
	  this.url.searchParams.set("_order", this.sorted.order);
	  this.url.searchParams.set("_start", this.start);
	  this.url.searchParams.set("_end", this.start + this.step);
		
	  // paginator
	  this.start = this.start + this.step;
		
	  const responce = await fetch(this.url);
	  const data = await responce.json();
				
	  if (!data.length) {
	    throw new Error("Oops.. Data is empty");
	  }	
		
	  this.data = data;
	  return data;
	}
	
	
	// observer for infinite scroll
	tableObserver () {
	
	  let options = {
	    root: null,
	    rootMargin: '0px',
	    threshold: 1.0
	  };
	
	  const callback = (entries, observer) => {
	    entries.forEach(async element => {
				
	      if (element.isIntersecting) {
	        await this.update();
	       	observer.unobserve(element.target);	
	      }
	    });
	  };
		
	  return new IntersectionObserver(callback, options);
	
	}
	
	
	// catch end of scroll
	async onScroll() {
	  const observer = this.tableObserver();
	  observer.observe(this.lastRow);
	}
	
	
	async update() {
		
	  // fetch this.data
	  const data = await this.loadData();

	  // this.subElements.header.innerHTML = this.getTableHeader();
	  this.subElements.body.innerHTML = this.subElements.body.innerHTML + this.getTableRows(data);
	  
	  this.lastRow = this.subElements.body.lastElementChild;
	  const observer = this.tableObserver();
	  observer.observe(this.lastRow);
	  
	  // remove skeleton
	  //const parentElem = this.subElements.body.closest(".column-chart");
	  //parentElem.classList.remove('column-chart_loading');
		
	  return data;
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
	 * listen clicks
	 */
	onSort() {				
	  this.tableHeader.addEventListener('pointerdown', (event) => {
	    if (!event.target.closest('.sortable-table__cell')) {
	      event.preventDefault();
	      return;
	    }			
	    
	    const sortedCell = event.target.closest('.sortable-table__cell');
			
	    if (sortedCell.dataset.sortable === "false") {
	      event.preventDefault();
	      return;
	    }
			
	    // cell clicked on
	    if (sortedCell.dataset.sortable) {
	      this.sorted.id = sortedCell.dataset.id;
	    } else {
	      return;
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
	async sortOnServer() {
	  this.start = 0;
	  await this.loadData();
		
	  // this.subElements.header.innerHTML = this.getTableHeader();
	  this.subElements.body.innerHTML = this.getTableRows(this.data);
	  
	  this.lastRow = this.subElements.body.lastElementChild;
	  const observer = this.tableObserver();
	  observer.observe(this.lastRow);	  
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
		
}





