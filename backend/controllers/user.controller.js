const User = require("../models/User")

exports.profile = async(req,res)=>{

 const user = await User.findById(req.user.id)

 res.json(user)

}


/* const User = require("../models/User")

exports.profile = async(req,res)=>{

 const user = await User.findById(req.user.id).select("-password")

 res.json(user)

} */