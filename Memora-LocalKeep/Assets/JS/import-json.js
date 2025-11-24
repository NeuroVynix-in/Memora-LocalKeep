const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");
const previewBox = document.getElementById("previewBox");

// Popup elements
const popupContainer = document.getElementById("popupContainer");
const popupMessage = document.getElementById("popupMessage");
const popupConfirmBtn = document.getElementById("popupConfirmBtn");
const popupCancelBtn = document.getElementById("popupCancelBtn");

/**
 * Show popup message
 * @param {string} message - The message to display
 * @param {boolean} confirmMode - true = show Confirm/Cancel, false = info message only
 * @returns {Promise<boolean>} Resolves true if confirmed, false otherwise
 */
function showPopup(message, confirmMode = false) {
  return new Promise((resolve) => {
    popupMessage.textContent = message;
    popupContainer.classList.remove("hidden");

    if (confirmMode) {
      popupConfirmBtn.style.display = "inline-block";
      popupCancelBtn.style.display = "inline-block";
    } else {
      popupConfirmBtn.style.display = "none";
      popupCancelBtn.style.display = "none";

      // Auto-close info popup after 2.5 seconds
      setTimeout(() => {
        popupContainer.classList.add("hidden");
        resolve(false);
      }, 2500);
    }

    // Confirm button
    popupConfirmBtn.onclick = () => {
      popupContainer.classList.add("hidden");
      resolve(true);
    };

    // Cancel button
    popupCancelBtn.onclick = () => {
      popupContainer.classList.add("hidden");
      resolve(false);
    };
  });
}

importBtn.addEventListener("click", async () => {
  const file = importFile.files[0];
  if (!file) {
    await showPopup("⚠️ Please select a JSON file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      previewBox.textContent = JSON.stringify(importedData, null, 2);

      const confirmImport = await showPopup(
        "Do you want to import this data into your local storage?",
        true
      );

      if (confirmImport) {
        Object.keys(importedData).forEach((categoryName) => {
          const dataArray = importedData[categoryName];
          const storageKey = `category_${categoryName}`;
          const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
          const merged = [...existing, ...dataArray];
          localStorage.setItem(storageKey, JSON.stringify(merged));
        });

        await showPopup("✅ Categories imported successfully!");
      }
    } catch (error) {
      await showPopup("❌ Invalid JSON file!");
      console.error(error);
    }
  };

  reader.readAsText(file);
});
