const express = require('express')
const ownerRouter=require('./router')
const dotenv =require('dotenv')
const errors = require('./utils/errors')

dotenv.config({path:'./config.env'})
const app = express();
app.use(express.json()); 
const port = process.env.PORT || 8080;

app.use(express.static('./public/images')); // allows access to the picture in images in folder public
app.use('/api/v1/owner',ownerRouter);
app.all("*",errors.pathError)
app.use(errors.ApiError);





app.listen(port, () => {
    console.log(`server is running on port ${process.env.PORT}`);

})
