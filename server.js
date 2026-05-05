import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

app.use(express.static("."));

// 🔥 Firebase setup
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-key.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🎤 Get VOICE_ID from Firebase
async function getVoiceId() {
  const doc = await db.collection("voiceProfile").doc("main").get();
  return doc.data().voiceId;
}

// 🔊 Text → Voice API
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    const voiceId = await getVoiceId();

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    const audio = await response.arrayBuffer();
    const base64 = Buffer.from(audio).toString("base64");

    res.json({
      audio: `data:audio/mp3;base64,${base64}`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running"));