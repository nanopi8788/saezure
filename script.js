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
const checkMark = document.getElementById("image-selected-check");

imageInput.addEventListener("change", () => {
  checkMark.style.display = imageInput.files.length > 0 ? "inline" : "none";
});

imageBtn.addEventListener("click", () => imageInput.click());

let unsubscribe = null;

// 2.5:1トリミング＋SVGマスク
function cropToWide(imageFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 乱数でマスク種類を決定
        const r = Math.random();
        let maskSrc = null;
        if (r < 0.05) {
          maskSrc = "https://nanopi8788.github.io/saezure/weird.svg"; // 5%
        } else if (r < 0.95) {
          maskSrc = "https://nanopi8788.github.io/saezure/hato.svg"; // 90%
          // 残り5%はマスクなし


        
        // else 0.65 → マスクなし

        if (maskSrc) {
          // マスクあり → 元画像比率維持で切り抜く
          canvas.width = 1000;
          canvas.height = 400;
          
          const maskImg = new Image();
          maskImg.crossOrigin = "anonymous";
          maskImg.src = maskSrc;

          maskImg.onload = () => {
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext("2d");
            maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.restore();

            resolve(canvas.toDataURL("image/png"));
          };
        } else {
          // マスクなし → 2.5:1横長トリミング
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

          canvas.width = 1000;
          canvas.height = 400;

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        }
      };
    };
    reader.readAsDataURL(imageFile);
  });
}

// 投稿処理
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

  // 投稿後にフォームをリセット
  input.value = "";
  imageInput.value = "";
  checkMark.style.display = "none";  // ←ここでチェックマークを消す
});

// タイムライン
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
      if (p.createdAt && p.createdAt.toDate) time.textContent = new Date(p.createdAt.toDate()).toLocaleString();
      card.appendChild(time);

      const likeBtn = document.createElement("span");
      likeBtn.className = "like-btn";
      likeBtn.textContent = ` 🩷 ${p.likes || 0}`;
      likeBtn.onclick = () => db.collection("posts").doc(doc.id).update({ likes: (p.likes || 0) + 1 });
      card.appendChild(likeBtn);

      timeline.appendChild(card);
    });
  });
}

// ソートボタン
document.querySelectorAll(".sort-buttons button").forEach(b => {
  b.addEventListener("click", () => loadTimeline(b.dataset.sort));
});

// 初期表示
loadTimeline("new");
