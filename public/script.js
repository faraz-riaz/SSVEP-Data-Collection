document.getElementById('startButton').addEventListener('click', () => {
  const startButton = document.getElementById('startButton');
  const boxes = document.querySelectorAll('.box');
  const message = document.getElementById('message');
  let currentBox = 0;
  let intervalId;

  function highlightBox() {
    boxes.forEach((box, index) => {
      box.style.border = 'none';
    });

    if (currentBox === 4) {
      clearInterval(intervalId);
      boxes.forEach(box => box.style.display = 'none');
      message.textContent = 'Training Complete';
      message.style.display = 'block';
      return
    }

    const currentBoxElement = boxes[currentBox];
    currentBoxElement.style.border = '5px solid green';

    // Collect data using the backend endpoint
    fetch('/collect-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ boxIndex: currentBox })
    });

    message.textContent = currentBox;

    currentBox = (currentBox+1);
  }

  startButton.style.display = 'none';
  document.getElementById('boxes').style.display = 'block';
  highlightBox();
  intervalId = setInterval(highlightBox, 30000); // Change every 30 seconds
});