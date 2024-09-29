const express = require('express');
const path = require('path');
const dataFilePath = path.join(__dirname, 'data', 'data.csv');
const { Neurosity } = require("@neurosity/sdk");
const fs = require('fs');
const app = express();
const port = 3000;
require("dotenv").config();

const deviceId = process.env.DEVICE_ID || "";
const email = process.env.EMAIL || "";
const password = process.env.PASSWORD || "";

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to collect data
app.post('/collect-data', async (req, res) => {
  
  // Login to Neurosity
  const { boxIndex } = req.body;

  try {
    const neurosity = new Neurosity({ deviceId: deviceId });
    await neurosity.login({ email: email, password: password });

    console.log("Recording brainwaves for box", boxIndex);

    let alphaData = [];
    let betaData = [];
    let gammaData = [];

    const subscription = neurosity.brainwaves("powerByBand").subscribe(brainwaves => {
        let timestamp = brainwaves.timestamp;
        let alpha = brainwaves.data.alpha;
        let beta = brainwaves.data.beta;
        let gamma = brainwaves.data.gamma;

        alphaData.push(`\n${timestamp},${alpha[0]},${alpha[1]},${alpha[2]},${alpha[3]},${alpha[4]},${alpha[5]},${alpha[6]},${alpha[7]}, ${boxIndex}`);
        betaData.push(`\n${timestamp},${beta[0]},${beta[1]},${beta[2]},${beta[3]},${beta[4]},${beta[5]},${beta[6]},${beta[7]}, ${boxIndex}`);
        gammaData.push(`\n${timestamp},${gamma[0]},${gamma[1]},${gamma[2]},${gamma[3]},${gamma[4]},${gamma[5]},${gamma[6]},${gamma[7]}, ${boxIndex}`);
    });

    // Unsubscribe after 25 seconds and write to files
    setTimeout(() => {
        subscription.unsubscribe();
        console.log("Unsubscribed from brainwaves");

        fs.appendFile("data/alpha.csv", alphaData.join(''), (err) => {
            if (err) {
                console.error("Error writing to CSV file", err);
            }
        });

        fs.appendFile("data/beta.csv", betaData.join(''), (err) => {
            if (err) {
                console.error("Error writing to CSV file", err);
            }
        });

        fs.appendFile("data/gamma.csv", gammaData.join(''), (err) => {
            if (err) {
                console.error("Error writing to CSV file", err);
            }
        });
    }, 29000);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error logging in or collecting data:", error);
    res.status(500).send("Error logging in or collecting data");
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  let cols = ['CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4'];

  fs.writeFile("data/beta.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("Error writing to CSV file", err);
    }
  });
  
  fs.writeFile("data/alpha.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("data/Error writing to CSV file", err);
    }
  });

  fs.writeFile("data/gamma.csv", "'timestamp', 'CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4', 'Target'", (err) => {
    if (err) {
      console.error("Error writing to CSV file", err);
    }
  });
});