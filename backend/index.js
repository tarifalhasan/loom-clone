// server.js

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const port = 4000;

// Connect to MongoDB (Make sure MongoDB is running)
mongoose.connect(
  "mongodb+srv://tarifalhasan999:tLarzp43q2Y8alnp@chat-app.yhoyhge.mongodb.net/recording_files",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define the schema for the recordings
const recordingSchema = new mongoose.Schema({
  video: {
    data: Buffer,
    contentType: String,
  },
});

const Recording = mongoose.model("Recording", recordingSchema);

// Set up multer storage to save the recording file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint for handling the file upload
app.post("/api/uploadRecording", upload.single("video"), async (req, res) => {
  try {
    const newRecording = new Recording();
    newRecording.video.data = req.file.buffer;
    newRecording.video.contentType = req.file.mimetype;

    await newRecording.save();

    console.log("Recording saved to MongoDB!");

    res.status(200).send("Recording uploaded successfully!");
  } catch (error) {
    console.error("Failed to upload recording to MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", async (req, res) => {
  res.send(200, {
    message: "Recording saved successfully",
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
