require('dotenv').config()
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
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const findOrCreate = require("mongoose-findOrcreate")

// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const md5=require("md5");


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




app.use(session({
  secret: 'secret session key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb+srv://osanyin1986:trendytrendy@123@cluster0-co28s.mongodb.net/RubbyDB",
{ useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify:  false});

// mongoose.connect("mongodb://localhost:27017/BRubbyDB",{ useNewUrlParser: true ,
//   useUnifiedTopology: true,
//   useCreateIndex: true });

mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    password:String,
    confirmpassword:String,
    googleId:String
});

 userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

 const User = mongoose.model("User", userSchema);

 passport.use(User.createStrategy());

 passport.serializeUser(function(user, done) {
   done(null, user.id);
 });

 passport.deserializeUser(function(id, done) {
   User.findById(id, function(err, user) {
     done(err, user);
   });
 });


 passport.use(new GoogleStrategy({
    consumerKey: process.env.CLIENT_ID,
    consumerSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/rubbyshopping"
   },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
  }
));

 let updates = [];
 app.get("/updates/:updateid", function(req, res) {

     var updateimg;
     var productName;
     var price;
     var sid;

     Update.findById(req.params.updateid, function(err, update) {
         sid = update._id;

         updateimg = update.img.data.toString('base64');
         productName = update.productName;
         price = update.price;

         // if (req.isAuthenticated()) {
         //     foundid = req.user.username;
         //     title = 'MD-productDes';
         //
         //     res.render("productDes", {
         //         header: header1,
         //         foundid: foundid,
         //         titleOf: title,
         //         sareeimg: sareeimg,
         //         productName: productName,
         //         productDescription: productDescription,
         //         category: category,
         //         prize: prize,
         //
         //         pieces: pieces,
         //         sid: sid
         //     });
         // }
     })
 });

























 app.get("/" ,function (req, res) {
   res.render("home" , {startingContent: homeStartingContent});

 });

app.get("/auth/google", function (req, res) {
  passport.authenticate("google", { scope: ["profile"] })
});

app.get("/auth/google/rubbyshopping",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authenticate redirect to home
    res.redirect('/');
  });


app.get("/compose" , function (req, res) {
  res.render("Compose")
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

//
// app.post("/forgot", function (req, res) {
//
// })

app.post("/compose",  function(req, res){
  const update = new Update ({

    _id: req.body.productId,
    productName: req.body.productName,
    price: req.body.price
  })
});


 app.post("/register",function (req, res) {

 User.register(({firstname: req.body.firstName,lastname:req.body.lastName,
   username:req.body.username}),
   (req.body.password, req.body.confirmpassword),
    function(err, user){
     if(err){
       console.log(err);

       res.redirect("/register")
     }else{
       passport.authenticate("local")(req, res, function () {
         res.redirect("/login")
       })
     }
   });
 });


 app.post("/login" , function (req, res) {

   const user = new User({
     username: req.body.username,
     password: req.body.password
   });

   req.login(user, function (err) {
     if (err) {
       console.log(err);
     } else{
       passport.authenticate("local")(req, res,function () {
         res.redirect("/");
       });
     }
   });
 });
 //
 // app.get("/logout", function (req, res) {
 //   req.logout();
 //   res.redirect("/login");
 // });
 //


 app.post('/forgot', function(req, res, next) {

   const user = new User({
     username: req.body.username,
     password: req.body.password
   });

   req.login(user, function (err) {
     if (err) {
       console.log(err);
     } else{
       passport.authenticate("local")(req, res,function () {
         res.redirect("/");
       });
     }
   });

   // async.waterfall([
   //   function(done) {
   //     crypto.randomBytes(20, function(err, buf) {
   //       const token = buf.toString('hex');
   //       done(err, token);
   //     });
   //   },
   //   function(token, done) {
   //     User.findOne({ username: req.body.username }, function(err, user) {
   //       if (!user) {
   //         req.flash('error', 'No account with that email address exists.');
   //         return res.redirect('/forgot');
   //       }
   //
   //       user.restpassword = token;
   //       user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
   //
   //       user.save(function(err) {
   //         done(err, token, user);
   //       });
   //     });
   //   },
   //   function(token, user, done) {
   //     const smtpTransport = nodemailer.createTransport('SMTP', {
   //       service: 'SendGrid',
   //       auth: {
   //         username: "!!! YOUR SENDGRID USERNAME !!!",
   //         password: "!!! YOUR SENDGRID PASSWORD !!!"
   //       }
   //     });
   //     const mailOptions = {
   //       to: user.username,
   //       from: "passwordreset@demo.com",
   //       subject: "Node.js Password Reset",
   //       text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
   //         'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
   //         'http://' + req.headers.host + "/reset/" + token + "\n\n" +
   //         'If you did not request this, please ignore this email and your password will remain unchanged.\n'
   //     };
   //     smtpTransport.sendMail(mailOptions, function(err) {
   //       req.flash('info', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
   //       done(err, 'done');
   //     });
   //   }
   // ], function(err) {
   //   if (err) return next(err);
   //   res.redirect("/login");
   // });
 });










 let port = process.env.PORT;
 if (port == null || port == "") {
     port = 3000;
 }





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
