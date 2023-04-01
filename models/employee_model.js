const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        default:18
    },
    salary:{
        type:Number,
        default:1000
    }
},{
    collection:'employees',
    versionKey:false
})

const EmployeeModel = mongoose.model('employee',EmployeeSchema);

exports.EmployeeModel = EmployeeModel;