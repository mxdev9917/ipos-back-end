const express = require('express')
const ownerRouter=require('./router')
const dotenv =require('dotenv')
dotenv.config({path:'./config.env'})
const app = express();
app.use(express.json()); 
const port = process.env.PORT || 8080;

app.use(express.static('./public/images')); // allows access to the picture in images in folder public
app.use('/api/v1/owner',ownerRouter);




app.listen(port, () => {
    console.log(`server is running on port ${process.env.PORT}`);

})
