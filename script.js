// ====================
import { initializeApp } from "firebase/app";
// ====================
const firebaseConfig = {
  apiKey: "AIzaSyD3I5n7DTJgLG8dmuBwahc_TdwPb8FzcMk",
  authDomain: "saezuri-218c7.firebaseapp.com",
  projectId: "saezuri-218c7",
  storageBucket: "saezuri-218c7.firebasestorage.app",
  messagingSenderId: "161963958344",
  appId: "1:161963958344:web:7a3b043941ac227608f87d"
};

const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ====================
// 投稿処理
// ====================
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const timeline = document.getElementById("timeline");

btn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  const now = new Date().toISOString();

  await db.collection("posts").add({
    text,
    timestamp: now,
    likes: 0
  });

  input.value = "";
};

// ====================
// 投稿を表示
// ====================
db.collection("posts")
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
    timeline.innerHTML = ""; 
    snapshot.forEach((doc) => {
      const p = doc.data();
      const card = document.createElement("div");
      card.className = "post-card";

      const txt = document.createElement("p");
      txt.textContent = p.text;

      const time = document.createElement("small");
      time.textContent = new Date(p.timestamp).toLocaleString();

      const likeBtn = document.createElement("span");
      likeBtn.className = "like-btn";
      likeBtn.textContent = ` ❤️ ${p.likes}`;

      likeBtn.onclick = async () => {
        await db.collection("posts").doc(doc.id).update({
          likes: p.likes + 1
        });
      };

      card.append(txt, time, likeBtn);
      timeline.append(card);
    });
  });

