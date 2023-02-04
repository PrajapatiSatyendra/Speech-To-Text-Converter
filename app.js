const express=require('express');
const cors= require('cors');
const mainRoutes = require('./routes/main');
const multer = require("multer");
const path = require('path');

const app=express();
const PORT = 5000;
app.use(express.urlencoded({extended:false}));
app.use(express.json());


// const corsOption = {
//   origin: ["http://localhost:5000", "http://localhost:3000"],
//   optionsSuccessStatus: 200,
//   methods: "GET,POST,PUT,DELETE",
// };
// app.use(cors(corsOption));



const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'audios');
    
    },
    filename: (req, file, cb) => {
        const date =  Date.now();
        cb(null, date+ '-' + file.originalname)
    }
});
const upload = multer({ storage: fileStorage });

app.use(upload.single("file"));
app.use(express.static(path.join(__dirname, "audios")));


app.use('/main',mainRoutes);

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
