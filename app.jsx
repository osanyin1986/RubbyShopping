// in order to create a shopping cart we need a simple storage system where we can collect products and the cart's total.
//
// Node.js provides us with the express-session package, a middleware for ExpressJS.
//
// By default this package stores session data in memory but this is not recommended in a production environment. To fix this problem we need to use a specific session store. In our case we're going to use connect-mongodb-session, a store system that uses MongoDB to save session data.
//
// To save data, you can simply add properties to the session object that comes along with each request object in Express:


const app = require('express')();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/db',
    collection: 'sessions'
});
app.use(session({
  secret: 'secret session key',
  resave: false,
  saveUninitialized: true,
  store: store,
  unset: 'destroy',
  name: 'session cookie name'
}));
app.get('/', (req, res) => {
  if(!req.session.test) {
    req.session.test = 'OK';
    res.send('OK');
  }
});

app.get('/test', (req, res) => {
  res.send(req.session.test); // 'OK'
});
//
// In our session configuration an option worth mentioning here is the ability to delete session data with the aid of the delete operator in the unset option.
//
// The session middleware generates an unique ID for each session stored in session.sessionID. This token can be used to enhance the overall security of our implementation by preventing session fixation and session hijacking.
//
// We can handle tokens by setting up the following class:

const crypto = require('crypto');
class Security {
  static md5(value) {
    if(!value) {
        return;
    }
    return crypto.createHash('md5').update(value).digest('hex');
}

static isValidNonce(value, req) {
    return (value === this.md5(req.sessionID + req.headers['user-agent']));
}
}
module.exports = Security;
const Security = require('./lib/Security');
//...
app.post('/test', (req, res) => {
    let token = req.body.nonce;
    if(Security.isValidNonce(token, req)) {
      // OK
    } else {
      // Reject the request
    }
});
//
// The cart
// A shopping cart in Node.js can be represented by an object that must have at least three public properties:
//
// A property to store the products selected by the user, usually an array of objects.
// A property to store the cart totals.
// A property to store the cart totals as a formatted string to be displayed on the frontend.
// To start with, let's define our base class:

const config = require('./config');

class Cart {
   constructor() {
      this.data = {};
      this.data.items = [];
      this.data.totals = 0;
      this.data.formattedTotals = '';
   }
}

module.exports = new Cart();
//
// It's pretty clear now that we have to push products into the items array or remove them when users update the cart. We have also to update the cart totals accordingly.
//
// However, the first thing to implement is a method that prevents duplicate products from being pushed into the cart:

inCart(productID = 0) {
    let found = false;
    this.data.items.forEach(item => {
       if(item.id === productID) {
           found = true;
       }
    });
    return found;
}

//
// Each product has its own ID so we're going to use this property as a unique identifier for all products.
//
// Now we can update both the cart totals and the formatted totals string:

calculateTotals() {
    this.data.totals = 0;
    this.data.items.forEach(item => {
        let price = item.price;
        let qty = item.qty;
        let amount = price * qty;

        this.data.totals += amount;
    });
    this.setFormattedTotals();
}

setFormattedTotals() {
    let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
    let totals = this.data.totals;
    this.data.formattedTotals = format.format(totals);
}



//
// We're using NumberFormat but if you aren't planning to use large numbers of numbers, you can safely use also Number.prototype.toLocaleString().
//
// It's time to add products to our cart:


addToCart(product = null, qty = 1) {
    if(!this.inCart(product.product_id)) {
        let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
        let prod = {
          id: product.product_id,
          title: product.title,
          price: product.price,
          qty: qty,
          image: product.image,
          formattedPrice: format.format(product.price)
        };
        this.data.items.push(prod);
        this.calculateTotals();
    }
}

//
// Our products are stored into a specific MongoDB collection and have the following document structure:



const mongoose  = require('mongoose');

let Schema  = mongoose.Schema;

let ProductsSchema = new Schema({
    product_id: Number,
    id: String,
    title: String,
    description: String,
    manufacturer: String,
    price: Number,
    image: String},
{collection: 'products'});

module.exports = mongoose.model('Products', ProductsSchema);

//
// Here's how products are added to the cart in our sample store:


const Security = require('./lib/Security');
const Products = require('./models/Products');

app.post('/cart', (req, res) => {
  let qty = parseInt(req.body.qty, 10);
  let product = parseInt(req.body.product_id, 10);
  if(qty > 0 && Security.isValidNonce(req.body.nonce, req)) {
    Products.findOne({product_id: product}).then(prod => {
        Cart.addToCart(prod, qty);
        Cart.saveCart(req);
        res.redirect('/cart');
    }).catch(err => {
       res.redirect('/');
    });
} else {
    res.redirect('/');
}
});

//
// saveCart() saves our cart into the current Express session:

saveCart(request) {
    if(request.session) {
        request.session.cart = this.data;
    }
}

//
// We also need to allow users to remove items from the cart:


removeFromCart(id = 0) {
    for(let i = 0; i < this.data.items.length; i++) {
        let item = this.data.items[i];
        if(item.id === id) {
            this.data.items.splice(i, 1);
            this.calculateTotals();
        }
    }

}


// There's a potential design problem in our cart: the cart is not automatically saved when we modify the cart data so that we have to manually invoke saveCart() in our routes. The reason behind this is that the current session is available as a property of the request object provided by Express, that is, is a middleware.
//
// Obviously users can also empty their cart:

emptyCart(request) {
    this.data.items = [];
    this.data.totals = 0;
    this.data.formattedTotals = '';
    if(request.session) {
        request.session.cart.items = [];
        request.session.cart.totals = 0;
        request.session.cart.formattedTotals = '';
    }
}


// To avoid problems with our session and cart class, we're simply restoring values to their original defaults. Users can empty the cart and continue shopping.
//
// Updating the cart, instead, usually means changing the quantity of each product. For that reason, we have to set our view accordingly:


<input type="text" class="qty" name="qty[]" value="<%= product.qty %>">
<input type="hidden" name="product_id[]" value="<%= product.id%>">

//
// We have two parallel arrays, qty and product_id. Each singular quantity points to a specific product and vice versa. In our class we have to add the following method:

updateCart(ids = [], qtys = []) {
    let map = [];
    let updated = false;

    ids.forEach(id => {
       qtys.forEach(qty => {
          map.push({
              id: parseInt(id, 10),
              qty: parseInt(qty, 10)
          });
       });
    });
    map.forEach(obj => {
        this.data.items.forEach(item => {
           if(item.id === obj.id) {
               if(obj.qty > 0 && obj.qty !== item.qty) {
                   item.qty = obj.qty;
                   updated = true;
               }
           }
        });
    });
    if(updated) {
        this.calculateTotals();
    }
}


//
// The update, and the consequent recalculation of the cart's totals, can take place only when there's a difference between the quantity of a product in the cart and the quantity provided by the user.
//
// In our route we have:

app.post('/cart/update', (req, res) => {
let ids = req.body["product_id[]"];
let qtys = req.body["qty[]"];
if(Security.isValidNonce(req.body.nonce, req)) {
    Cart.updateCart(ids, qtys);
    Cart.saveCart(req);
    res.redirect('/cart');
} else {
    res.redirect('/');
}
});



// In our sample store we use a PayPal form whose fields contain the values taken dynamically from our cart:
//




<% if(cart && cart.items.length > 0) { %>
<form id="paypal-form" action="<%= paypal.url %>" method="post">
<input type="hidden" name="cmd" value="_cart">
<input type="hidden" name="upload" value="1">
<input type="hidden" name="business" value="<%= paypal.businessEmail %>">

<input type="hidden" name="currency_code" value="<%= paypal.currency %>">
<% cart.items.forEach(function(product, index) { var n = index + 1; %>
<input type="hidden" name="quantity_<%= n %>" value="<%= product.qty%>">
<input type="hidden" name="item_name_<%= n %>" value="<%= product.title %>">
<input type="hidden" name="item_number_<%= n %>" value="SKU <%= product.title%>">
<input type="hidden" name="amount_<%= n %>" value="<%= product.price %>">
<% }); %>
<input type="image" id="paypal-btn" alt="Pay with PayPal" src="/public/images/paypal.png">
</form>
<% } else { %>
<p class="alert alert-info">Sorry, no products in your cart.</p>
<% } %>

//
// Finally, the user will be redirected to PayPal to complete the checkout process.
