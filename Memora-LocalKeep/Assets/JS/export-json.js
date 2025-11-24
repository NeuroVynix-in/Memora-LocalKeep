document.addEventListener("DOMContentLoaded", () => {
  const jsonOutput = document.getElementById("jsonOutput");
  const exportBtn = document.getElementById("exportBtn");
  const cardView = document.getElementById("cardView");
  const toggleViewBtn = document.getElementById("toggleViewBtn");

  let isCardView = false;

  // Function to gather and structure localStorage data
  const gatherData = () => {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("category_")) {
        const categoryName = key.replace("category_", "");
        data[categoryName] = JSON.parse(localStorage.getItem(key)) || [];
      }
    });
    return data;
  };

  // Function to render raw JSON
  const renderJSON = () => {
    const data = gatherData();
    jsonOutput.textContent = JSON.stringify(data, null, 2);
  };

  // Function to render card view
  const renderCards = () => {
    const data = gatherData();
    cardView.innerHTML = "";
    for (const category in data) {
      const catCard = document.createElement("div");
      catCard.classList.add("data-card");
      catCard.innerHTML = `<h3>${category}</h3>`;
      data[category].forEach(item => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${item.type.toUpperCase()}:</strong> ${item.title} - ${item.content}`;
        catCard.appendChild(p);
      });
      cardView.appendChild(catCard);
    }
  };

  // Real-time update using storage event and MutationObserver
  const observeChanges = () => {
    renderJSON();
    renderCards();
    window.addEventListener("storage", () => {
      renderJSON();
      renderCards();
    });

    // Fallback for same-tab changes (since storage event doesn’t fire)
    setInterval(() => {
      renderJSON();
      if (isCardView) renderCards();
    }, 1000);
  };

  // Download JSON
  exportBtn.addEventListener("click", () => {
    const data = gatherData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exportsData.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Toggle between views
  toggleViewBtn.addEventListener("click", () => {
    isCardView = !isCardView;
    jsonOutput.classList.toggle("hidden");
    cardView.classList.toggle("hidden");
    toggleViewBtn.innerHTML = isCardView
      ? '<i class="fa-solid fa-eye"></i> Switch to JSON View'
      : '<i class="fa-solid fa-eye"></i> Switch to Card View';
  });

  // Initialize
  observeChanges();
});
