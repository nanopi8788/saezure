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

// キャッシュ（高速化）
firebase.firestore().enablePersistence().catch(()=>{});

// ================= DOM =================
const btn = document.getElementById("post-btn");
const input = document.getElementById("post-input");
const imageInput = document.getElementById("image-input");
const timeline = document.getElementById("timeline");
const imageBtn = document.getElementById("image-select-btn");
const checkMark = document.getElementById("image-selected-check");

if(imageInput){
imageInput.addEventListener("change",()=>{
  if(checkMark){
    checkMark.style.display =
      imageInput.files.length>0 ? "inline":"none";
  }
});
}

if(imageBtn){
  imageBtn.addEventListener("click",()=>imageInput.click());
}

// ================= 状態 =================
let lastDoc=null;
let currentSort="new";
let isLoading=false;

// ================= SVG =================

function drawWeird(ctx){
ctx.moveTo(993.28,309.91);
ctx.bezierCurveTo(973.44,370.43,895.05,391.28,895.05,391.28);
ctx.bezierCurveTo(730.34,420.05,683.7,341.66,683.7,341.66);
ctx.lineTo(304.66,341.66);
ctx.bezierCurveTo(265.96,414.1,174.68,378.37,174.68,378.37);
ctx.bezierCurveTo(41.72,325.78,1.76,199.98,1.76,199.98);
ctx.bezierCurveTo(1.76,199.98,41.71,74.18,174.67,21.6);
ctx.bezierCurveTo(174.67,21.6,265.95,-14.14,304.65,58.31);
ctx.lineTo(683.69,58.31);
ctx.bezierCurveTo(730.33,-20.08,895.04,8.69,895.04,8.69);
ctx.bezierCurveTo(973.43,29.54,993.27,90.06,993.27,90.06);
ctx.bezierCurveTo(1017.08,167.04,936.7,199.98,936.7,199.98);
ctx.bezierCurveTo(1017.08,232.93,993.28,309.91,993.28,309.91);
ctx.closePath();
}

function drawHato(ctx){
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

// ================= 画像処理 =================

function cropToWide(file){

return new Promise((resolve,reject)=>{

const reader=new FileReader();

reader.onload=()=>{

const img=new Image();
img.src=reader.result;

img.onload=()=>{

const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");

canvas.width=1000;
canvas.height=400;

const targetRatio=2.5;
const imgRatio=img.width/img.height;

let sx,sy,sw,sh;

if(imgRatio>targetRatio){

sh=img.height;
sw=sh*targetRatio;
sx=(img.width-sw)/2;
sy=0;

}else{

sw=img.width;
sh=sw/targetRatio;
sx=0;
sy=(img.height-sh)/2;

}

ctx.drawImage(img,sx,sy,sw,sh,0,0,1000,400);

const r=Math.random();

if(r<0.35){

ctx.save();
ctx.globalCompositeOperation="destination-in";
ctx.beginPath();

if(r<0.05) drawWeird(ctx);
else drawHato(ctx);

ctx.fill();
ctx.restore();

}

resolve(canvas.toDataURL("image/jpeg",0.7));

};

img.onerror=reject;

};

reader.onerror=reject;
reader.readAsDataURL(file);

});
}

// ================= 投稿 =================

btn.addEventListener("click",async()=>{

const text=input.value.trim();
const file=imageInput.files[0];

if(!text && !file) return;

if(file && file.size>3*1024*1024){
alert("画像は3MB以下にしてください");
return;
}

let imageUrl=null;

if(file) imageUrl=await cropToWide(file);

await db.collection("posts").add({

text,
image:imageUrl,
createdAt:firebase.firestore.FieldValue.serverTimestamp(),
likes:0

});

input.value="";
imageInput.value="";
if(checkMark) checkMark.style.display="none";

});

// ================= 投稿描画 =================

function renderPost(doc){

const p=doc.data();

const card=document.createElement("div");
card.className="post-card";

const txt=document.createElement("p");
txt.textContent=p.text||"";
card.appendChild(txt);

if(p.image){

const img=document.createElement("img");
img.src=p.image;
img.className="post-image";
img.loading="lazy";

card.appendChild(img);

}

const time=document.createElement("small");

if(p.createdAt?.toDate){
time.textContent=
new Date(p.createdAt.toDate()).toLocaleString();
}

card.appendChild(time);

const likeBtn=document.createElement("span");
likeBtn.className="like-btn";
likeBtn.textContent=` 🩷 ${p.likes||0}`;

likeBtn.onclick=()=>{

// 即表示更新
p.likes=(p.likes||0)+1;
likeBtn.textContent=` 🩷 ${p.likes}`;

// DB更新
db.collection("posts")
.doc(doc.id)
.update({
likes:firebase.firestore.FieldValue.increment(1)
});

};

card.appendChild(likeBtn);

timeline.appendChild(card);

}

// ================= タイムライン =================

function loadTimeline(sortType){

currentSort=sortType;
timeline.innerHTML="";
lastDoc=null;

let query=db.collection("posts");

query=
sortType==="like"
? query.orderBy("likes","desc")
: query.orderBy("createdAt","desc");

query.limit(10).get().then(snapshot=>{

if(!snapshot.empty){
lastDoc=snapshot.docs[snapshot.docs.length-1];
}

snapshot.forEach(renderPost);

});

}

// ================= 追加読み込み =================

function loadMore(){

if(!lastDoc || isLoading) return;

isLoading=true;

let query=db.collection("posts");

query=
currentSort==="like"
? query.orderBy("likes","desc")
: query.orderBy("createdAt","desc");

query.startAfter(lastDoc)
.limit(10)
.get()
.then(snapshot=>{

if(!snapshot.empty){
lastDoc=snapshot.docs[snapshot.docs.length-1];
}

snapshot.forEach(renderPost);

isLoading=false;

});

}

// ================= 無限スクロール =================

window.addEventListener("scroll",()=>{

if(
window.innerHeight+window.scrollY
>=document.body.offsetHeight-200
){
loadMore();
}

});

// ================= ソート =================

document.querySelectorAll(".sort-buttons button")
.forEach(b=>{
b.addEventListener(
"click",
()=>loadTimeline(b.dataset.sort)
);
});

// ================= 初期表示 =================

loadTimeline("new");
