const { StatusCodes } = require('http-status-codes')
const User = require('../model/User')

const adminAuth = async (req,res,next) => {
    try {
        // res.json({ adminuser: req.user })

        const adminUser = await User.findById({ _id: req.user.id })
            if(!adminUser)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: "user id doesn't exists"})
        
         if(adminUser.role !== "superadmin")
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Admin Resources, access denied for non-admin users."})
        // res.json({ adminUser })
         next()  // to continue execution process to next controller
        
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message})
    }
}

module.exports = adminAuth