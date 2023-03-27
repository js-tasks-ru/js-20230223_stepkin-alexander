import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

/* eslint-disable no-mixed-spaces-and-tabs */
export default class SortableTable {
  
  subElements = {};
  data = [];
  // table header
  tableHeader;
  sortedField = '';
  start = 0;
  step = 20;
  lastRow;
  
  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    
    
    this.render();
    this.update(); 		
        
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
        ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>`;			
  }
  
  // see headersConfig
  // getHeaderRow({id, title, sortable}) {
        
  //   return `
  //   <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${id === this.sorted.id ? this.sorted.order : ""}">
  //     <span>${title}</span>
  //     <span data-element="arrow" class="sortable-table__sort-arrow">
  //       <span class="sort-arrow"></span>
  //     </span>
  //   </div>`;
  // }
  
  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }
  
  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
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
    const cells = this.headersConfig.map(({id, template}) => {
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
    
    const data = await fetchJson(this.url);
        
    if (!data.length) {
      throw new Error("Oops.. Data is empty");
    }	
    
    this.data = data;
    return data;
  }
  
  
  // observer for infinite scroll
  tableObserver () {
  
    const options = {
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
  onScroll() {
    const observer = this.tableObserver();
    observer.observe(this.lastRow);
  }
  
  
  async update() {
    
    // fetch this.data
    const data = await this.loadData();

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
    const headerItem = this.headersConfig.find(headerItem => this.sorted.id === headerItem.id);
    
    if (!(headerItem.sortType)) {
      throw new Error(`Sorted type not defined for ${this.sorted.id} field`);
    }
    
    return headerItem.sortType;
  }
  
  
  /**
   * set arrow to sorted column
   * @param {*} direction 
   */
  updateArrow(column) {	
    
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);
    }
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
      const column = event.target.closest('[data-sortable="true"]');
      this.updateArrow(column);
      // call sorting
      this.sort();
    });
    
    
  }
  
  
  sortOnClient({id = this.sorted.id, order = this.sorted.order} = {}) {
        
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);

    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;
  
    arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        throw new Error(`Unknown sort type: "${sortType}"`);
      }
    });
      
    this.subElements.body.innerHTML = this.getTableRows(arr);   
  }
  
  // for feature tasks
  async sortOnServer() {
    this.start = 0;
    await this.loadData();
    
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





