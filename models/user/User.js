import mongoose from "mongoose";
import bcrypt from "bcrypt"
import crypto from "crypto"

const UserSchema = mongoose.Schema({
    firstName: {
        required: [true, "First name is required"],
        type: String
    },
    lastName: {
        required: [true, "Last name is required"],
        type: String
    },
    profilePhoto: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    email: {
        required: [true, "Email is required"],
        type: String
    },
    bio: {
        type: String
    },
    password: {
        required: [true, "Password is required"],
        type: String,

    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    roles: {
        type: String,
        enum: ['Admin', 'Guest', 'Blogger']
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,
    followers: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    following: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    passwordChandedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true,
})

/*virtual method for pupulate all the created posts
past to virtual whenever name you want
the object config takes ref to the model tha we want to populate and,
 the foreignField that is tha exact name of the field where is this model references
*/

UserSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'user'
});

UserSchema.methods.toJSON = function () {
    const obj = this.toObject(); //or var obj = this;
    delete obj.password;
    delete obj.passwordResetToken
    delete obj.passwordResetExpires
    return obj;
}


UserSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) {
        next();
    }

    bcrypt.genSalt(12, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
};


UserSchema.methods.generateVerificationToken = async function () {
    const user = this;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000;
    return verificationToken
}


UserSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    return resetToken
}
export const User = mongoose.model('User', UserSchema)


