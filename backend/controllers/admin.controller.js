const User = require("../models/User")

exports.users = async(req,res)=>{

 const page = parseInt(req.query.page)||1
 const limit = 10

 const users = await User.find()
 .skip((page-1)*limit)
 .limit(limit)

 res.json(users)

}