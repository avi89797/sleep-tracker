require('dotenv').config();
const express=require('express');
const app =express();
require('./src/db/conn');
const User =require("./src/models/User");
const port =process.env.PORT || 3000;
const bcrypt=require('bcrypt');
const jwt =require("jsonwebtoken");
const cookieParser =require("cookie-parser");
const auth=require("./src/middleware/auth");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
const Sleep = require("./src/models/sleep");
app.get("/register",(req,res)=>{
    res.render("register");
})
app.post("/register",async(req,res)=>{
    try{
        const password =req.body.password;
        const confirmPassword =req.body.confirmpassword;
        if(password === confirmPassword){
            const registerEmployee = new User ({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.eamil,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmPassword:req.body.confirmPassword,
            })
            //password hash
            console.log("the success part"+ registerEmployee);

            
            const token =await registerEmployee.generateAuthToken();
            console.log("the token part"+token);

            res.cookie("jwt",token,{
                expires:new Date(date.now() + 30000),
                httpOnly:true
            });
            console.log(cookie);

            const registered =await registerEmployee.save();
            res.status(201).render(index);
        } 
        else 
        {
            res.send("password are not matching")
        };

    }catch(error){
        res.status(400).send(error);
    }
})
//login check
app.post("/login",async(req,res)=>{
    try{
        const email =req.body.email;
        const password=req.body.password;
        const useremail=await User.findOne({email:email});
        const isMatch =bcrypt.compare(password,useremail.password);
        const token =await registerEmployee.generateAuthToken();
        res.cookie("jwt",token,{
            expires:new Date(date.now() + 30000),
            httpOnly:true,
            secure:true        
        });
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid credentials");
        }
    }catch(error){
        res.status(400).send("invalid email");
    }
})

app.get("/logout",auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.token.filter((currentElement)=>{
        return currentElement.token != req.token;
        })
        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");

    }catch(error){
        res.status(500).send(error);
    }

})

const removeTime = (date = new Date()) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


app.post("/",auth,async(req,res)=>{

    const { sleepTime, wakeUpTime, date } = req.body;

        if (!sleepTime || !wakeUpTime || !date) {
            res.status(400);
            throw new Error("Invalid input.");
        }

        const user = await User.findById(req.user.id);
    
        if (!user) {
            res.status(401);
            throw new Error("User not found!");
        }
    
    
        const transformed_date = removeTime(new Date(date));

        const sleep = await Sleep.find({ user: req.user.id, date: transformed_date });
    
        if (sleep.length > 0) {
            res.status(412);
            throw new Error("There is already a sleep entry for that date!");
        }
      
        const new_sleep = await Sleep.create({
          sleepTime,
          wakeUpTime,
          date: transformed_date,
          user: req.user.id,
        });
      
        res.status(201).json(new_sleep);
});



app.get("/",auth,async(req,res)=>{
  const user = await User.findById(req.user.id);

  const daysBack = parseInt(req.query.daysBack || 7);

  if (!user) {
    res.status(401);
    throw new Error("User not found!");
  }

  const startFilterDate = new Date().setDate(new Date().getDate() - daysBack);

  const sleepEntries = await Sleep.find({
    user: req.user.id,
    date: { $gte: startFilterDate, $lt: new Date() },
  }).sort({
    date: -1,
  });

  res.status(200).json(sleepEntries);
});


app.listen(port,()=>{
    console.log(`server is running at port number ${port}`);
})