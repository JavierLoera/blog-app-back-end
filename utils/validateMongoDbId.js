import mongoose from "mongoose";

export const validateMongoDbID = id => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if ((!isValid)) throw new Error('The Id is not valid or not found')
}