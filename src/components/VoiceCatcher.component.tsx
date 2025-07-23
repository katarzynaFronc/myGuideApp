import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useState } from "react";

export const VoiceCatcher = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const [shouldListen, setShouldListen] = useState(false);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;

    const recognition = SpeechRecognition.getRecognition();
    if (recognition) {
      recognition.continuous = true;

      recognition.onend = () => {
        console.log("onend, listening flag:", shouldListen);
        if (shouldListen) {
          SpeechRecognition.startListening({
            continuous: true,
            language: "pl-PL",
          });
        }
      };
    }
  }, [browserSupportsSpeechRecognition, shouldListen]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Twoja przeglądarka nie wspiera rozpoznawania mowy.</div>;
  }

  const startListening = async () => {
    setShouldListen(true);
    await SpeechRecognition.startListening({
      continuous: true,
      language: "pl-PL",
    });
  };

  const stopListening = async () => {
    setShouldListen(false);
    await SpeechRecognition.stopListening();
  };

  const resetListening = async () => {
    stopListening();
    resetTranscript();
  };

  const handleSend = async () => {
    await stopListening();
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: transcript }),
    });
    const { reply } = await res.json();
    speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
    resetTranscript();
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className=" p-3 text-center">
              <p>🔴 Nagrywanie: {listening ? "aktywne" : "zatrzymane"}</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className=" p-3 text-center">
              <button type="button" className="btn btn-primary" onClick={startListening}>
                Start
              </button>
            </div>
          </div>
          <div className="col">
            <div className=" p-3 text-center">
              <button type="button" className="btn btn-primary" onClick={stopListening}>
                Stop
              </button>
            </div>
          </div>
          <div className="col">
            <div className=" p-3 text-center">
              <button type="button" className="btn btn-primary" onClick={resetListening}>
                Resetuj
              </button>
            </div>
          </div>
          <div className="col">
            <div className=" p-3 text-center">
              <button onClick={handleSend} disabled={!transcript}>
                Wyślij
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="bg-light border p-3 text-center">
              <p>Tekst: {transcript}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
