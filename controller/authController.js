const { StatusCodes } = require("http-status-codes")
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const { createAccessToken } = require('../helpers/token')
const jwt = require('jsonwebtoken')

const authController = {
    register: async (req,res) => {
        try {
            const { name, email, mobile, password }= req.body

            const extEmail = await User.findOne({ email })
                if(extEmail)
                    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "email already exists"})
            
            const extMobile = await User.findOne({ mobile })
                if(extMobile)
                    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "mobile already exists"})

            const encPass = await bcrypt.hash(password, 10);
                
            const newUser = await User.create({ name, email, mobile, password : encPass })


            res.status(StatusCodes.OK).json({ data : newUser, msg: "user Successfully registered" })
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    login: async (req,res) => {
        try {
            const { email, password } = req.body

            // user email already registered or not
            const extUser = await User.findOne({ email });
                if(!extUser) 
                    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User email doesn't exists."})

            // match the password
            const isMatch = await bcrypt.compare(password,extUser.password)
                if(!isMatch)
                    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Passwords are not matched"})
                
            // generate token
            const accessToken = createAccessToken({ id: extUser._id })

            // store in cookies
            res.cookie('refreshToken', accessToken, {
                httpOnly: true,
                signed: true,
                path: `/api/v1/auth/refresh_token`,
                maxAge: 1 * 24 * 60 * 60 * 1000
            })

            res.status(StatusCodes.OK).json({ msg: "Login Success", accessToken  })
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    logout: async (req,res) => {
        try {
            res.clearCookie('refreshToken', { path : `/api/v1/auth/refresh_token`})
            res.status(StatusCodes.OK).json({ msg: "Logout Successfully"})
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    getUserInfo: async (req,res) => {
        try {
            // const user = req.user;
            // res.json({ user })

            const user = await User.findById({ _id : req.user.id })
            res.status(StatusCodes.OK).json({ user })

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    userAccessToken: async (req,res) => {
        try {
            const rf = req.signedCookies.refreshToken;

            if(!rf) 
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "session expired, Login again"})
            
            // verify the token
            jwt.verify(rf, process.env.SECRET_TOKEN, (err,user) => {
                if(err)
                    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid Access token.. Unauthorized login."})
                
                // valid token
                // res.json({ user })

                const userToken = createAccessToken({ id: user.id })
                res.json({ userToken })
            })

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }   
    },
    getAllUsers: async (req,res) => {
        try {

            const users = await User.find({}).select('-password')

            const filteredUsers = users.filter(item => item.role !== "superadmin")
                
            res.json({ users : filteredUsers })

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    changeRole: async (req,res) => {
        try {
             let id  = req.params.id
            const { role } = req.body

            const extUser = await User.findById({ _id: id})
            if(!extUser)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: "user id not exists."})

             await User.findByIdAndUpdate({ _id: id}, {
                role                
             })
            res.status(StatusCodes.OK).json({ msg: "Sucessfully updated the role."})
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    updateUser: async (req,res) => {
        try {
           let id = req.params.id
           const { name, mobile, image} = req.body
           const userId = req.user.id

           const extUser = await User.findById({ _id: id})
           if(!extUser)
               return res.status(StatusCodes.NOT_FOUND).json({ msg: "user id not exists."})

           if(userId !== id)
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Unauthorized user id"})

           await User.findByIdAndUpdate({_id: id}, {
                name, mobile, image
           })

           res.status(StatusCodes.OK).json({ msg: "Sucessfully updated the user."})
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    deleteUser: async (req,res) => {
        try {
            const id = req.params.id

            const extUser = await User.findById({ _id: id})
                if(!extUser)
                    return res.status(StatusCodes.NOT_FOUND).json({ msg: "user id not exists."})
                
            await User.findByIdAndDelete({ _id: id})

            res.status(StatusCodes.OK).json({ msg: "Successfully deleted the user"})
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    }
}

module.exports = authController