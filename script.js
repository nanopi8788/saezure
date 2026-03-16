// ================= Firebase =================
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
const storage = firebase.storage();

// ================= DOM =================
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const imageInput = document.getElementById("image-input");
const timeline = document.getElementById("timeline");

// ================= 状態 =================
let lastDoc = null;
let currentSort = "new";

// ================= 画像処理 =================

function cropToWide(file) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();
    reader.onload = () => {

      const img = new Image();
      img.src = reader.result;

      img.onload = () => {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 1000;
        canvas.height = 400;

        const targetRatio = 2.5;
        const imgRatio = img.width / img.height;

        let sx, sy, sw, sh;

        if (imgRatio > targetRatio) {
          sh = img.height;
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = sw / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1000, 400);

        canvas.toBlob(resolve, "image/jpeg", 0.9);
      };
    };

    reader.readAsDataURL(file);
  });
}

// ================= 投稿 =================

btn.addEventListener("click", async () => {

  const text = input.value.trim();
  const file = imageInput.files[0];

  if (!text && !file) return;

  let imageUrl = null;

  if (file) {

    const blob = await cropToWide(file);

    const ref = storage.ref("images/" + Date.now() + ".jpg");

    await ref.put(blob);

    imageUrl = await ref.getDownloadURL();
  }

  await db.collection("posts").add({
    text,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  input.value = "";
  imageInput.value = "";

  loadTimeline(currentSort);
});

// ================= 投稿描画 =================

function renderPost(doc) {

  const p = doc.data();

  const card = document.createElement("div");
  card.className = "post-card";

  const txt = document.createElement("p");
  txt.textContent = p.text || "";
  card.appendChild(txt);

  if (p.image) {

    const img = document.createElement("img");
    img.src = p.image;
    img.className = "post-image";

    card.appendChild(img);
  }

  const time = document.createElement("small");

  if (p.createdAt?.toDate)
    time.textContent =
      new Date(p.createdAt.toDate()).toLocaleString();

  card.appendChild(time);

  const likeBtn = document.createElement("span");
  likeBtn.className = "like-btn";
  likeBtn.textContent = ` 🩷 ${p.likes || 0}`;

  likeBtn.onclick = () =>
    db.collection("posts")
      .doc(doc.id)
      .update({ likes: (p.likes || 0) + 1 });

  card.appendChild(likeBtn);

  timeline.appendChild(card);
}

// ================= タイムライン =================

function loadTimeline(sortType) {

  currentSort = sortType;

  timeline.innerHTML = "";
  lastDoc = null;

  let query = db.collection("posts");

  query =
    sortType === "like"
      ? query.orderBy("likes", "desc")
      : query.orderBy("createdAt", "desc");

  query.limit(10).get().then(snapshot => {

    if (!snapshot.empty)
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach(renderPost);
  });
}

// ================= もっと見る =================

function loadMore() {

  if (!lastDoc) return;

  let query = db.collection("posts");

  query =
    currentSort === "like"
      ? query.orderBy("likes", "desc")
      : query.orderBy("createdAt", "desc");

  query.startAfter(lastDoc).limit(10).get().then(snapshot => {

    if (!snapshot.empty)
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach(renderPost);
  });
}

// ================= ソート =================

document.querySelectorAll(".sort-buttons button").forEach(b => {
  b.addEventListener("click", () => loadTimeline(b.dataset.sort));
});

// ================= 初期表示 =================

loadTimeline("new");
