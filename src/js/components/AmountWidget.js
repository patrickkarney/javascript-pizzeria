import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element){
    // eslint-disable-next-line no-unused-vars
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor elements: ', element);
  }

  getElements(element){
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;      
    const newValue = parseInt(value);
      
    //Add validation
    //check if newValue is different than current value
    if(newValue !== thisWidget.value && !isNaN(newValue) && newValue<=settings.amountWidget.defaultMax && newValue>=settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
      
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  initActions(){
    const thisWidget = this;

    // eslint-disable-next-line no-unused-vars
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-1);
      console.log('thisWidget.value', thisWidget.value);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+1);
      console.log('thisWidget.value', thisWidget.value);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('update', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
    
}

export default AmountWidget;