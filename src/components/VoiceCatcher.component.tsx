import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect } from "react";

export const VoiceCatcher = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    const recognition = SpeechRecognition.getRecognition();
    if (recognition) {
      recognition.continuous = true;
      recognition.onend = () => {
        console.log("Sesja zakończona – restartuję nasłuch");
        SpeechRecognition.startListening({ continuous: true, language: "pl-PL" });
      };
    }
  }, [browserSupportsSpeechRecognition]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Twoja przeglądarka nie wspiera rozpoznawania mowy.</div>;
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: "pl-PL" });
  const stopListening = () => SpeechRecognition.stopListening();

  const handleSend = async () => {
    stopListening();
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
    <div>
      <p>🔴 Nagrywanie: {listening ? "aktywne" : "zatrzymane"}</p>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <button onClick={handleSend} disabled={!transcript}>
        Wyślij
      </button>
      <p>Tekst: {transcript}</p>
    </div>
  );
};
