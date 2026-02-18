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

// DOM
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const imageInput = document.getElementById("image-input");
const timeline = document.getElementById("timeline");
const imageBtn = document.getElementById("image-select-btn");

imageBtn.addEventListener("click", () => imageInput.click());

let unsubscribe = null;

/* =========================
   2.5:1トリミング＋SVGマスク（確率付き）
========================= */
function cropToWide(imageFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const targetRatio = 2.5;
        const imgRatio = img.width / img.height;

        let sx, sy, sw, sh;

        if (imgRatio > targetRatio) {
          // 横長
          sh = img.height;
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // 縦長
          sw = img.width;
          sh = sw / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        // デフォルトの細長い canvas
        let canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");

        // 90%の確率でマスクをかける
        if (Math.random() < 0.9) {
          const maskImg = new Image();
          maskImg.crossOrigin = "anonymous";
          maskImg.src = "https://nanopi8788.github.io/saezure/weird.svg";
          maskImg.onload = () => {
            // マスクに合わせた canvas に切り替える
            canvas = document.createElement("canvas");
            canvas.width = maskImg.width;
            canvas.height = maskImg.height;
            const ctx = canvas.getContext("2d");

            // 画像を canvas に描画
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

            // マスク適用
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

            resolve(canvas.toDataURL("image/png"));
          };
        } else {
          // マスクなし（通常投稿）
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        }
      };
    };

    reader.readAsDataURL(imageFile);
  });
}


/* =========================
   投稿処理
========================= */
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  const file = imageInput.files[0];
  if (!text && !file) return;

  let imageUrl = null;
  if (file) imageUrl = await cropToWide(file);

  await db.collection("posts").add({
    text,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  input.value = "";
  imageInput.value = "";
});

/* =========================
   タイムライン
========================= */
function loadTimeline(sortType) {
  if (unsubscribe) unsubscribe();

  let query = db.collection("posts");
  if (sortType === "like") query = query.orderBy("likes", "desc");
  else query = query.orderBy("createdAt", "desc");

  unsubscribe = query.onSnapshot(snapshot => {
    timeline.innerHTML = "";

    snapshot.forEach(doc => {
      const p = doc.data();
      const card = document.createElement("div");
      card.className = "post-card";

      // テキスト
      const txt = document.createElement("p");
      txt.textContent = p.text || "";
      card.appendChild(txt);

      // 画像
      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.className = "post-image";
        card.appendChild(img);
      }

      // 時刻
      const time = document.createElement("small");
      if (p.createdAt && p.createdAt.toDate) time.textContent = new Date(p.createdAt.toDate()).toLocaleString();
      card.appendChild(time);

      // いいね
      const likeBtn = document.createElement("span");
      likeBtn.className = "like-btn";
      likeBtn.textContent = ` 🩷 ${p.likes || 0}`;
      likeBtn.onclick = () => {
        db.collection("posts").doc(doc.id).update({ likes: (p.likes || 0) + 1 });
      };
      card.appendChild(likeBtn);

      timeline.appendChild(card);
    });
  });
}

/* =========================
   ソートボタン
========================= */
document.querySelectorAll(".sort-buttons button").forEach(b => {
  b.addEventListener("click", () => loadTimeline(b.dataset.sort));
});

/* 初期表示 */
loadTimeline("new");
