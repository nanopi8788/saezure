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

  // 即時表示用に仮カード作成
  const tempCard = document.createElement("div");
  tempCard.className = "post-card";
  const tempText = document.createElement("p");
  tempText.textContent = text;
  const tempTime = document.createElement("small");
  tempTime.textContent = "送信中...";
  tempCard.append(tempText, tempTime);
  timeline.prepend(tempCard);

  input.value = "";

  // Firestore に保存
  const docRef = await db.collection("posts").add({
    text: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  // 保存後に Firestore データで上書き
  const docSnap = await docRef.get();
  const p = docSnap.data();
  tempTime.textContent = new Date(p.createdAt.toDate()).toLocaleString();
});

// タイムライン更新
db.collection("posts")
  .orderBy("createdAt", "desc")
  .onSnapshot((snapshot) => {
    timeline.innerHTML = "";

    snapshot.forEach((doc) => {
      const p = doc.data();
      const card = document.createElement("div");
      card.className = "post-card";

      const txt = document.createElement("p");
      txt.textContent = p.text;

      const time = document.createElement("small");
      time.textContent = p.createdAt ? new Date(p.createdAt.toDate()).toLocaleString() : "送信中...";

      const likeBtn = document.createElement("span");
      likeBtn.className = "like-btn";
      likeBtn.textContent = ` ❤️ ${p.likes}`;
      likeBtn.onclick = () => {
        db.collection("posts").doc(doc.id).update({
          likes: p.likes + 1
        });
      };

      card.append(txt, time, likeBtn);
      timeline.append(card);
    });
  });
