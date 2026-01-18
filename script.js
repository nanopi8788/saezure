// Firebase設定
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
const postBtn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const timeline = document.getElementById("timeline");

// 投稿処理
postBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  // 仮表示
  const tempCard = document.createElement("div");
  tempCard.className = "post-card";

  const tempText = document.createElement("p");
  tempText.textContent = text;

  const tempTime = document.createElement("small");
  tempTime.textContent = "送信中...";

  tempCard.append(tempText, tempTime);
  timeline.prepend(tempCard);

  input.value = "";

  await db.collection("posts").add({
    text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });
});

// ===== タイムライン =====
let currentSort = "new";
let unsubscribe = null;

function loadTimeline(sortType) {
  if (unsubscribe) unsubscribe();

  let query = db.collection("posts");
  if (sortType === "like") {
    query = query.orderBy("likes", "desc");
  } else {
    query = query.orderBy("createdAt", "desc");
  }

  unsubscribe = query.onSnapshot(snapshot => {
    timeline.innerHTML = "";

    snapshot.forEach(doc => {
      const p = doc.data();

      const card = document.createElement("div");
      card.className = "post-card";

      const txt = document.createElement("p");
      txt.textContent = p.text;

      const time = document.createElement("small");
      time.textContent = p.c
