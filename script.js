// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyD3I5n7DTJgLG8dmuBwahc_TdwPb8FzcMk",
  authDomain: "saezuri-218c7.firebaseapp.com",
  projectId: "saezuri-218c7",
  storageBucket: "saezuri-218c7.firebasestorage.app",
  messagingSenderId: "161963958344",
  appId: "1:161963958344:web:7a3b043941ac227608f87d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 投稿
document.getElementById("post-btn").onclick = async () => {
  const input = document.getElementById("post-input");
  const text = input.value.trim();
  if (!text) return;

  await db.collection("posts").add({
    text,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  input.value = "";
};

// 表示
db.collection("posts")
  .orderBy("time", "desc")
  .onSnapshot(snapshot => {
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();

      const card = document.createElement("div");
      card.className = "post";

      const p = document.createElement("p");
      p.textContent = d.text;

      const like = document.createElement("button");
      like.textContent = `♡ ${d.likes || 0}`;
      like.onclick = () => {
        db.collection("posts").doc(doc.id).update({
          likes: (d.likes || 0) + 1
        });
      };

      card.append(p, like);
      timeline.append(card);
    });
  });
