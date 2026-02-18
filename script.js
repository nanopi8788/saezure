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
const imageInput = document.getElementById("image-input");
const timeline = document.getElementById("timeline");

let unsubscribe = null;

function cropToWide(imageFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const targetRatio = 1000 / 400;
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

        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 400;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1000, 400);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
    };

    reader.readAsDataURL(imageFile);
  });
}


// 投稿
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text && !imageInput.files[0]) return;

  let imageUrl = null;

  if (imageInput.files[0]) {
    imageUrl = await cropToWide(imageInput.files[0]);
  }

  input.value = "";
  imageInput.value = "";

    await db.collection("posts").add({
  text: text,
  image: imageUrl,
  createdAt: firebase.firestore.FieldValue.serverTimestamp() || new Date(),
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
      txt.textContent = p.text || "";
      card.appendChild(txt);

      // 画像表示
      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.className = "post-image";

        if (Math.random() < 0.30) {
          img.classList.add("weird-shape");
        }

        card.appendChild(img);
      }

      // 時間（null対策）
      const time = document.createElement("small");
      if (p.createdAt && p.createdAt.toDate) {
        time.textContent = new Date(p.createdAt.toDate()).toLocaleString();
      } else {
        time.textContent = "";
      }
      card.appendChild(time);

  // %で変形
  if (Math.random() < 0.30) {
    img.classList.add("weird-shape");
  }
}

      txt.textContent = p.text;

      const time = document.createElement("small");
      time.textContent = p.createdAt
        ? new Date(p.createdAt.toDate()).toLocaleString()
        : "";

      const likeBtn = document.createElement("span");
      likeBtn.className = "like-btn";
      likeBtn.textContent = ` 🩷 ${p.likes}`;
      likeBtn.onclick = () => {
        db.collection("posts").doc(doc.id).update({
          likes: p.likes + 1
        });
      };

      if (img) {
  card.append(txt, img, time, likeBtn);
} else {
  card.append(txt, time, likeBtn);
}

      timeline.append(card);
    });
  });
}

// ソートボタン
document.querySelectorAll(".sort-buttons button").forEach(b => {
  b.addEventListener("click", () => {
    loadTimeline(b.dataset.sort);
  });
});

// 初期表示
loadTimeline("new");
