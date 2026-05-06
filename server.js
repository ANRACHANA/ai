import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

// 🔥 Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🎤 Get Voice ID safely
async function getVoiceId() {
  const doc = await db.collection("voiceProfile").doc("main").get();

  if (!doc.exists || !doc.data()?.voiceId) {
    throw new Error("voiceId missing in Firestore");
  }

  return doc.data().voiceId;
}

// 🔊 TTS API (FIXED)
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

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

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const audio = await response.arrayBuffer();
    const base64 = Buffer.from(audio).toString("base64");

    res.json({
      audio: `data:audio/mp3;base64,${base64}`
    });

  } catch (err) {
    console.error("TTS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 PORT FIX
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
