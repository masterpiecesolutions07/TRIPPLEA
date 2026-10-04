export function readImageFile(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Choose a JPG or PNG photo.");
  if (file.size > 2 * 1024 * 1024) throw new Error("That photo is too large. Choose one under 2 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not open that photo. Try another one."));
    reader.readAsDataURL(file);
  });
}
