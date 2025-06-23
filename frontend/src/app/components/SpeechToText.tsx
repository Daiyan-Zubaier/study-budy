"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface SpeechToTextProps {
  onSessionCommand: (title: string, minutes: number, seconds: number, shouldStart: boolean) => void;
}

export default function SpeechToText({ onSessionCommand }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          parseCommand(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const parseCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Parse different command patterns
    let title = '';
    let minutes = 25;
    let seconds = 0;
    let shouldStart = false;

    // Check if it's a start command
    if (lowerText.includes('start session') || lowerText.includes('begin session')) {
      shouldStart = true;
      
      // Extract session title - everything between "start session" and time indicators
      const titleMatch = lowerText.match(/(?:start session|begin session)\s+(.+?)(?:\s+for\s+|\s+\d+\s+minutes?|\s+\d+\s+seconds?|$)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, l => l.toUpperCase());
      }

      // Extract minutes
      const minutesMatch = lowerText.match(/(\d+)\s+minutes?/);
      if (minutesMatch) {
        minutes = parseInt(minutesMatch[1]);
      }

      // Extract seconds
      const secondsMatch = lowerText.match(/(\d+)\s+seconds?/);
      if (secondsMatch) {
        seconds = parseInt(secondsMatch[1]);
      }

      // Alternative pattern: "for X minutes and Y seconds"
      const timeMatch = lowerText.match(/for\s+(\d+)\s+minutes?\s+(?:and\s+)?(\d+)\s+seconds?/);
      if (timeMatch) {
        minutes = parseInt(timeMatch[1]);
        seconds = parseInt(timeMatch[2]);
      }

    } else if (lowerText.includes('set timer') || lowerText.includes('timer for')) {
      // Handle timer-only commands
      const minutesMatch = lowerText.match(/(\d+)\s+minutes?/);
      const secondsMatch = lowerText.match(/(\d+)\s+seconds?/);
      
      if (minutesMatch) minutes = parseInt(minutesMatch[1]);
      if (secondsMatch) seconds = parseInt(secondsMatch[1]);
    }

    // Call the callback with parsed data
    onSessionCommand(title, minutes, seconds, shouldStart);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
        <Volume2 className="text-gray-400 mx-auto mb-2" size={24} />
        <p className="text-gray-400 text-sm">Speech recognition not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Volume2 className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Voice Commands</h3>
            <p className="text-gray-400 text-sm">Control your session with speech</p>
          </div>
        </div>
        
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? 'Stop' : 'Listen'}
        </button>
      </div>

      {transcript && (
        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-gray-300 text-sm">
            <span className="text-blue-400 font-medium">Heard:</span> "{transcript}"
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">Try saying:</p>
        <ul className="space-y-1 pl-4">
          <li>• "Start session Physics Review for 25 minutes"</li>
          <li>• "Begin session Math Homework for 30 minutes and 15 seconds"</li>
          <li>• "Start session Biology Study for 45 minutes"</li>
          <li>• "Set timer for 20 minutes"</li>
        </ul>
      </div>
    </div>
  );
} 