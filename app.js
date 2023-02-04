const express=require('express');
const cors= require('cors');
const mainRoutes = require('./routes/main');
const multer = require("multer");
const path = require('path');

const app=express();
const PORT = 5000;
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});


// const corsOption = {
//     origin: ['https://transcript.vercel.app','https://localhost:3000'],
//     optionsSuccessStatus: 200,
//     methods: "GET,POST,PUT,DELETE"
// } 
//app.use(cors(corsOption));
app.use(multer({ storage: fileStorage }).single('file'));
app.use('/main', mainRoutes);

app.use((error, req, res, next) => {
  console.log(error.message);
  const status = error.statusCode || 500;
  if (error.statusCode === 500) {
    error.message;
  }
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

if (process.env.NODE_ENV == 'production') {
    
    app.get('/', (req, res) => {
        app.use(express.static(path.resolve(__dirname, 'client', 'build')));
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}
app.listen(PORT,()=>{
    console.log(`listening at port ${PORT}`)
})
