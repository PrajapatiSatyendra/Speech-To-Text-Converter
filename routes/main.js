const express= require('express');
const router = express.Router();
const mainControllers =require('../constrollers/main');


router.post(
  "/transcriptionAndTranslation",
  mainControllers.transcriptionAndTranslation
);


module.exports= router;