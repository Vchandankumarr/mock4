const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

const {authenticate}=require("../middleware/authenticate")
const {UserModel}=require("../models/user")
const {RestaurantModel}=require("../models/restaurant")
const {OrderModel}=require("../models/order")


const APIRouter = express.Router();

APIRouter.get("/",(req,res)=>{
    try {
        res.status(200).send({msg:"API router working fine"})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


//  sign UP

APIRouter.post('/register',async (req,res)=>{
    try {
        let {email , name , password , address} = req.body;
        let {street,city,state,country,zip} = address
        if(!email || !name || !password || !address ){
            res.status(400).send({msg:"Please provide all details"});
        }else if(!street || !city || !state || !country || !zip){
            res.status(400).send({msg:"Please provide correct address"});
        }else{
            let ifexist = await UserModel.find({email});
            if(ifexist.length){
                res.status(400).send({msg:"This email already exists"})
            }else{
                bcrypt.hash(password, 8,async (err, hash)=>{
                    // Store hash in your password DB.
                    if(err){
                        res.status(500).send({msg:err})
                    }else{
                        let user = new UserModel({email , name , password:hash , address});
                        await user.save()
                        res.status(201).send({msg:"User Has been registered"})
                    }
                });
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


// login 

APIRouter.post('/login',async (req,res)=>{
    try {
        let {email ,  password } = req.body;
        if(!email || !password){
            res.status(400).send({msg:"Please provide all the details"})
        }else{
            let ifexist = await UserModel.find({email});
            if(ifexist.length){
                bcrypt.compare(password,ifexist[0].password,(err,result)=>{
                    if(err){
                        res.status(500).send({msg:err})
                    }else{
                        if(result){
                            let token = jwt.sign({userID: ifexist[0]._id, email}, process.env.secret, { expiresIn: '1h' });
                            res.status(201).send({msg:"Login Successful",token})
                        }else{
                            res.status(400).send({msg:"Incorrect credentials"})
                        }
                    }
                })
            }else{
                res.status(400).send({msg:"Incorrect credentials"})
            }   
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


//  password reset 
APIRouter.patch("/user/:id/reset",async(req,res)=>{
    try {
       let {id} = req.params; 
       console.log(id)
    //    res.send(req.params)
        let {current_password,new_password} = req.body;
        if(!current_password || !new_password){
            res.status(400).send({msg:"Please provide all the details"})
        }else{
            let curruser =await UserModel.findById(id)
            bcrypt.compare(current_password,curruser.password,(err,result)=>{
                if(err){
                    res.status(500).send({msg:err})
                }else{
                    if(result){
                        bcrypt.hash(new_password, 8,async (err, hashed)=>{
                            // Store hash in your password DB.
                            if(err){
                                res.status(500).send({msg:err})
                            }else{
                                let user = await UserModel.findByIdAndUpdate(id,{password:hashed});
                                res.status(201).send({msg:"User password Has been updated"})
                            }
                        });
                    }else{
                        res.status(400).send({msg:"Incorrect current password"})
                    }
                }
            })
            
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


// to get all the restaurents 

APIRouter.get('/restaurants',async (req,res)=>{
    try {
        let restaurants = await RestaurantModel.find();

        res.status(200).send(restaurants)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


// TO get specific Restaurent using ID

APIRouter.get('/restaurants/:id',async (req,res)=>{
    try {
        let {id} = req.params
        let restaurants = await RestaurantModel.findById(id);

        res.status(200).send(restaurants)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

// TO Post or cretate new Restaurent
APIRouter.post('/restaurants',async (req,res)=>{
    try {
        let {name, address,  menu} = req.body
        let {description,price,image} = menu[0]
        let menu_name = menu[0].name
        if(!name || !address || !menu ){
            res.status(400).send({msg:"Provide all correct details"})
        }else if(!description || !price || !image || !menu_name){
            console.log(description,price,image,menu_name,menu.name)
            res.status(400).send({msg:"Provide all correct details"})
        }else{
            let restaurant = new RestaurantModel({
                name,
                address,
                menu : [{
                    id: uuidv4(),
                    name : menu_name,
                    description,
                    price,
                    image
                }]
            })
            // console.log(uuidv4())
            await restaurant.save()
            res.status(201).send(restaurant)
        }
     
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


APIRouter.get('/restaurants/:id/menu',async (req,res)=>{
    try {
        let {id} = req.params
        let restaurants = await RestaurantModel.findById(id);

        res.status(200).send(restaurants.menu)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})



APIRouter.post('/restaurants/:id/menu',async (req,res)=>{
    try {
        let {id} = req.params
        let {name ,description,price,image} =req.body
        if(!description || !price || !image || !name){
            // console.log(description,price,image,menu_name,menu.name)
            res.status(400).send({msg:"Provide all correct details"})
        }else{   
            let restaurants = await RestaurantModel.findById(id);
            restaurants.menu.push({ id: uuidv4(),name ,description,price,image})

            let updated = await RestaurantModel.findByIdAndUpdate(id,restaurants,{returnDocument:'after'});

            res.status(201).send(updated)
        }
   
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})



// To delete any item from menue
APIRouter.delete('/restaurants/:id/menu/:idm',async (req,res)=>{
    try {
        let {id,idm} = req.params
        
            let restaurants = await RestaurantModel.findById(id);
            let arr = restaurants.menu;
            let c = 0 ; 
            for(let item of arr){
                // console.log(item)
                if(item.id===idm){
                    // console.log(item)
                    arr.splice(c,1)
                }
                c++;
            }
            // console.log(restaurants.menu)
            let deleted = await RestaurantModel.findByIdAndUpdate(id,restaurants,{returnDocument:'after'});

            res.status(201).send(deleted);
        // }
   
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


APIRouter.post('/orders',authenticate,async(req,res)=>{
    try {
        // res.send(req.body)
        let {userID,restaurant,items,deliveryAddress} = req.body;
        
        if( !userID || !restaurant || !items || !deliveryAddress || !items.length ){
            res.send({msg:"Provide correct details"})
        }else{
            let total = 0 ;
            items.forEach((element,ind) => {
                total+=element.price*element.quantity
            });

            let order = new OrderModel({
                user:userID,
                restaurant,
                items,
                totalPrice : total,
                deliveryAddress
            })

           await  order.save()

           res.status(201).send({msg:"order placed",order})
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.get('/orders/:id',async (req,res)=>{
    try {
        let {id} = req.params
        let orders = await OrderModel.findById(id);

        res.status(200).send(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.patch('/orders/:id',async (req,res)=>{
    try {
        let {id} = req.params
        let {status} = req.body;

        let orders = await OrderModel.findByIdAndUpdate(id,{status},{returnDocument:'after'});

        res.status(200).send({msg:"Order status updated",orders})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

module.exports = {APIRouter}