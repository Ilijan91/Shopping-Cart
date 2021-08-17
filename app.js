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
        <button class="bag-btn" data-id=${element.id}><i class="fa-fa-shopping-cart"></i> Add to bag</button>
      </div>
      <h3>${element.title}</h3>
      <h4>$${element.price}</h4>
    </article>`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
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
        });
      }
    });
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  products
    .getProducts()
    .then(products => {
      ui.dispplayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
    });
});
