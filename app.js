let token = "";

async function register() {
  await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: u.value,
      password: p.value
    })
  });

  alert("Kayıt başarılı");
}

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: u.value,
      password: p.value
    })
  });

  const data = await res.json();
  token = data.token;

  loadPosts();
}

async function createPost() {
  await fetch("/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ text: t.value })
  });

  loadPosts();
}

async function loadPosts() {
  const res = await fetch("/posts");
  const posts = await res.json();

  feed.innerHTML = posts.map(p => `
    <div style="border:1px solid #ccc; margin:10px; padding:10px">
      <b>${p.username}</b>
      <p>${p.text}</p>
      ❤️ ${p.likes}
      <button onclick="like(${p.id})">Like</button>
    </div>
  `).join("");
}

async function like(id) {
  await fetch("/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ postId: id })
  });

  loadPosts();
}
