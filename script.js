const postButton = document.getElementById("postButton");
const postInput = document.getElementById("postInput");
const timeline = document.getElementById("timeline");

postButton.addEventListener("click", () => {
  const text = postInput.value.trim();
  if (text === "") return;

  const post = document.createElement("div");
  post.className = "post";

  const postText = document.createElement("div");
  postText.className = "post-text";
  postText.textContent = text;

  const postTime = document.createElement("div");
  postTime.className = "post-time";
  postTime.textContent = formatTime(new Date());

  post.appendChild(postText);
  post.appendChild(postTime);

  timeline.prepend(post);
  postInput.value = "";
});

function formatTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${y}/${m}/${d} ${h}:${min}`;
}
