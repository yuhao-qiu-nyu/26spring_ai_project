// Science-themed data (Elements and Concepts)
const scienceTerms = [
  "Oxygen", 
  "Gold", 
  "Hydrogen", 
  "Sodium", 
  "Mercury", 
  "Iron", 
  "Carbon", 
  "Helium", // Chemistry
  "Gravity", 
  "Friction", 
  "Magnetism", 
  "Electricity", 
  "Velocity", 
  "Inertia", 
  "Photon", 
  "Atom" // Physics
];

let secret = "";
let questions = 0;
const maxQuestions = 20;

const log = document.getElementById("log");
const apiKeyInput = document.getElementById("apiKey");
const questionInput = document.getElementById("question");

function write(text) {
  log.textContent += text + "\n";
  log.scrollTop = log.scrollHeight;
}

document.getElementById("start").onclick = () => {
  secret = scienceTerms[Math.floor(Math.random() * scienceTerms.length)];
  questions = 0;
  log.textContent = "";
  write("✅ Lab experiment started!");
  write("Guess the element or physics concept based on its properties.\n");
};

document.getElementById("send").onclick = async () => {
  if (!secret) {
    write("⚠️ Click 'Start New Game' first.");
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    write("⚠️ Paste your Gemini API key first.");
    return;
  }

  const userText = questionInput.value.trim();
  if (!userText) return;

  questionInput.value = "";

  if (userText.toLowerCase().startsWith("guess:")) {
    const guess = userText.slice(6).trim();
    if (guess.toLowerCase() === secret.toLowerCase()) {
      write("🎉 Eureka! Correct! It is " + secret + "!");
      secret = "";
    } else {
      write("❌ Incorrect analysis. Keep experimenting!");
    }
    return;
  }

  questions++;
  if (questions > maxQuestions) {
    write("⏰ Laboratory time out! (20 questions used)");
    write("The secret was: " + secret);
    secret = "";
    return;
  }

  write(`🧑‍🔬 (${questions}/20) ${userText}`);

  // Science Teacher Prompt
  const prompt =
    "You are a middle-school Science teacher playing a 20-question game.\n" +
    "The secret element or concept is: " + secret + "\n" +
    "Student question: " + userText + "\n\n" +
    "Answer in 1–2 short sentences based on its physical or chemical properties.\n" +
    "Do NOT say the name.\n" +
    "If the student is on the right track, give a small scientific hint.\n";

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    apiKey;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await response.json();
    let botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(no response)";

    if (botText.toLowerCase().includes(secret.toLowerCase())) {
      botText = botText.replace(new RegExp(secret, "gi"), "the secret substance");
    }

    write("🤖 " + botText + "\n");
  } catch (error) {
    write("❌ Error connecting to the lab: " + error.message);
  }
};
