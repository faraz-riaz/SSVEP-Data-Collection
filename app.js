const express = require('express');
const fs = require('fs');
const { Neurosity } = require('@neurosity/sdk');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

const neurosity = new Neurosity({
  deviceId: process.env.DEVICE_ID
});

let alphaData = [];
let betaData = [];
let gammaData = [];
let isRecordingBox = false;
let boxIndex = "raw"; // Initial target is "raw"
let subscription; // Reference to the subscription

// Serve static files from the "public" directory
app.use(express.static('public'));

// Function to start recording brainwaves
const startRecording = () => {
  subscription = neurosity.brainwaves("powerByBand").subscribe(brainwaves => {
    let timestamp = brainwaves.timestamp;
    let alpha = brainwaves.data.alpha;
    let beta = brainwaves.data.beta;
    let gamma = brainwaves.data.gamma;

    alphaData.push(`\n${timestamp},${alpha[0]},${alpha[1]},${alpha[2]},${alpha[3]},${alpha[4]},${alpha[5]},${alpha[6]},${alpha[7]}, ${boxIndex}`);
    betaData.push(`\n${timestamp},${beta[0]},${beta[1]},${beta[2]},${beta[3]},${beta[4]},${beta[5]},${beta[6]},${beta[7]}, ${boxIndex}`);
    gammaData.push(`\n${timestamp},${gamma[0]},${gamma[1]},${gamma[2]},${gamma[3]},${gamma[4]},${gamma[5]},${gamma[6]},${gamma[7]}, ${boxIndex}`);
  });
};

// Function to stop recording and write data to files
const stopRecording = () => {
  if (subscription) {
    subscription.unsubscribe(); // Unsubscribe from the brainwaves
  }

  console.log("Writing alpha data to file...");
  fs.appendFile("data/alpha.csv", alphaData.join(''), (err) => {
    if (err) {
      console.error("Error writing to alpha.csv file", err);
    } else {
      console.log("alpha.csv file updated successfully");
    }
  });

  console.log("Writing beta data to file...");
  fs.appendFile("data/beta.csv", betaData.join(''), (err) => {
    if (err) {
      console.error("Error writing to beta.csv file", err);
    } else {
      console.log("beta.csv file updated successfully");
    }
  });

  console.log("Writing gamma data to file...");
  fs.appendFile("data/gamma.csv", gammaData.join(''), (err) => {
    if (err) {
      console.error("Error writing to gamma.csv file", err);
    } else {
      console.log("gamma.csv file updated successfully");
    }
  });
};

// Endpoint to start training
app.post('/start-training/:boxIndex', (req, res) => {
  boxIndex = req.params.boxIndex;
  isRecordingBox = true;
  console.log(`Started training for box ${boxIndex}`);
  res.sendStatus(200);
});

// Endpoint to stop training
app.post('/stop-training', (req, res) => {
  isRecordingBox = false;
  boxIndex = "raw";
  console.log("Stopped training, now recording raw data");
  res.sendStatus(200);
});

// Endpoint to stop recording and save data
app.post('/stop-recording', (req, res) => {
  stopRecording();
  console.log("Stopped recording and saved data");
  res.sendStatus(200);
});

// Function to log in and start recording
const loginAndStartRecording = async () => {
  try {
    await neurosity.login({
      email: process.env.EMAIL,
      password: process.env.PASSWORD
    });

    console.log("Logged in and started recording brainwaves");
    startRecording();
  } catch (error) {
    console.error("Error logging in or collecting data:", error);
  }
};

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  let cols = ['CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4'];

  fs.writeFile("data/beta.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("Error writing to beta.csv file", err);
    } else {
      console.log("beta.csv file initialized successfully");
    }
  });

  fs.writeFile("data/alpha.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("Error writing to alpha.csv file", err);
    } else {
      console.log("alpha.csv file initialized successfully");
    }
  });

  fs.writeFile("data/gamma.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("Error writing to gamma.csv file", err);
    } else {
      console.log("gamma.csv file initialized successfully");
    }
  });

  // Call the login function when the server starts
  loginAndStartRecording();
});