// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  dispplayProducts(products) {
    let result = '';
    products.forEach(element => {
      result += `<article class="product">
      <div class="img-container">
        <img src=${element.image} alt="product-1" class="product-img" />
        <button class="bag-btn" data-id=${element.id}><i class="fa-fa-shopping-cart"></i> Add to cart</button>
      </div>
      <h3>${element.title}</h3>
      <h4>$${element.price}</h4>
    </article>`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      } else {
        button.addEventListener('click', event => {
          event.target.innerText = 'In Cart';
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // add product to cart
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = ` <img src="${item.image}" alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fa fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fa fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerHTML = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerHTML = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    cart = [];
    this.setCartValues(cart);
    Storage.saveCart(cart);
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  products
    .getProducts()
    .then(products => {
      ui.dispplayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
