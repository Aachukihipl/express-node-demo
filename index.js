const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res)=>{
    res.send('Hello this is my home page');
})

app.get('/about', (req, res)=>{
    res.send('Hello this is my about page');
})

app.get('/contact', (req, res)=>{
    res.send('Hello this is my contact page');
})



app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
})