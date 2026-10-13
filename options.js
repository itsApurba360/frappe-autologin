const DEFAULTS = { user: "Administrator", passwords: [] };
const $ = (id) => document.getElementById(id);

chrome.storage.local.get(DEFAULTS).then(({ user, passwords }) => {
  $("user").value = user;
  $("passwords").value = passwords.join("\n");
});

$("save").addEventListener("click", async () => {
  const passwords = $("passwords").value.split("\n").map((p) => p.trim()).filter(Boolean);
  await chrome.storage.local.set({ user: $("user").value.trim(), passwords });
  $("status").textContent = "Saved";
  setTimeout(() => ($("status").textContent = ""), 1500);
});
