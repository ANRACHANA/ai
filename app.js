// 🔥 Firebase Config
const firebaseConfig = {
   apiKey: "AIzaSyD-ujf42Fi33YZp2pJ-lrOgJMHpu-byLdk",
  authDomain: "ai-voice-to-text-khmer.firebaseapp.com",
  projectId: "ai-voice-to-text-khmer"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// 🆕 SIGN UP
function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Signup success"))
    .catch(err => alert(err.message));
}


// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => alert("Login success"))
    .catch(err => {
      console.log(err.code);
      alert(err.message);
    });
}


// 🎤 SPEAK + SAVE
async function speak() {
  const text = document.getElementById("text").value;

  const res = await fetch("/tts", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  document.getElementById("audio").src = data.audio;

  const user = auth.currentUser;

  if (user) {
    await db.collection("users")
      .doc(user.uid)
      .collection("history")
      .add({
        text,
        audio: data.audio,
        createdAt: new Date()
      });
  } else {
    alert("Please login first");
  }
}
