// Get elements
const holdButton = document.getElementById("holdButton");
const buttonFill = document.getElementById("buttonFill");
const initialScreen = document.getElementById("initialScreen");
const quizScreen1 = document.getElementById("quizScreen1");
const quizScreen2 = document.getElementById("quizScreen2");
const quizScreen3 = document.getElementById("quizScreen3");
const finalScreen = document.getElementById("finalScreen");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

// Configuration
const HOLD_DURATION = 3000; // 3 seconds in milliseconds
const UPDATE_INTERVAL = 50; // Update every 50ms for smooth animation

// State variables
let holdTimer = null;
let startTime = null;
let isHolding = false;
let currentScreen = "initial";

// Store answers
let answers = {
  question1: "",
  question2: "",
  question3: "",
};

// Confetti setup
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// Confetti particles
let confettiParticles = [];
let confettiAnimationId = null;

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * confettiCanvas.width;
    this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.color = this.getRandomColor();
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
  }

  getRandomColor() {
    const colors = [
      "#ff1744",
      "#ff4569",
      "#00ff88",
      "#00cc66",
      "#ffd700",
      "#ff69b4",
      "#00bfff",
      "#ff6347",
      "#9370db",
      "#32cd32",
      "#ff8c00",
      "#1e90ff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    if (this.y > confettiCanvas.height) {
      this.y = -10;
      this.x = Math.random() * confettiCanvas.width;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
    ctx.restore();
  }
}

function createConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 80; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  confettiAnimationId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// Function to update button fill
function updateButtonFill(progress) {
  buttonFill.style.width = `${progress}%`;
}

// Function to start holding
function startHold() {
  if (isHolding) return;

  isHolding = true;
  startTime = Date.now();

  holdTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

    updateButtonFill(progress);

    if (progress >= 100) {
      completeHold();
    }
  }, UPDATE_INTERVAL);
}

// Function to stop holding
function stopHold() {
  if (!isHolding) return;

  isHolding = false;
  clearInterval(holdTimer);

  // Animate fill back to 0
  const currentWidth = parseFloat(buttonFill.style.width) || 0;
  let width = currentWidth;

  const resetInterval = setInterval(() => {
    width -= 5;
    if (width <= 0) {
      width = 0;
      clearInterval(resetInterval);
    }
    updateButtonFill(width);
  }, 20);
}

// Function to complete hold
function completeHold() {
  clearInterval(holdTimer);
  isHolding = false;

  // Add completed class for animation
  holdButton.classList.add("completed");

  // Show quiz screen after animation
  setTimeout(() => {
    initialScreen.style.display = "none";
    quizScreen1.classList.add("active");
    currentScreen = "quiz1";
    createConfetti();
    animateConfetti();
  }, 500);
}

// Function to switch screens
function switchScreen(fromScreen, toScreen) {
  const from = document.getElementById(fromScreen);
  const to = document.getElementById(toScreen);

  // Fade out current screen
  from.style.animation = "fadeOut 0.3s ease forwards";

  setTimeout(() => {
    from.classList.remove("active");
    from.style.display = "none";
    from.style.animation = "";

    // Fade in next screen
    to.classList.add("active");
    to.style.display = "block";

    // Stop confetti on second screen onwards
    if (
      toScreen === "quizScreen2" ||
      toScreen === "quizScreen3" ||
      toScreen === "finalScreen"
    ) {
      stopConfetti();
    }
  }, 300);
}

// Event listeners for desktop (mouse)
holdButton.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startHold();
});

holdButton.addEventListener("mouseup", () => {
  stopHold();
});

holdButton.addEventListener("mouseleave", () => {
  stopHold();
});

// Event listeners for mobile (touch)
holdButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startHold();
});

holdButton.addEventListener("touchend", () => {
  stopHold();
});

holdButton.addEventListener("touchcancel", () => {
  stopHold();
});

// Prevent context menu on long press
holdButton.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Quiz option selection
function setupQuizButtons() {
  const allOptionButtons = document.querySelectorAll(".option-button");

  allOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get parent quiz container
      const parentContainer = button.closest(".quiz-container");
      const buttonsInContainer =
        parentContainer.querySelectorAll(".option-button");

      // Remove selected class from all buttons in this container
      buttonsInContainer.forEach((btn) => btn.classList.remove("selected"));

      // Add selected class to clicked button
      button.classList.add("selected");

      // Get the selected answer and next screen
      const answer = button.getAttribute("data-answer");
      const nextScreen = button.getAttribute("data-next");

      // Store answer
      if (parentContainer.id === "quizScreen1") {
        answers.question1 = answer;
      } else if (parentContainer.id === "quizScreen2") {
        answers.question2 = answer;
      } else if (parentContainer.id === "quizScreen3") {
        answers.question3 = answer;
      }

      // Handle navigation
      setTimeout(() => {
        if (nextScreen) {
          switchScreen(parentContainer.id, nextScreen);
          currentScreen = nextScreen.replace("Screen", "");
        } else {
          // No next screen defined - end of quiz
          const answerText = button.querySelector(".option-text").textContent;
          const answerEmoji = button.querySelector(".option-emoji").textContent;

          alert(
            `Quiz Complete! 🎉\n\nYour final answer: ${answerText} ${answerEmoji}\n\nAll answers:\nQ1: ${answers.question1}\nQ2: ${answers.question2}\nQ3: ${answer}`,
          );
        }
      }, 500);
    });
  });
}

// Final screen button handlers
yesButton.addEventListener("click", () => {
  // Handle "Ji Haan!" click
  alert("Yay! Let's play the game! 🎮❤️");
  // You can redirect to the game or next page here
  // window.location.href = 'game.html';
});

noButton.addEventListener("click", () => {
  // Handle "Nahi" click - make button run away or show cute message
  alert("Aww... please? 🥺");
  // You can add fun animation like button moving away
});

const nahiPopup = document.getElementById("nahiPopup");
const popupYes = document.getElementById("popupYes");
const popupNo = document.getElementById("popupNo");
const nahiPopup2 = document.getElementById("nahiPopup2");
const popup2Yes = document.getElementById("popup2Yes");
const popup2No = document.getElementById("popup2No");
const nahiPopup3 = document.getElementById("nahiPopup3");
const popup3Yes = document.getElementById("popup3Yes");
const popup3No = document.getElementById("popup3No");
const nahiPopup4 = document.getElementById("nahiPopup4");
const popup4Yes = document.getElementById("popup4Yes");
const popup4No = document.getElementById("popup4No");
const nahiPopup5 = document.getElementById("nahiPopup5");
const popup5Yes = document.getElementById("popup5Yes");

noButton.addEventListener("click", () => {
  nahiPopup.classList.add("active");
});

// Popup YES
popupYes.addEventListener("click", () => {
  nahiPopup.classList.remove("active");
  alert("Hehe 😍 I knew it! ❤️");
});
popup2Yes.addEventListener("click", () => {
  nahiPopup2.classList.remove("active");
  alert("Yesss 🥰 I promise you'll love it ❤️");
  // redirect / next surprise
  // window.location.href = "surprise.html";
});

popup2No.addEventListener("click", () => {
  popup2No.style.position = "absolute";
  popup2No.style.left = Math.random() * 60 + "%";
  popup2No.style.top = Math.random() * 60 + "%";
});
popup3Yes.addEventListener("click", () => {
  nahiPopup3.classList.remove("active");
  alert("Yayyy 🥹❤️ Thank you for trusting me!");
  // final reward / game / surprise page
});

popup3No.addEventListener("click", () => {
  popup3No.style.position = "absolute";
  popup3No.style.left = Math.random() * 60 + "%";
  popup3No.style.top = Math.random() * 60 + "%";
});
popup4Yes.addEventListener("click", () => {
  nahiPopup4.classList.remove("active");
  alert("Thank you 🥹❤️ You saved my heart!");
  // final success / redirect / confetti
});

popup4No.addEventListener("click", () => {
  popup4No.style.position = "absolute";
  popup4No.style.left = Math.random() * 60 + "%";
  popup4No.style.top = Math.random() * 60 + "%";
});
popup5Yes.addEventListener("click", () => {
  nahiPopup5.classList.remove("active");
  alert("Mission successful 😎❤️");
  // final screen / redirect / confetti blast
});

// Popup NO (cute loop 😈)
popupNo.addEventListener("click", () => {
  popupNo.style.position = "absolute";
  popupNo.style.left = Math.random() * 60 + "%";
  popupNo.style.top = Math.random() * 60 + "%";
});
popupNo.addEventListener("click", () => {
  nahiPopup.classList.remove("active");
  setTimeout(() => {
    nahiPopup2.classList.add("active");
  }, 300);
});
popup2No.addEventListener("click", () => {
  nahiPopup2.classList.remove("active");
  setTimeout(() => {
    nahiPopup3.classList.add("active");
  }, 300);
});
popup3No.addEventListener("click", () => {
  nahiPopup3.classList.remove("active");
  setTimeout(() => {
    nahiPopup4.classList.add("active");
  }, 300);
});
popup4No.addEventListener("click", () => {
  nahiPopup4.classList.remove("active");
  setTimeout(() => {
    nahiPopup5.classList.add("active");
  }, 300);
});

// Add these to your element declarations at the top
const gameScreen = document.getElementById("gameScreen");
const gameGrid = document.getElementById("gameGrid");
const foundCountLabel = document.getElementById("foundCount");
const gameStatus = document.getElementById("gameStatus");
const gameNextButton = document.getElementById("gameNextButton");

let ringsFound = 0;
// Randomly assign 3 rings to 9 boxes (0 to 8)
let ringPositions = [];

function initGame() {
  ringsFound = 0;
  foundCountLabel.textContent = "0";
  gameGrid.innerHTML = "";
  gameNextButton.style.display = "none";
  gameStatus.style.visibility = "hidden";

  // Pick 3 random unique indices
  ringPositions = [];
  while (ringPositions.length < 3) {
    let r = Math.floor(Math.random() * 9);
    if (ringPositions.indexOf(r) === -1) ringPositions.push(r);
  }

  // Create 9 boxes
  for (let i = 0; i < 9; i++) {
    const box = document.createElement("div");
    box.classList.add("grid-box");
    box.innerHTML = "🎁"; // Gift emoji
    box.addEventListener("click", () => handleBoxClick(box, i));
    gameGrid.appendChild(box);
  }
}

function handleBoxClick(box, index) {
  if (ringPositions.includes(index)) {
    // Found a ring!
    box.innerHTML = "💍";
    box.classList.add("revealed");
    box.style.background = "rgba(0, 255, 136, 0.2)";
    ringsFound++;
    foundCountLabel.textContent = ringsFound;
    gameStatus.style.visibility = "hidden";

    if (ringsFound === 3) {
      // Game Won! Show Next Button
      gameNextButton.style.display = "inline-block";
      createConfetti();
      animateConfetti();
    }
  } else {
    // Wrong box
    box.innerHTML = "🙈";
    gameStatus.style.visibility = "visible";
    // Shake animation could be added here
  }
}

// UPDATE: Modify your existing yesButton handler to start the game
yesButton.addEventListener("click", () => {
  switchScreen("finalScreen", "gameScreen");
  initGame();
});

// Logic for the New Next Button
gameNextButton.addEventListener("click", () => {
  alert("You found them all! You're amazing. ❤️");
  // Redirect or show final final surprise here
});

// 1. Update the listener for the 'Next Step' button in the game
gameNextButton.addEventListener("click", () => {
  switchScreen("gameScreen", "appreciationScreen");
});

// 2. Add listener for the new "One Last Thing" button
const lastThingButton = document.getElementById("lastThingButton");

lastThingButton.addEventListener("click", () => {
  // Add a final confetti burst or your final message here!
  createConfetti();
  animateConfetti();
  alert("I love you more than words can say! ❤️");
});

// Get new elements
const envelopeScreen = document.getElementById("envelopeScreen");
const waxSeal = document.getElementById("waxSeal");

// 1. Update the "One Last Thing" button to go to the Envelope
lastThingButton.addEventListener("click", () => {
  switchScreen("appreciationScreen", "envelopeScreen");
});

// 2. Add logic for when the Wax Seal is clicked
waxSeal.addEventListener("click", () => {
  // Add an opening animation class
  waxSeal.style.transform = "scale(0.9) translateY(10px)";

  setTimeout(() => {
    // Final Surprise Logic
    alert("Will you be my Valentine forever? 🌹✨");

    // Optional: Trigger a massive confetti burst
    createConfetti();
    animateConfetti();

    // You could also redirect to a final letter page here:
    // window.location.href = "letter.html";
  }, 300);
});

// Get final screen elements
const valentineScreen = document.getElementById("valentineScreen");
const vNoBtn = document.getElementById("vNoBtn");
const vYesBtn = document.getElementById("vYesBtn");

// 1. Update Wax Seal to open the Valentine Card
waxSeal.addEventListener("click", () => {
  // Small click effect
  waxSeal.style.transform = "scale(0.9)";

  setTimeout(() => {
    switchScreen("envelopeScreen", "valentineScreen");
  }, 300);
});

// 2. The Jumping "No" Button Logic
const moveButton = () => {
  // Calculate random position within the card or screen
  // Subtracting button width/height to keep it in view
  const x = Math.random() * (window.innerWidth - vNoBtn.offsetWidth - 20);
  const y = Math.random() * (window.innerHeight - vNoBtn.offsetHeight - 20);

  vNoBtn.style.position = "fixed"; // Moves relative to the whole screen
  vNoBtn.style.left = `${x}px`;
  vNoBtn.style.top = `${y}px`;
};

// Move on hover (for desktop)
vNoBtn.addEventListener("mouseover", moveButton);
// Move on click (for mobile)
vNoBtn.addEventListener("click", moveButton);

// 3. Final Success Message
vYesBtn.addEventListener("click", () => {
  vNoBtn.style.display = "none"; // Hide the No button
  alert("Yay! ❤️ Best Valentine ever! 🌹");
  createConfetti();
  animateConfetti();
});

const successScreen = document.getElementById("successScreen");

// Update your existing YES button listener
vYesBtn.addEventListener("click", () => {
  // 1. Transition to Success Screen
  switchScreen("valentineScreen", "successScreen");

  // 2. Trigger Confetti
  createConfetti();
  animateConfetti();

  // 3. Optional: Add a special sound effect or extra confetti burst
  setTimeout(() => {
    for (let i = 0; i < 100; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
  }, 500);
});

// Clear error on input
document.getElementById("recipientName").addEventListener("input", () => {
  document.getElementById("errorMsg").classList.remove("show");
});

let qrGenerated = false;

function showQR() {
  const qrBox = document.getElementById("qrBox");
  qrBox.classList.remove("hidden");

  if (!qrGenerated) {
    new QRCode(document.getElementById("qrcode"), {
      text: "https://github.com/Vidath19/Task-R.git",
      width: 150,
      height: 150,
    });
    qrGenerated = true;
  }
}
// Initialize quiz buttons
setupQuizButtons();
