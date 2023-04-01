/* eslint-disable no-mixed-spaces-and-tabs */
import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
	
	components = {};
	element;
	subElements = {};
	
	
	constructor() {
	  this.url = new URL('api/dashboard/bestsellers', BACKEND_URL);
	}
	
	
	get dateDefaultRange () {
	  const now = new Date();
	  const to = new Date();
	  const from = new Date(now.setMonth(now.getMonth() - 1));

	  return { from, to };
	}
	
	initComponents() {
	  const { from, to } = this.dateDefaultRange;
	  const bestsellersURL = `/api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc&_start=0&_end=30`;		
		
	  const rangePicker = new RangePicker(from, to);
		
		
	  const sortableTable = new SortableTable(header, {
	    url: bestsellersURL,
	    isSortLocally: true,
			
	  });
		
	  const ordersChart = new ColumnChart({
	    url: 'api/dashboard/orders',
	    range: {
	      from,
	      to
	    },
	    label: 'orders',
	    link: '#',
	  });

	  const salesChart = new ColumnChart({
	    url: 'api/dashboard/sales',
	    range: {
	      from,
	      to
	    },
	    label: 'sales',
	    formatHeading: data => `$${data}`,
	  });		

	  const customersChart = new ColumnChart({
	    url: 'api/dashboard/customers',
	    range: {
	      from,
	      to
	    },
	    label: 'customers',
	  });
		
		
	  return this.components = {
	    rangePicker,
	    sortableTable,
	    ordersChart,
	    salesChart,
	    customersChart
	  };
		
	}
	
	
	renderComponents() {
		
	  const componentDOMContainers = Object.keys(this.components);
		
	  componentDOMContainers.forEach(item => {
	    const component = this.components[item].element;
	    this.subElements[item].append(component);
	  });
		
	}
	
	get template() {
	  return `
		<div class="dashboard">
			<div class="content__top-panel">
				<h2 class="page-title">Dashboard</h2>
				<!-- RangePicker component -->
				<div data-element="rangePicker"></div>
			</div>
			<div data-element="chartsRoot" class="dashboard__charts">
				<!-- column-chart components -->
				<div data-element="ordersChart" class="dashboard__chart_orders"></div>
				<div data-element="salesChart" class="dashboard__chart_sales"></div>
				<div data-element="customersChart" class="dashboard__chart_customers"></div>
			</div>

			<h3 class="block-title">Best sellers</h3>

			<div data-element="sortableTable">
				<!-- sortable-table component -->
			</div>
		</div>`;
	}
	
	
	
	async render() {
		
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = this.template;
	  this.element = wrapper.firstElementChild;
		
	  this.subElements = this.getSubElements();
		
	  this.initComponents();
	  this.renderComponents();
	  this.initListeners();	
		
	  return this.element;
		
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
	
	
	initListeners() {		
	  this.subElements['rangePicker'].addEventListener('date-select', (event) => {
	    const from = event.detail.from;
	    const to = event.detail.to;
	    this.update(from, to);
	  });		
	}
	
	
	async loadData(from, to) {				
	  this.url.searchParams.set("from", from.toISOString());
	  this.url.searchParams.set("to", to.toISOString());
	  this.url.searchParams.set("_start", 0);
	  this.url.searchParams.set("_end", 3);
						
	  const data = await fetchJson(this.url);
	  this.data = data;
				
	  return data;	
	}
	
	
	
	async update(from = this.dateDefaultRange.from, to = this.dateDefaultRange.to) {
	  const data = await this.loadData(from, to);
		
	  this.components.sortableTable.update(data);
	  this.components.ordersChart.update(from, to);
	  this.components.salesChart.update(from, to);
	  this.components.customersChart.update(from, to);		
		
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
		
	  Object.values(this.components).forEach(component => component.destroy);
	  this.components = {};
	}


}



