const express=require("express")
require('dotenv').config();

const {connection}=require("./config/db")

const {APIRouter}=require("./controllers/routes")



const app=express()
app.use(express.json())

app.use('/api',APIRouter);

app.get("/",(req,res)=>{
    res.send("home page")
})



let port=process.env.port

app.listen(port,async()=>{
    try {
        await connection
        console.log("connected to data base")
        
    } catch (error) {
        
    }
    console.log(`server is running in port ${port} `)
})