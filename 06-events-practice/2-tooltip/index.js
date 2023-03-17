/* eslint-disable no-mixed-spaces-and-tabs */
class Tooltip {
	element = '';
	tooltipName;
	
	static instance;
	
	constructor() {
	  if (Tooltip.instance) {
	    return Tooltip.instance;
	  }
		
	  Tooltip.instance = this;
	}
	
	initialize () {
		
	  document.addEventListener("pointerover", this.onOverHandler);
	  document.addEventListener("pointerout", this.onOutHandler);
	}
	
	
	// pointerover target div
	onOverHandler = (e) => {
	  const tooltipAttr = e.target.dataset.tooltip;
	  if (tooltipAttr) {
	    this.tooltipName = tooltipAttr;
	    this.render();
	    document.addEventListener("pointermove", this.onMoveHandler);				    
	  }
	}
	
	// pointerout target div
	onOutHandler = (e) => {
	  const tooltipAttr = e.target.dataset.tooltip;
	  if (tooltipAttr) {
	    this.tooltip = tooltipAttr;
		 	this.remove();
	  }
	}

	onMoveHandler = (e) => {
	  const shift = 10;
	  let left = shift + e.clientX + 'px';
	  let top = shift + e.clientY + 'px';
		
	  this.element.style.left = left;
	  this.element.style.top = top;
	}
	
	get template() {
	  return `<div class="tooltip">${this.tooltipName} 123</div>	`;
	}
	
	render() {
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = this.template;
	  this.element = wrapper.firstElementChild;
	  document.body.append(this.element);
	}
	
	
	remove() {
	  if (this.element) {
	    this.element.remove();
	  }
	}

	destroy() {
	  this.remove();
	  this.element = null;
	}

	
	
	
}

export default Tooltip;
