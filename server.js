import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const upload = multer({ dest:"uploads/" });


// 🔥 Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


// 🎤 GET VOICE ID
async function getVoiceId() {
  const doc = await db.collection("voiceProfile").doc("main").get();

  if (!doc.exists || !doc.data()?.voiceId) {
    throw new Error("voiceId missing");
  }

  return doc.data().voiceId;
}


// 🔊 TEXT TO SPEECH
app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    const voiceId = await getVoiceId();

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method:"POST",
        headers:{
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          text,
          model_id:"eleven_multilingual_v2"
        })
      }
    );

    const audio = await response.arrayBuffer();
    const base64 = Buffer.from(audio).toString("base64");

    res.json({
      audio:`data:audio/mp3;base64,${base64}`
    });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});


// 🎙 UPLOAD RECORDED VOICE
app.post("/upload-voice", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const fileName = `voices/${Date.now()}_${req.file.filename}`;

    await bucket.upload(filePath, {
      destination: fileName,
      metadata: { contentType: req.file.mimetype }
    });

    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      action:"read",
      expires:"03-01-2030"
    });

    await db.collection("voiceRecords").add({
      url,
      createdAt: new Date()
    });

    fs.unlinkSync(filePath);

    res.json({ success:true, url });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("RUN ON " + PORT));
