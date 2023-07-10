const mongoose = require('mongoose');


  
const ordersschema = mongoose.Schema({
    user : { type: String},
    restaurant : {type: String },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: Number,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String
  },
  status: {type : String,  default : "preparing" , enum:["placed", "preparing", "on the way", "delivered"]} 
})

const OrderModel = mongoose.model('order',ordersschema);

module.exports = {OrderModel}