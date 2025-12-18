// Firebase読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase設定
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

// HTML要素
const input = document.getElementById("post-input");
const button = document.getElementById("post-btn");
const timeline = document.getElementById("timeline");

// 投稿処理（140字制限）
button.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text || text.length > 140) return;

  await addDoc(collection(db, "posts"), {
    text: text,
    createdAt: serverTimestamp(),
    likes: 0
  });

  input.value = "";
});

// リアルタイムで投稿を取得
const q = query(
  collection(db, "posts"),
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {
  timeline.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();

    const card = document.createElement("div");
    card.className = "post-card";

    const textEl = document.createElement("p");
    textEl.textContent = data.text;

    const timeEl = document.createElement("small");
    if (data.createdAt) {
      timeEl.textContent =
        new Date(data.createdAt.seconds * 1000).toLocaleString();
    }

    card.appendChild(textEl);
    card.appendChild(timeEl);
    timeline.appendChild(card);
  });
});

