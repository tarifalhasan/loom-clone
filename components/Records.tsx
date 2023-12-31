"use client";

import React, { useRef, useState } from "react";

const Recorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = () => {
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
      setMediaStream(null);

      // Assuming you have a function to send the recording data to the server
      sendRecordingData();
    }
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      console.log("Screen sharing stream:", screenStream);
      const combinedStream = new MediaStream([
        ...(mediaStream?.getTracks() || []),
        ...screenStream.getTracks(),
      ]);
      setMediaStream(combinedStream);
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing screen share:", error);
    }
  };

  const sendRecordingData = async () => {
    try {
      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(mediaStream!); // Non-null assertion

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const formData = new FormData();
        formData.append("video", blob, "recording.webm");

        // Send the FormData to your Next.js server
        const response = await fetch("/api/uploadRecording", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Recording uploaded successfully!");
          // Handle success, e.g., redirect or update UI
        } else {
          console.error("Failed to upload recording:", response.status);
          // Handle error, e.g., show error message
        }
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds (adjust as needed)
    } catch (error) {
      console.error("Error sending recording data:", error);
    }
  };

  return (
    <div>
      <video ref={videoRef} width="400" height="300" />
      <div className="flex items-center justify-center gap-x-4">
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
        <button onClick={handleScreenShare}>Share Screen</button>
      </div>
    </div>
  );
};

export default Recorder;
