document.addEventListener("DOMContentLoaded", () => {
  const categoryNameInput = document.getElementById("categoryName");
  const createCategoryBtn = document.getElementById("createCategoryBtn");
  const categorySelect = document.getElementById("categorySelect");
  const dataTypeSelect = document.getElementById("dataTypeSelect");
  const dataTitleInput = document.getElementById("dataTitle");
  const dataContentInput = document.getElementById("dataContent");
  const addDataBtn = document.getElementById("addDataBtn");
  const categoriesContainer = document.getElementById("categoriesContainer");
  const clearDataBtn = document.getElementById("clearDataBtn"); // make sure this button exists in your HTML footer

  // -----------------------
  // Custom alert (uses your existing DOM element)
  // -----------------------
  function showCustomAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");
    if (!alertBox || !alertMessage) {
      // fallback
      alert(message);
      return;
    }
    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");
    alertBox.classList.add("show");
    setTimeout(() => {
      alertBox.classList.remove("show");
      setTimeout(() => alertBox.classList.add("hidden"), 400);
    }, 2200);
  }

  // -----------------------
  // Load categories and render UI
  // -----------------------
  function loadCategories() {
    // rebuild select and list
    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    categoriesContainer.innerHTML = "";

    // iterate keys
    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("category_")) return;
      const categoryName = key.replace("category_", "");
      // add to select
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = categoryName;
      categorySelect.appendChild(opt);

      // build card
      const card = document.createElement("div");
      card.className = "category-card";
      const categoryData = JSON.parse(localStorage.getItem(key)) || [];

      const actionsHtml = `
        <div style="margin:8px 0;">
          <button class="edit-category" data-key="${key}" style="background:#1e90ff;color:#fff;border:none;padding:6px 10px;border-radius:6px;margin-right:6px;cursor:pointer;">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="delete-category" data-key="${key}" style="background:#ff4d4d;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      `;

      card.innerHTML = `<h3>${escapeHtml(categoryName)}</h3>${actionsHtml}`;

      // data items
      categoryData.forEach((item, idx) => {
        const dataItem = document.createElement("div");
        dataItem.className = "data-item";
        // note: escaping to avoid markup injection
        dataItem.innerHTML = `
          <p><strong>Type:</strong> ${escapeHtml(item.type)}</p>
          <p><strong>Title:</strong> ${escapeHtml(item.title)}</p>
          <p><strong>Content:</strong> ${escapeHtml(item.content)}</p>
          <div style="margin-top:8px;">
          <button class="edit-data" data-key="${key}" data-index="${idx}" style="background:#1e90ff;color:#fff;border:none;padding:6px 10px;border-radius:6px;margin-right:6px;cursor:pointer;">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="delete-data" data-key="${key}" data-index="${idx}" style="background:#ff4d4d;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>

        `;
        card.appendChild(dataItem);
      });

      categoriesContainer.appendChild(card);
    });
  }

  // simple HTML-escape to avoid injecting tags from stored data
  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // -----------------------
  // Create category
  // -----------------------
  createCategoryBtn.addEventListener("click", () => {
    const name = categoryNameInput.value.trim();
    if (!name) {
      showCustomAlert("⚠️ Please enter a category name!");
      return;
    }
    const key = "category_" + name;
    if (localStorage.getItem(key)) {
      showCustomAlert("⚠️ Category already exists!");
      return;
    }
    localStorage.setItem(key, JSON.stringify([]));
    categoryNameInput.value = "";
    showCustomAlert("✅ Category created successfully!");
    loadCategories();
  });

  // -----------------------
  // Add data to selected category
  // -----------------------
  addDataBtn.addEventListener("click", () => {
    const selectedCategoryKey = categorySelect.value;
    const dataType = dataTypeSelect.value;
    const title = dataTitleInput.value.trim();
    const content = dataContentInput.value.trim();

    if (!selectedCategoryKey || !dataType || !title || !content) {
      showCustomAlert("⚠️ Please fill all fields before adding data!");
      return;
    }

    const arr = JSON.parse(localStorage.getItem(selectedCategoryKey)) || [];
    arr.push({ type: dataType, title, content });
    localStorage.setItem(selectedCategoryKey, JSON.stringify(arr));

    // clear inputs
    dataTypeSelect.value = "";
    dataTitleInput.value = "";
    dataContentInput.value = "";
    showCustomAlert("✅ Data added successfully!");
    loadCategories();
  });

  // -----------------------
  // Container click delegation for edit/delete actions
  // -----------------------
  categoriesContainer.addEventListener("click", (e) => {
    const t = e.target;

    // DELETE CATEGORY
    if (t.matches(".delete-category")) {
      const key = t.dataset.key;
      // custom confirm modal:
      showConfirmModal("Delete Category", "This will permanently delete the category and its data. Proceed?", () => {
        localStorage.removeItem(key);
        showCustomAlert("🗑️ Category deleted!");
        loadCategories();
      });
      return;
    }

    // EDIT CATEGORY (open modal to rename)
    if (t.matches(".edit-category")) {
      const key = t.dataset.key;
      const oldName = key.replace("category_", "");
      const modal = buildModal(`
        <h3 style="color:#ffd700; margin-bottom:10px;"><i class="fa-solid fa-pen-to-square"></i> Edit Category Name</h3>
        <input type="text" id="modalEditCategoryName" value="${escapeAttr(oldName)}" />
        <div style="margin-top:10px;">
        <button id="modalSaveCategory" style="background:#ffd700;color:#000;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;margin-right:8px;">
          <i class="fa-solid fa-floppy-disk"></i> Save
          </button>
          <button id="modalCancelCategory" style="background:#ff4d4d;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">
            <i class="fa-solid fa-xmark"></i> Cancel
          </button>
        </div>

      `);

      document.body.appendChild(modal);

      // handlers
      modal.querySelector("#modalCancelCategory").addEventListener("click", () => {
        modal.remove();
        showCustomAlert("❎ Edit cancelled.");
      });

      modal.querySelector("#modalSaveCategory").addEventListener("click", () => {
        const newName = modal.querySelector("#modalEditCategoryName").value.trim();
        if (!newName) {
          showCustomAlert("⚠️ Please enter a valid category name!");
          return;
        }
        const newKey = "category_" + newName;
        if (newKey === key) {
          modal.remove();
          showCustomAlert("No changes made.");
          return;
        }
        if (localStorage.getItem(newKey)) {
          showCustomAlert("⚠️ A category with that name already exists!");
          return;
        }
        const data = localStorage.getItem(key);
        localStorage.setItem(newKey, data);
        localStorage.removeItem(key);
        modal.remove();
        showCustomAlert("✏️ Category renamed!");
        loadCategories();
      });

      return;
    }

    // DELETE DATA ITEM
    if (t.matches(".delete-data")) {
      const key = t.dataset.key;
      const idx = Number(t.dataset.index);
      showConfirmModal("Delete Item", "This will permanently remove this entry. Proceed?", () => {
        const arr = JSON.parse(localStorage.getItem(key)) || [];
        if (idx >= 0 && idx < arr.length) {
          arr.splice(idx, 1);
          localStorage.setItem(key, JSON.stringify(arr));
          showCustomAlert("🗑️ Data deleted!");
          loadCategories();
        }
      });
      return;
    }

    // EDIT DATA ITEM (custom modal)
    if (t.matches(".edit-data")) {
      const key = t.dataset.key;
      const idx = Number(t.dataset.index);
      const arr = JSON.parse(localStorage.getItem(key)) || [];
      const current = arr[idx];
      if (!current) {
        showCustomAlert("⚠️ Item not found.");
        return;
      }

      const modal = buildModal(`
        <h3 style="color:#ffd700; margin-bottom:10px;"><i class="fa-solid fa-pen-to-square"></i> Edit Data</h3>
        <input type="text" id="modalEditTitle" value="${escapeAttr(current.title)}" placeholder="Title" />
        <textarea id="modalEditContent" rows="5" placeholder="Content">${escapeHtml(current.content)}</textarea>
        <div style="margin-top:10px;">
          <button id="modalSaveData" style="background:#ffd700;color:#000;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;margin-right:8px;">
            <i class="fa-solid fa-floppy-disk"></i> Save
          </button>
          <button id="modalCancelData" style="background:#ff4d4d;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">
            <i class="fa-solid fa-xmark"></i> Cancel
          </button>
        </div>

      `);

      document.body.appendChild(modal);

      modal.querySelector("#modalCancelData").addEventListener("click", () => {
        modal.remove();
        showCustomAlert("❎ Edit cancelled.");
      });

      modal.querySelector("#modalSaveData").addEventListener("click", () => {
        const newTitle = modal.querySelector("#modalEditTitle").value.trim();
        const newContent = modal.querySelector("#modalEditContent").value.trim();
        if (!newTitle || !newContent) {
          showCustomAlert("⚠️ Please fill both fields before saving!");
          return;
        }
        arr[idx] = { ...current, title: newTitle, content: newContent };
        localStorage.setItem(key, JSON.stringify(arr));
        modal.remove();
        showCustomAlert("✅ Data updated successfully!");
        loadCategories();
      });

      return;
    }
  });

  // -----------------------
  // Clear all site data (custom confirm)
  // -----------------------
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      showConfirmModal("Clear All Data", "This will permanently delete all categories and their data from this site. This action cannot be undone. Continue?", () => {
        // remove only keys that start with category_ to be safer,
        // but as user asked "including its own data saved in localstorage by our website",
        // we'll clear all localStorage here:
        localStorage.clear();
        sessionStorage.clear();
        showCustomAlert("✅ All data cleared from the website!");
        setTimeout(() => location.reload(), 900);
      });
    });
  }

  // -----------------------
  // Helpers: build a centered modal container for forms & confirmations
  // -----------------------
  function buildModal(innerHtml) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.style.background = "rgba(255,255,255,0.06)";
    wrapper.style.backdropFilter = "blur(10px)";
    wrapper.style.border = "1px solid rgba(255,215,0,0.18)";
    wrapper.style.borderRadius = "12px";
    wrapper.style.padding = "1.2rem";
    wrapper.style.color = "#fff";
    wrapper.style.zIndex = "20000";
    wrapper.style.minWidth = "280px";
    wrapper.style.maxWidth = "420px";
    wrapper.innerHTML = innerHtml;
    return wrapper;
  }

  function showConfirmModal(title, message, onConfirm) {
    const content = `
      <h3 style="color:#ffd700; margin-bottom:10px;">${escapeHtml(title)}</h3>
      <p style="margin-bottom:12px;">${escapeHtml(message)}</p>
      <div style="text-align:center;">
        <button id="confirmYes" style="background:#ff4d4d;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;margin-right:8px;">
          <i class="fa-solid fa-check"></i> Yes
        </button>
        <button id="confirmNo" style="background:#444;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">
          <i class="fa-solid fa-xmark"></i> Cancel
        </button>
      </div>

    `;
    const modal = buildModal(content);
    document.body.appendChild(modal);

    modal.querySelector("#confirmNo").addEventListener("click", () => {
      modal.remove();
      showCustomAlert("❎ Action cancelled.");
    });

    modal.querySelector("#confirmYes").addEventListener("click", () => {
      modal.remove();
      onConfirm && onConfirm();
    });
  }

  // small helper for safely inserting attribute values into inputs
  function escapeAttr(s) {
    if (s === undefined || s === null) return "";
    return String(s).replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  // initial load
  loadCategories();

  
});
