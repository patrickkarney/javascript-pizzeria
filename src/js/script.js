/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      totalPriceSum: '.cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {

    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },

    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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

      app.cart.add(thisProduct.prepareCartProduct());
      
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
  
  // eslint-disable-next-line no-unused-vars
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
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
      
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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPriceSum = thisCart.dom.wrapper.querySelector(select.cart.totalPriceSum);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      //console.log('wrapper: ', thisCart.dom.wrapper);
      //console.log('toggleTrigger: ', thisCart.dom.toggleTrigger);

    }

    initActions(){
      const thisCart = this;

      // eslint-disable-next-line no-unused-vars
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      
      thisCart.dom.productList.addEventListener('update', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {

        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        ptotalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      console.log('payload: ', payload);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }

    add(menuProduct){
      const thisCart = this;
      /*generate HTML based on template */
      const generateHTML = templates.cartProduct(menuProduct);
      /*create element using utils.createElementFromHTML */
      const generatedHTML = utils.createDOMFromHTML(generateHTML);
      /*add element to menu */
      thisCart.dom.productList.appendChild(generatedHTML);
      //save selected product to the table thisCart.products
      thisCart.products.push( new CartProduct(menuProduct, generatedHTML));   
      console.log('thisCart.products: ', thisCart.products);   

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      
      for(let product of thisCart.products){
        thisCart.totalNumber = thisCart.totalNumber + product.amount;
        thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
      }      
      
      if(thisCart.totalNumber !== 0){        
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else{
        thisCart.deliveryFee = 0;
        thisCart.totalPrice = 0;
      }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      
      for(let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice; 
      }
    }

    remove(cartProduct){
      const thisCart = this;
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();

      
    }

  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      //add referance to all the properties of the product saved in the cart (menuProduct)
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      console.log('thisCartProduct: ', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);

    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      // eslint-disable-next-line no-unused-vars
      thisCartProduct.dom.amountWidget.addEventListener('update', function(){
        // bug for amount = 1
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        console.log('wartość amountWidget.value: ',thisCartProduct.amountWidget.value);

        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        console.log('zaktualizowany koszyk: ', thisCartProduct);
      });    
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      const orderData = {};
      orderData.id = thisCartProduct.id;
      orderData.amount = thisCartProduct.amount;
      orderData.price = thisCartProduct.price;
      orderData.priceSingle = thisCartProduct.priceSingle;
      orderData.name = thisCartProduct.name;
      orderData.params = thisCartProduct.params;
      return orderData;
    }


  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedRespone){
          console.log('parsedResponse: ',parsedRespone);

          /*save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedRespone;
          /*execute initMenu method*/
          thisApp.initMenu();
        });
      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },    

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
      
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }

  };

  app.init();
}
