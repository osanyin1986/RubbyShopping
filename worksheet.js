
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const postman = require("postman");
const helmet = require("helmet");
const redis = require("redis");
const session = require("express-session");
const mongoose = require('mongoose');
const passport= require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const _ = require("lodash");
const md5=require("md5");

const homeStartingContent ="";
const aboutContent="";
const cartContent="";
const registerContent="";
const loginContent="";
const forgotContent="";
const updateContent=""

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: 'secret session key',
  resave: false,
  saveUninitialized: true,
  unset: 'destroy',
  name: 'session cookie name'
}));

mongoose.connect("mongodb://localhost:27017/BRubbyDB",{ useNewUrlParser: true , useUnifiedTopology: true,useCreateIndex: true });
//
// Our products are stored into a specific MongoDB collection and have the following document structure:
//
// const cartSchema = ({
//     product_id: Number,
//     id: String,
//     title: String,
//     description: String,
//     manufacturer: String,
//     price: Number,
//     image: String,
// });
// const Cart = mongoose.model("Cart", cartSchema);


const userSchema = new mongoose.Schema({
    firstname: {type:String, require:true, unique:true},
    lastname:{type:String, require:true, unique:true},
    email: {type:String, require:true, unique:true},
    confirmpassword:{type:String, require:true},
    password: {type:String, require:true},
    role:String
  }, {strict: true});

userSchema.plugin(uniqueValidator);
// userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
// passport.use(User.createStrategy());
//
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });




// A property to store the products selected by the user, usually an array of objects.
// A property to store the cart totals.
// A property to store the cart totals as a formatted string to be displayed on the frontend.

app.get("/cart" , function (req, res) {
  constructor() ,function (req, res) {
    this.data = {};
    this.data.items = [];
    this.data.totals = 0;
    this.data.formattedTotals = '';
  }


});

// It's pretty clear now that we have to push products into the items array or remove them when users update the cart. We have also to update the cart totals accordingly.


app.get("/cart" , function (req, res) {
  inCart(productID = 0), function (req, res) {
   let found = false;
   this.data.items.forEach(item => {
      if(item.id === productID) {
          found = true;
      }
   });
   return found;
}
});


// Each product has its own ID so we're going to use this property as a unique identifier for all products.
//
// Now we can update both the cart totals and the formatted totals string:

app.get("/cart", function (req, res) {
  calculateTotals(), function (req, res)  {
      this.data.totals = 0;
      this.data.items.forEach(item => {
          let price = item.price;
          let qty = item.qty;
          let amount = price * qty;

          this.data.totals += amount;
      });
      this.setFormattedTotals();
  }

  setFormattedTotals(), function (req, res)  {
      let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
      let totals = this.data.totals;
      this.data.formattedTotals = format.format(totals);
  }

})
//
// module.exports = new Cart();
//
// numbers, you can safely use also Number.prototype.toLocaleString().
//
// It's time to add products to our cart:

app.get("/cart" , function (req, res) {
  addToCart(product = null, qty = 1), function (req, res){
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
});
//
// Here's how products are added to the cart in our sample store:

app.get("/cart",  function (req, res) {

  const qty = parseInt(req.body.qty, 10);
  const product = parseInt(req.body.product_id, 10);
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
//
// saves our cart into the current Express session:
saveCart(request), function (req, res) {
    if(request.session) {
        request.session.cart = this.data;
    }
}
});
//
// We also need to allow users to remove items from the cart:

app.get("/cart", function (req, res) {
  removeFromCart(id = 0)
    for(let i = 0; i < this.data.items.length; i++) {
        let item = this.data.items[i];
        if(item.id === id) {
            this.data.items.splice(i, 1);
            this.calculateTotals();
        }
    }
});


app.get("/cart", function (req, res) {
  emptyCart(request)
    this.data.items = [];
    this.data.totals = 0;
    this.data.formattedTotals = '';
    if(request.session) {
        request.session.cart.items = [];
        request.session.cart.totals = 0;
        request.session.cart.formattedTotals = '';
    }

});
//
// We have two parallel arrays, qty and product_id. Each singular quantity points to a specific product and vice versa. In our class we have to add the following method


app.get("/update", function (req, res) {
  updateCart(ids = [], qtys = [])
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
});


// The update, and the consequent recalculation of the cart's totals, can take place only when there's a difference between the quantity of a product in the cart and the quantity provided by the user.
//
// In our route we have:



app.get("/cart/update", (req, res) => {
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




app.get("/" ,function (req, res) {
  res.render("home" , {startingContent: homeStartingContent});

});

app.get("/about" ,function (req, res) {
  res.render("about" , {welcome: aboutContent});
});


app.get("/update", function (req, res) {
  res.render("update", {updateContent: updateContent});
});

app.get("/login" ,function (req, res) {
  res.render("login" , {loginContent: loginContent});
});

app.get("/register" ,function (req, res) {
  res.render("register" , {registerContent: registerContent});
});

app.get("/cart" ,function (req, res) {
  res.render("cart" , {cartContent: cartContent});
});

app.get("/forgot" , function (req, res) {
  res.render("forgot", {forgotContent: forgotContent});
});






app.post("/register",function(req,res) {
const newUser = new User({
firstName: req.body.firstName,
lastName : req.body.lastName,
Email: req.body.username,
ConfirmPassword: req.body.ConfirmPassword,
Password: req.body.Password
});
newUser.save(function (err) {
  if(err){
    console.log(err);
  }else{
    res.render("/login")
  }
});
});













app.listen(3000, function() {
  console.log("Server started on port 3000");
});
