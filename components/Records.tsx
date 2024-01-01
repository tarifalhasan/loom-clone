"use client";
import React, { useRef, useState } from "react";

// Define the Recorder component
const Recorder: React.FC = () => {
  // Create refs and state variables
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Function to start recording with screen sharing
  const startRecording = async () => {
    try {
      // Get screen sharing media stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setMediaStream(stream);

      // Set the video element source and play
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaStream) {
      // Stop all tracks in the media stream
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
      setMediaStream(null);

      // Start downloading the recording
      downloadRecording();
    }
  };

  // Function to download the recorded video
  const downloadRecording = () => {
    if (recordedBlob) {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(recordedBlob);
      downloadLink.download = "recorded_video.webm";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Function to handle screen sharing
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

  // Function to handle recording data
  const handleRecordingData = (event: BlobEvent) => {
    const blob = event.data;
    setRecordedBlob(blob);
  };

  // Function to send recording data to the server
  const sendRecordingData = async () => {
    try {
      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(mediaStream!); // Non-null assertion

      // Event handler when data is available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      // Event handler when recording stops
      mediaRecorder.onstop = async () => {
        handleRecordingData(
          new BlobEvent("dataavailable", {
            data: new Blob(recordedChunks, { type: "video/webm" }),
          })
        );

        // Send the FormData to your server
        const formData = new FormData();
        formData.append("video", recordedBlob || new Blob());
        const response = await fetch("/api/uploadRecording", {
          method: "POST",
          body: formData,
        });

        // Handle the server response
        if (response.ok) {
          console.log("Recording uploaded successfully!");
          // Handle success, e.g., redirect or update UI
        } else {
          console.error("Failed to upload recording:", response.status);
          // Handle error, e.g., show error message
        }
      };

      // Start recording and stop after 5 seconds (adjust as needed)
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch (error) {
      console.error("Error sending recording data:", error);
    }
  };

  // Render the component
  return (
    <div>
      <video ref={videoRef} className="overflow-hidden w-full h-full" />
      <div className="flex items-center justify-center gap-x-4">
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
        <button onClick={handleScreenShare}>Share Screen</button>
      </div>
    </div>
  );
};

// Export the Recorder component
export default Recorder;
