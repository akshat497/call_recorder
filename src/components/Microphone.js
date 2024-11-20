import React, { useState } from "react";

const Microphone = ({ onStop }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(true);
    // Logic to start recording
  };

  const handleStop = () => {
    setIsRecording(false);
    // Logic to stop recording
    onStop(); // Trigger callback after stopping
  };

  return (
    <div className="d-flex justify-content-center my-3">
      <button
        onClick={isRecording ? handleStop : handleRecord}
        className={`btn ${isRecording ? "btn-danger" : "btn-success"} btn-lg`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default Microphone;
