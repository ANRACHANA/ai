// 🔥 Firebase Config
const firebaseConfig = {
   apiKey: "AIzaSyD-ujf42Fi33YZp2pJ-lrOgJMHpu-byLdk",
  authDomain: "ai-voice-to-text-khmer.firebaseapp.com",
  projectId: "ai-voice-to-text-khmer"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => alert("Login success"))
    .catch(err => alert(err.message));
}


// 🆕 SIGNUP
function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Signup success"))
    .catch(err => alert(err.message));
}


// 🎤 SPEAK (FULL FIXED)
async function speak() {
  try {
    const text = document.getElementById("text").value;

    const res = await fetch("/tts", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    console.log("TTS RESPONSE:", data);

    // ❌ FIX undefined crash
    if (!data || !data.audio) {
      alert("Voice API failed");
      return;
    }

    document.getElementById("audio").src = data.audio;

    // 🔥 SAVE TO FIREBASE SAFE
    const user = auth.currentUser;

    if (user) {
      await db.collection("users")
        .doc(user.uid)
        .collection("history")
        .add({
          text: text,
          audio: data.audio,
          createdAt: new Date()
        });
    }

  } catch (err) {
    console.log("ERROR:", err);
  }
}
