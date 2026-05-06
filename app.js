// 🔥 Firebase (optional login only)
function login() {
  alert("Login system can be added with Firebase Auth");
}


// 🎤 TEXT TO SPEECH
async function speak() {
  const text = document.getElementById("text").value;

  const res = await fetch("/tts", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  if (!data.audio) return alert("Error");

  document.getElementById("audio").src = data.audio;
}


// 🎙 RECORD VOICE
let recorder;
let chunks = [];

async function startRecord() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio:true });

  recorder = new MediaRecorder(stream);
  chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.start();

  document.getElementById("status").innerText = "Recording...";
}


// ⏹ STOP + UPLOAD
function stopRecord() {
  recorder.stop();

  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type:"audio/webm" });

    document.getElementById("preview").src =
      URL.createObjectURL(blob);

    await uploadVoice(blob);
  };
}


// ☁️ UPLOAD
async function uploadVoice(blob) {
  const file = new File([blob], "voice.webm");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/upload-voice", {
    method:"POST",
    body: formData
  });

  const data = await res.json();

  document.getElementById("status").innerText =
    "Uploaded ✔ " + data.url;
}
