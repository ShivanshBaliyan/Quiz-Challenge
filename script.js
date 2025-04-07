const wrapper = document.querySelector(".wrapper"),
      form = document.querySelector("form"),
      fileInp = form.querySelector("input"),
      infoText = form.querySelector("p"),
      closeBtn = document.querySelector(".close"),
      copyBtn = document.querySelector(".copy"),
      image = form.querySelector("img"),
      textarea = document.querySelector("textarea"),
      details = document.querySelector(".details");

function showLoading() {
  infoText.innerHTML = `<span class="spinner"></span> Scanning QR Code...`;
}

function hideLoading() {
  infoText.innerText = "Upload QR Code to Read";
}

async function fetchRequest(file, formData) {
  showLoading();

  try {
    const res = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
      method: 'POST',
      body: formData
    });

    const resultData = await res.json();
    const symbols = resultData[0]?.symbol;

    if (!symbols || symbols.length === 0 || !symbols[0].data) {
      infoText.innerText = "❌ Couldn't scan QR Code";
      return;
    }

    const results = symbols
      .map(s => s.data)
      .filter(Boolean)
      .join("\n\n---\n\n");

    textarea.value = results;
    image.src = URL.createObjectURL(file);
    image.style.display = "block";
    wrapper.classList.add("active");
    details.style.display = "flex";
    infoText.innerText = "✅ QR Code Scanned!";
  } catch (err) {
    console.error(err);
    infoText.innerText = "⚠️ Error scanning QR Code";
  }
}

fileInp.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  fetchRequest(file, formData);
});

copyBtn.addEventListener("click", () => {
  const text = textarea.value;
  if (text) {
    navigator.clipboard.writeText(text);
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy Text", 2000);
  }
});

form.addEventListener("click", () => fileInp.click());
closeBtn.addEventListener("click", () => {
  wrapper.classList.remove("active");
  details.style.display = "none";
  image.style.display = "none";
  textarea.value = "";
});

// Drag-and-drop support
form.addEventListener("dragover", e => {
  e.preventDefault();
  form.classList.add("dragover");
});

form.addEventListener("dragleave", () => {
  form.classList.remove("dragover");
});

form.addEventListener("drop", e => {
  e.preventDefault();
  form.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  fetchRequest(file, formData);
});