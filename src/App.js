import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioList, setAudioList] = useState([]);
  const [transcriptions, setTranscriptions] = useState([]); // Store transcriptions
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize MediaRecorder
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioList((prev) => [
            ...prev,
            { url: audioUrl, blob: audioBlob },
          ]);
          chunksRef.current = [];
        };
      })
      .catch((error) => console.error("Error accessing microphone:", error));

    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setTranscriptions((prev) => [...prev, transcript]);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  // Start Recording
  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    mediaRecorderRef.current.start();
    recognitionRef.current && recognitionRef.current.start();
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    mediaRecorderRef.current.stop();
    recognitionRef.current && recognitionRef.current.stop();
  };

  // Pause/Resume Recording
  const togglePauseResume = () => {
    if (isPaused) {
      mediaRecorderRef.current.resume();
      recognitionRef.current && recognitionRef.current.start();
    } else {
      mediaRecorderRef.current.pause();
      recognitionRef.current && recognitionRef.current.stop();
    }
    setIsPaused((prev) => !prev);
  };

  // Delete Audio
  const deleteAudio = (index) => {
    setAudioList((prev) => prev.filter((_, i) => i !== index));
    setTranscriptions((prev) => prev.filter((_, i) => i !== index)); // Delete corresponding transcription
  };

  return (
    <div className="audio-recorder">
      <div className="controls">
        {/* Recording Controls */}
        {!isRecording ? (
          <button className="record-btn" onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <div>
            <button className="pause-resume-btn" onClick={togglePauseResume}>
              {isPaused ? "Resume Recording" : "Pause Recording"}
            </button>
            <button className="stop-btn" onClick={stopRecording}>
              Stop Recording
            </button>
          </div>
        )}
      </div>

      {/* Animation when recording */}
       {/* Recording Animation */}
       {isRecording && !isPaused && (
        <div className="recording-animation">
          <div className="recording-bar"></div>
          <div className="recording-bar"></div>
          <div className="recording-bar"></div>
          <div className="recording-bar"></div>
          <div className="recording-bar"></div>
        </div>
      )}

      {/* Saved Audios with Transcriptions */}
      <div className="saved-audios">
        <h2>Saved Audios:</h2>
        {audioList.map((audio, index) => (
          <div className="audio-item" key={index}>
            <audio src={audio.url} controls />
            <div className="transcription">
              <strong>Transcription:</strong>{" "}
              {transcriptions[index] || "Processing..."}
            </div>
            <button className="delete-btn" onClick={() => deleteAudio(index)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioRecorder;
