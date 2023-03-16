/* eslint-disable no-mixed-spaces-and-tabs */
class Tooltip {
	element = '';
	
	initialize () {
		
	  document.addEventListener("pointerover", this.onOverHandler);
	  document.addEventListener("pointerout", this.onOutHandler);

	}
	
	
	// pointerover target div
	onOverHandler = (e) => {
	  const tooltipAttr = e.target.dataset.tooltip;
	  if (tooltipAttr) {
	    this.render(tooltipAttr);
			
	    e.target.append(this.element);
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
	
	
	
	get template() {
	  return `<div class="tooltip">${this.tooltip}</div>	`;
	}
	
	render(tooltip) {
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = `<div class="tooltip">${tooltip}</div>	`;
	  this.element = wrapper.firstElementChild;
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
