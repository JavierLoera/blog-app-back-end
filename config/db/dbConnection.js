import mongoose from "mongoose";

export const connection = () => {
    try {
        mongoose.connect(process.env.URL_DB, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log("database connected")
    } catch (error) {
        console.log("Hubo un problema al conectarse a la base de datos " + error.message);
        process.exit(1);

    }
}