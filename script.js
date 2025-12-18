// Firebase設定
const ADMIN_KEY = "saezure_nanopi"; 
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
const adminKey = prompt("管理者キーを入力（一般閲覧なら空欄でOK）");

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
      likeBtn.onclick = () => {
        db.collection("posts").doc(doc.id).update({
          likes: p.likes + 1
        });
      };

      card.append(txt, time, likeBtn);

      // 🔥 管理者だけ削除できる
      if (adminKey === ADMIN_KEY) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.onclick = () => {
          db.collection("posts").doc(doc.id).delete();
        };
        card.append(delBtn);
      }

      timeline.append(card);
    });
  });
