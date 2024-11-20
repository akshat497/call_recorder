import React, { useState, useEffect, useRef } from 'react';
import { transcribeAudio } from '../services/deepgram'; // Assuming this is your transcription service

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // For playback status
  const [currentTime, setCurrentTime] = useState(0); // To track playback progress
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null); // Reference for audio element

  useEffect(() => {
    // Initialize media recorder when the component mounts
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = event => {
          chunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
          setAudioBlob(blob);
          chunksRef.current = []; // Clear the chunks array for the next recording

          // Call transcribe after stopping the recording
          await transcribe(); // Make sure to await the transcription to ensure it updates before showing the result
        };
      })
      .catch(error => console.error('Error accessing audio device:', error));

    return () => {
      // Cleanup media stream when component unmounts
      mediaRecorderRef.current && mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const transcribe = async () => {
    if (audioBlob) {
      try {
        const transcription = await transcribeAudio(audioBlob);
        console.log('Transcription received:', transcription); // Check the result
        setTranscript(transcription); // Update the transcription state
      } catch (error) {
        console.error('Error during transcription:', error);
      }
    }
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0); // Reset the progress tracker
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="controls">
        {isRecording ? (
          <>
            {isPaused ? (
              <button onClick={resumeRecording} className="pause-btn">Resume</button>
            ) : (
              <button onClick={pauseRecording} className="pause-btn">Pause</button>
            )}
            <button onClick={stopRecording} className="stop-btn">Stop</button>
          </>
        ) : (
          <button onClick={startRecording} className="record-btn">Start Recording</button>
        )}
      </div>

      {audioBlob && (
        <div className="audio-preview">
          <audio
            ref={audioRef}
            controls
            src={URL.createObjectURL(audioBlob)}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      )}

      {transcript && (
        <div className="transcription">
          <h3>Transcription:</h3>
          <p>{transcript}</p>
        </div>
      )}

      {isRecording && <div className="recording-indicator"></div>}

      {/* Play/Pause/Stop Controls for Stored Audio */}
      {audioBlob && !isRecording && (
        <div className="audio-controls">
          <button onClick={handlePlayAudio} className="play-btn" disabled={isPlaying}>
            Play
          </button>
          <button onClick={handlePauseAudio} className="pause-btn" disabled={!isPlaying}>
            Pause
          </button>
          <button onClick={handleStopAudio} className="stop-btn">
            Stop
          </button>
        </div>
      )}

      {/* Progress Tracker */}
      {audioBlob && !isRecording && (
        <div className="audio-progress">
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
            />
          </div>
          <span>{Math.floor(currentTime)}s</span> / <span>{Math.floor(audioRef.current?.duration || 0)}s</span>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
