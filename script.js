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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM取得
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const timeline = document.getElementById("timeline");

// 投稿
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  await db.collection("posts").add({
    text: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  input.value = "";
});

// 表示
db.collection("posts")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
    timeline.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement("div");
      card.className = "post-card";

      const p = document.createElement("p");
      p.textContent = data.text;

      const time = document.createElement("small");
      if (data.createdAt) {
        time.textContent = data.createdAt.toDate().toLocaleString();
      }

      card.appendChild(p);
      card.appendChild(time);
      timeline.appendChild(card);
    });
  });
