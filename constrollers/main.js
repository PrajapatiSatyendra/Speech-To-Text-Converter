require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { translate } = require("free-translate");
const path = require("path");

const urlUpload = "https://api.assemblyai.com/v2/upload";
const urlTranscript = "https://api.assemblyai.com/v2/transcript";


exports.transcriptionAndTranslation = async (req, res, next) => {
  try {
  
    /*----------------------------------------Request for url of audio file from Assembly AI--------------------------------------------------- */
    
    fs.readFile(path.join(__dirname,"../","audios","audio.mp3"), async (err, data) => {
      if (err) {
        return console.log(err);
      }
      const paramsUpload = {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "Transfer-Encoding": "chunked",
        },
        body: data,
        method: "POST",
      };

      const responseUpload = await fetch(urlUpload, paramsUpload);
      const jsonDataUpload = await responseUpload.json();
      // console.log(`Success: ${jsonDataUpload}`);
      // console.log(`URL: ${jsonDataUpload["upload_url"]}`);

      /*-----------------------------------Request for transcription from Assembly AI ------------------------------------------------------*/
        

      const audioUrl = jsonDataUpload["upload_url"];
      const language_code = "en";
        
      const dataTranscript = {
        audio_url: audioUrl,
        language_code: language_code,
      };

      const paramsTranscript = {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify(dataTranscript),
        method: "POST",
      };
      const responseTranscript = await fetch(urlTranscript, paramsTranscript);
      if (!responseTranscript.ok) {
        throw new Error("something went wrong");
      }
      const jsonDataTranscript = await responseTranscript.json();
      // console.log("Success:", jsonDataTranscript);
      // console.log("ID:", jsonDataTranscript["id"]);

      /*----------------------------Requesting with download id from Assembly AI---------------------------------------------------------- */
        
      const id = jsonDataTranscript["id"];
      const urlDownloadId = `https://api.assemblyai.com/v2/transcript/${id}`;

      const paramsDownloadId = {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
        method: "GET",
      };

      let jsonDataDownloadId, sourceText;
      const responseDownloadId = await fetch(urlDownloadId, paramsDownloadId);
      if (!responseDownloadId.ok) {
        throw new Error("something went wrong");
      }
      jsonDataDownloadId = await responseDownloadId.json();
      if (jsonDataDownloadId.status === "completed") {
        sourceText = jsonDataDownloadId.text;
        // console.log(sourceText);
         const translatedText = await translate(sourceText, { to: "hi" });

        //  console.log(translatedText);
         res
           .status(200)
           .json({ sourceText: sourceText, translatedText: translatedText });
      }
      else {
        let x = 0;
        let timerId = setTimeout(async function getTranscript() {
          try {
              const responseDownloadId = await fetch(
                urlDownloadId,
                paramsDownloadId
              );
              if (!responseDownloadId.ok) {
                throw new Error("something went wrong");
              }
              jsonDataDownloadId = await responseDownloadId.json();
              if (jsonDataDownloadId.status === "completed") {
                clearTimeout(timerId);
                sourceText = jsonDataDownloadId.text;
                const translatedText = await translate(sourceText, {
                  to: "hi",
                });
                // console.log(x, translatedText);
                res
                  .status(200)
                  .json({
                    sourceText: sourceText,
                    translatedText: translatedText,
                  });
              } else {
                setTimeout(getTranscript, 10000);
              }
          } catch (error) {
            next(error);
          }
        
          
        }, 10000);
      }

     
        
    });
      
  } catch (error) {
    next(error);
  }
};

