// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 ここに「Firebase設定をそのまま全部貼る」
const firebaseConfig = {
  apiKey: "AIzaSyD3I5n7DTJgLG8dmuBwahc_TdwPb8FzcMk",
  authDomain: "saezuri-218c7.firebaseapp.com",
  projectId: "saezuri-218c7",
  storageBucket: "saezuri-218c7.firebasestorage.app",
  messagingSenderId: "161963958344",
  appId: "1:161963958344:web:7a3b043941ac227608f87d"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const input = document.getElementById("post-input");
const btn = document.getElementById("post-btn");
const timeline = document.getElementById("timeline");
const count = document.getElementById("char-count");

// 文字数カウント
input.addEventListener("input", () => {
  count.textContent = `${input.value.length} / 140`;
});

// 投稿
btn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "posts"), {
    text,
    likes: 0,
    createdAt: serverTimestamp()
  });

  input.value = "";
  count.textContent = "0 / 140";
};

// タイムライン表示
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  timeline.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "post";

    const time = data.createdAt
      ? new Date(data.createdAt.seconds * 1000).toLocaleString()
      : "";

    div.innerHTML = `
      <div>${data.text}</div>
      <div class="time">${time}</div>
      <div class="like">❤️ ${data.likes}</div>
    `;

    // いいね（回数制限なし）
    div.querySelector(".like").onclick = async () => {
      await updateDoc(doc(db, "posts", docSnap.id), {
        likes: data.likes + 1
      });
    };

    timeline.appendChild(div);
  });
});
