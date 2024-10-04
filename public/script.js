document.getElementById('startButton').addEventListener('click', () => {
    console.log("Logged in and started recording brainwaves");
    document.getElementById('startButton').classList.add('hidden');
    document.getElementById('boxes').classList.remove('hidden');
    startFlickeringAllBoxes();
    startTraining();

});

const boxes = document.querySelectorAll('.box');
const frequencies = [35, 36, 37, 38];
let currentBoxIndex = 0;

const startTraining = () => {
    trainBox(currentBoxIndex);
};

const trainBox = (index) => {
    if (index >= boxes.length) {
        stopRecording();
        showThankYouMessage();
        return;
    }

    highlightBox(index);
    startBoxTraining(index);

    setTimeout(() => {
        stopBoxTraining();
        restAndRecordRawData(() => {
            currentBoxIndex++;
            trainBox(currentBoxIndex);
        });
    }, 30000); // Train for 30 seconds
};

const highlightBox = (index) => {
    boxes.forEach((box, i) => {
        if (i === index) {
            box.classList.add('highlight');
        } else {
            box.classList.remove('highlight');
        }
    });
};

const startBoxTraining = (index) => {
    fetch(`/start-training/${index + 1}`, {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            console.log(`Started training for box ${index + 1}`);
        } else {
            console.error("Failed to start training");
        }
    }).catch(error => {
        console.error("Error:", error);
    });
};

const stopBoxTraining = () => {
    fetch('/stop-training', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            console.log("Stopped training, now recording raw data");
        } else {
            console.error("Failed to stop training");
        }
    }).catch(error => {
        console.error("Error:", error);
    });
};

const restAndRecordRawData = (callback) => {
    document.getElementById('boxes').classList.add('hidden');
    document.getElementById('restMessage').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('restMessage').classList.add('hidden');
        document.getElementById('boxes').classList.remove('hidden');
        callback();
    }, 5000); // Rest for 5 seconds
};

const stopRecording = () => {
    fetch('/stop-recording', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            console.log("Stopped recording and saved data");
        } else {
            console.error("Failed to stop recording");
        }
    }).catch(error => {
        console.error("Error:", error);
    });
};

const startFlickeringAllBoxes = () => {
    boxes.forEach((box, index) => {
        startFlickering(box, frequencies[index]);
    });
};

const startFlickering = (box, frequency) => {
    const interval = 1000 / (2 * frequency);
    box.flickerInterval = setInterval(() => {
        box.style.opacity = box.style.opacity == 0 ? 1 : 0;
    }, interval);
};

const stopFlickering = () => {
    boxes.forEach(box => {
        clearInterval(box.flickerInterval);
        box.style.opacity = 0.5;
    });
};

const showThankYouMessage = () => {
    document.getElementById('boxes').classList.add('hidden');
    document.getElementById('thankYouMessage').classList.remove('hidden');
};