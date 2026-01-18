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

// DOM
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const timeline = document.getElementById("timeline");

let unsubscribe = null;

// 投稿
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  await db.collection("posts").add({
    text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });
});

// タイムライン読み込み
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
      time.textContent = p.createdAt
        ? new Date(p.createdAt.toDate()).toLocaleString()
        : "";

      const likeBtn = document.createElement("span");
      likeBtn.textContent = `
