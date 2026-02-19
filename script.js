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

// ===== 2.5:1トリミング＋SVGマスク（完全版） =====
function cropToWide(imageFile) {
  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 1000;
        canvas.height = 400;

        // ===== 2.5:1 中央トリミング =====
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

        // ===== 確率制御 =====
        const r = Math.random();
        // 0.00 - 0.05  → WEIRD (5%)
        // 0.95 - 1.00 → なし (5%)

        if (r < 0.35) {

          ctx.globalCompositeOperation = "destination-in";
          ctx.beginPath();

          if (r < 0.05) {
            // ===== WEIRD 5% =====
            ctx.moveTo(849.57,294.05);
            ctx.lineTo(500,400);
            ctx.lineTo(150.43,294.05);
            ctx.bezierCurveTo(-42.42,229.48,8.59,102.84,8.59,102.84);
            ctx.bezierCurveTo(8.59,102.84,22.39,5.7,258.82,0.87);
            ctx.bezierCurveTo(258.82,0.87,414.19,-10.15,500,69.67);
            ctx.bezierCurveTo(585.81,-10.15,741.18,0.87,741.18,0.87);
            ctx.bezierCurveTo(977.61,5.7,991.41,102.84,991.41,102.84);
            ctx.bezierCurveTo(1042.42,229.48,849.57,294.05,849.57,294.05);
            ctx.closePath();
          } else {
            // ===== HATO 90% =====
            ctx.moveTo(849.57,294.05);
            ctx.lineTo(500,400);
            ctx.lineTo(150.43,294.05);
            ctx.bezierCurveTo(-42.42,229.48,8.59,102.84,8.59,102.84);
            ctx.bezierCurveTo(8.59,102.84,22.39,5.7,258.82,0.87);
            ctx.bezierCurveTo(258.82,0.87,414.19,-10.15,500,69.67);
            ctx.bezierCurveTo(577.22,-10.15,732.61,0.87,732.61,0.87);
            ctx.bezierCurveTo(969.02,5.7,991.41,102.84,991.41,102.84);
            ctx.bezierCurveTo(1042.42,229.48,849.57,294.05,849.57,294.05);
            ctx.closePath();
          }

          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }

        resolve(canvas.toDataURL("image/png"));
      };
    };

    reader.readAsDataURL(imageFile);
  });
}

// ===== 投稿処理 =====
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
  checkMark.style.display = "none";
});

// ===== タイムライン =====
function loadTimeline(sortType) {

  if (unsubscribe) unsubscribe();

  let query = db.collection("posts");

  if (sortType === "like")
    query = query.orderBy("likes", "desc");
  else
    query = query.orderBy("createdAt", "desc");

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
      if (p.createdAt?.toDate)
        time.textContent = new Date(p.createdAt.toDate()).toLocaleString();
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
    });

  });
}

// ソートボタン
document.querySelectorAll(".sort-buttons button").forEach(b => {
  b.addEventListener("click", () => loadTimeline(b.dataset.sort));
});

// 初期表示
loadTimeline("new");
