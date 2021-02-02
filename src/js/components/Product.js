import {select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderFrom();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
      
  }

  renderInMenu(){
    const thisProduct = this;
      
    /*generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    console.log('templateaa', generateHTML);
    /*create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    /*find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    //console.log('menuContainer: ', menuContainer);
    /*add element to menu */
    menuContainer.appendChild(thisProduct.element);
    console.log('thisProduct: ',thisProduct);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.imageVisible = thisProduct.element.querySelector(classNames.menuProduct.imageVisible);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    //console.log('ThisProduct: ',thisProduct);

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
        
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct != null && activeProduct != thisProduct.element){
        activeProduct.classList.remove('active');
      } 
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
        
    });
  }

  initOrderFrom(){
    const thisProduct = this;
    //console.log(thisProduct);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;
    //create new property thisProduct.priceSingle in order to for cart to know what is the price of a single item with chosen checkboxes
    thisProduct.priceSingle = price;
      
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const optionPrice = option.price;
                    
        // create const holding condition for checked box
        const checkedBoxCondition = formData[paramId] && formData[paramId].includes(optionId);
        // find image with class of .paramId-optionId
        const optionImage = thisProduct.imageWrapper.querySelector('.'+ paramId + '-' + optionId);
          
          
        // check if there is param with a name of paramId in formData and if it includes optionId

        if(checkedBoxCondition){                                        // box checked
          //check if option.default is true
          if(option.default){
            console.log('Price do not change unless was not checked');
              
          } else if(!option.default){
            price = price + optionPrice;
            console.log('Price added: ', price);
               
          }
            
        } else if(option.default){
          price = price - optionPrice;
          console.log('Price subtracted: ', price);
        }
          
        // if optionImage is not null
        if(optionImage){
          optionImage.classList.add(classNames.menuProduct.imageVisible);
          // check if box is checked
          if(checkedBoxCondition){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible); 
          }
              
        }
      }
    }
      
    //multiply price by amount
    price *= thisProduct.amountWidget.value;
    //create new property thisProduct.priceSingle in order to for cart to know what is the price of a single item with chosen checkboxes
    thisProduct.priceSingle = price;
      
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    // eslint-disable-next-line no-unused-vars
    thisProduct.amountWidgetElem.addEventListener('update', function(event){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct
      }
    });
    thisProduct.element.dispatchEvent(event);  
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.params = thisProduct.prepareCartProductParams();
    productSummary.amount = thisProduct.amountWidget.value; 
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.amount * productSummary.priceSingle;
      
      
    console.log('productSummary: ', productSummary);
    console.log('cart params: ',thisProduct.prepareCartProductParams());
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    //create object that holds new params
    const params = {};
      
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {}
      };

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        // eslint-disable-next-line no-unused-vars
        const option = param.options[optionId];          
                    
        // create const holding condition for checked box
        const checkedBoxCondition = formData[paramId] && formData[paramId].includes(optionId);        
          
        // check if there is param with a name of paramId in formData and if it includes optionId

        if(checkedBoxCondition){                                        
          params[paramId].options[optionId] = option.label;
                          
        }
      }        
    }
    return params;
  }
}

export default Product;