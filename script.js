// Firebase設定（ここに貼る）
const firebaseConfig = {
  apiKey: "AIzaSyD3I5n7DTJgLG8dmuBwahc_TdwPb8FzcMk",
  authDomain: "saezuri-218c7.firebaseapp.com",
  projectId: "saezuri-218c7",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const text = document.getElementById("text");
const count = document.getElementById("count");
const postBtn = document.getElementById("postBtn");
const timeline = document.getElementById("timeline");

// 文字数カウント
text.addEventListener("input", () => {
  count.textContent = `${text.value.length} / 140`;
});

// 投稿
postBtn.onclick = () => {
  if (!text.value.trim()) return;

  db.collection("posts").add({
    text: text.value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  text.value = "";
  count.textContent = "0 / 140";
};

// 日付フォーマット
function formatDate(ts) {
  const d = ts.toDate();
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// タイムライン
let lastDate = "";

db.collection("posts")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
    timeline.innerHTML = "";
    lastDate = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.createdAt) return;

      const dateStr = data.createdAt.toDate().toDateString();
      if (dateStr !== lastDate) {
        const d = document.createElement("div");
        d.textContent = dateStr;
        d.style.textAlign = "center";
        d.style.color = "gray";
        timeline.appendChild(d);
        lastDate = dateStr;
      }

      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <div>${data.text}</div>
        <div class="time">${formatDate(data.createdAt)}</div>
        <div class="like">♡ ${data.likes}</div>
      `;

      div.querySelector(".like").onclick = () => {
        db.collection("posts").doc(doc.id)
          .update({ likes: firebase.firestore.FieldValue.increment(1) });
      };

      timeline.appendChild(div);
    });
  });
