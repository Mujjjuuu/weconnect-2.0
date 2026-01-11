
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  color?: string;
}

const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({ onTranscript, className = "", color = "bg-purple-600" }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`${className} p-3 rounded-xl transition-all flex items-center justify-center ${isListening ? 'animate-pulse ring-4 ring-red-400 bg-red-500 text-white' : `${color} text-white hover:opacity-90 active:scale-95`}`}
      title={isListening ? "Listening... (Click to stop)" : "Voice Dictation"}
      type="button"
    >
      {isListening ? <Icons.MicOff /> : <Icons.Mic />}
    </button>
  );
};

export default VoiceDictationButton;
