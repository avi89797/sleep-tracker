const mongoose =require("mongoose");
const bcrypt=rquire("bcrypt");
const jwt=require("jsonwebtoken");
//we made the schema
const employeeSchema =new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:Number,
        required:true
    },
    confirmpassword:{
        type:Number,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})
//generating tokens
employeeSchema.methods.generateAuthToken= async function(){
    try{
        const token =jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        console.log(token);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(error){
        res.send("the error part"+error);
        console.log(error);
    }
}

employeeSchema.pre("save",async function(next){
    
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.confirmpassword=await bcrypt.hash(this.password, 10);
    }
    
    next();
})
//now we need to make collections

const User = new mongoose.model("User",employeeSchema);
module.export =User;