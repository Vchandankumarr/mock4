const mongoose = require('mongoose');
  
  
const restaurantschema = mongoose.Schema({
    name: {type:String , required : true},
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    },
    menu: [{
        id: String,
        name: String,
        description: String,
        price: Number,
        image: String
      }]
})

const RestaurantModel = mongoose.model('restaurant',restaurantschema);

module.exports = {RestaurantModel}