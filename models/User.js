const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let userSchema = new Schema({
    prenom: {
        type: String
    },
    nom: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String
    },
    password: {
        type: String
    },
    etat: {
        type: Boolean
    },
    matricule: {
        type: String
    },
    date_inscription: {
        type: Date,
    },
}, {
    collection: 'users'
})

userSchema.plugin(uniqueValidator, { message: 'Email existe déja.' });
module.exports = mongoose.model('User', userSchema)