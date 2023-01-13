const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'email required'],
        unique: [true, "email already exists"]
    },
    mobile: {
        type: String,
        required: [true, 'mobile number required'],
        unique: [true, "Mobile number already exists"]
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: Object,
        default: {
            url: "https://www.iiemdelhi.in/wp-content/uploads/2020/04/user-dummy-200x200-1.png"
        }
    },
    role: {
        type: String,
        default: "user"
    },
    jobs: {
        type: Array,
        default: []
    }
}, {
    collection: "users",
    timestamps: true
})

module.exports = mongoose.model("User", UserSchema)