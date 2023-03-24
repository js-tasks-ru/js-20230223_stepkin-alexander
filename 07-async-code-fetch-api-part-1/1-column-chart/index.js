import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';


export default class ColumnChart {
  data = [];
	subElements = {};
  chartHeight = 50;

  constructor({
    url,
    range,
    label = '',
    link = '',
    value = [],
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
		
    this.render();
    this.update();
  }

  getColumnBody(objData = {}) {
		
    const values = Object.values(objData);
    const maxValue = Math.max(...values);
		
    const scale = this.chartHeight / maxValue;

    return values.map(item => {
     
      const percent = (item / maxValue * 100).toFixed(0);

      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    }).join('');
  }
	
	
  getChartHeader(valluesArray) {
		
    const initialValue = 0;
    this.value = valluesArray.reduce((acc, curValue) => acc + curValue, initialValue);

    return this.formatHeading(this.value);
  }

	
	
  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getChartHeader(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
		
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

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
	
  /**
	 * 
	 * @returns data from server array
	 */
  async loadData(from, to) {
    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());
		
    const responce = await fetch(this.url);
    const data = await responce.json();
    this.data = data;
		
    return data;
	
  }
	
	
	
  async update(from = this.range.from, to = this.range.to) {
    const data = await this.loadData(from, to);
		
    this.subElements.header.innerHTML = this.getChartHeader(Object.values(data));
    this.subElements.body.innerHTML = this.getColumnBody(data);
    
    // remove skeleton
    const parentElem = this.subElements.body.closest(".column-chart");
    parentElem.classList.remove('column-chart_loading');
		
    return data;
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

