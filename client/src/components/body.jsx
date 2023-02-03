import { useState } from 'react';
import { BsMicFill } from 'react-icons/bs';
import { BsFillMicMuteFill } from 'react-icons/bs';
import vmsg from "vmsg";


const recorder = new vmsg.Recorder({
  wasmURL: "https://unpkg.com/vmsg@0.3.0/vmsg.wasm",
});

const Body = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState();
    const [sourceText, setSourceText] = useState();
  const [targetText, setTargetText] = useState();
  const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    

    const record = async () => {

        setIsLoading(true);
       
        if (isRecording) {
            const blob = await recorder.stopRecording();
            setIsLoading(false);
            setIsRecording(false);
            setRecording(URL.createObjectURL(blob));
          
          const getTranscription = async () => {
            setIsLoadingAPI(true);
                const form = new FormData();
                form.append('file', blob, "audio.mp3");
                try {
                    const result = await fetch(`http://localhost:8000/main/transcriptionAndTranslation`, {
                        method: "post",
                        body: form
                    });
                    const jsonData = await result.json();
                    if (!result.ok) {
                        throw new Error(jsonData.message);
                    }
                  
                    setSourceText(jsonData.sourceText);
                  setTargetText(jsonData.translatedText);
                  setIsLoadingAPI(false);
                } catch (error) {
                    console.log(error);
                }
            }
            getTranscription();


        } else {
            try {
                await recorder.initAudio();
                await recorder.initWorker();
                recorder.startRecording();
                setIsLoading(false);
                setIsRecording(true);
            } catch (e) {
                console.error(e);
                setIsLoading(false);
            }
        }
    };
 
  return (
    <div className="flex flex-col items-center pt-8 gap-y-4">
      <div className="w-[72%] h-16 border-2 rounded-full shadow-md flex justify-center items-center gap-x-16  ">
        <button
          disabled={isLoading}
          className={
            !isRecording
              ? "bg-slate-500 px-4 py-1 rounded-sm text-white hover:bg-slate-400 transition ease-in-out duration-75"
              : "bg-red-500 px-4 py-1 rounded-sm text-white hover:bg-red-400 transition ease-in-out duration-75"
          }
          onClick={() => {
            record();
          }}
        >
          {isRecording ? "Stop" : "Record"}
        </button>
        <div className="relative ">
          {isRecording ? (
            <>
              <BsMicFill className="text-2xl" />
              <div className="absolute top-0.5 left-0.2 animate-ping rounded-full bg-red-400 w-7 h-7 opacity-75 "></div>
            </>
          ) : (
            <BsFillMicMuteFill className="text-2xl" />
          )}
        </div>
        <div>{recording && <audio src={recording} controls />}</div>
      </div>
      <div className="grid grid-cols-2 border divide-x-2 divide-slate-900 p-6 gap-x-2 shadow-lg rounded-md">
        <div className="divide-y-2">
          <label
            htmlFor="source-language"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Source Language (english)
          </label>
          {/* <p className="ml-10 mb-1"></p> */}
          <textarea
            name="source-language"
            id="source-language"
            cols="74"
            rows="18"
            className=" p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg "
            placeholder="Transcription..."
            value={isLoadingAPI ? "Loading..." :sourceText}
            readOnly={true}
          >
         
          </textarea>
        </div>

        <div className="pl-2 divide-y-2">
          <label
            htmlFor="target-language"
            className=" block mb-2 text-sm font-medium text-gray-900"
          >
            Target Language (hindi)
          </label>
          <textarea
            name="target-language"
            id="target-laguage"
            cols="74"
            rows="18"
            className=" p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg   "
            placeholder="Translation..."
            value={isLoadingAPI ? "Loading..." : targetText}
            readOnly={true}
          >
          
          </textarea>
        </div>
      </div>
    </div>
  );
};

export default Body;
