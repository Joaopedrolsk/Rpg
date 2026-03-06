// simple textarea save/edit/cancel logic

document.addEventListener("DOMContentLoaded", () => {
  let lastSaved = "";
  const noteEl = document.getElementById("note");
  const saveBtn = document.getElementById("save");
  const editBtn = document.getElementById("edit");
  const cancelBtn = document.getElementById("cancel");
  const inicioLink = document.getElementById("inicio-link");
  const STORAGE_KEY = "hexatombe-note";

  // load from localStorage if available
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    lastSaved = stored;
    if (noteEl) noteEl.value = lastSaved;
  }

  // highlight active sidebar link
  document.querySelectorAll(".sidebar a").forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });

  if (inicioLink) {
    inicioLink.addEventListener("click", (e) => {
      // if already on the home page, reload instead of navigating
      if (
        window.location.pathname.endsWith("html.html") ||
        window.location.pathname.endsWith("/")
      ) {
        e.preventDefault();
        window.location.reload();
      }
    });
  }
  // helper to update UI state
  function setReadOnly(readOnly) {
    noteEl.readOnly = readOnly;
    if (readOnly) {
      noteEl.classList.add("readonly");
    } else {
      noteEl.classList.remove("readonly");
    }
  }

  saveBtn.addEventListener("click", () => {
    lastSaved = noteEl.value;
    localStorage.setItem(STORAGE_KEY, lastSaved);
    setReadOnly(true);
  });

  editBtn.addEventListener("click", () => {
    setReadOnly(false);
    noteEl.focus();
  });

  cancelBtn.addEventListener("click", () => {
    noteEl.value = lastSaved;
    setReadOnly(true);
  });

  // initialize
  setReadOnly(false);

  // ==================== EDIT MAIN TITLE ====================
  const mainTitle = document.getElementById("main-title");
  const editTitleBtn = document.getElementById("edit-title-btn");
  const TITLE_STORAGE_KEY = "hexatombe-title";

  // Load title from localStorage
  if (mainTitle) {
    const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
    if (storedTitle) {
      mainTitle.textContent = storedTitle;
    }

    // Add event listener to edit button
    if (editTitleBtn) {
      editTitleBtn.addEventListener("click", () => {
        const newTitle = prompt("Digite o novo título:", mainTitle.textContent);
        if (newTitle && newTitle.trim()) {
          mainTitle.textContent = newTitle.trim();
          localStorage.setItem(TITLE_STORAGE_KEY, newTitle.trim());
        }
      });
    }
  }
});

// utility to validate URLs for member links
function isValidUrl(str) {
  try {
    // URL constructor throws if invalid
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// ==================== GRUPOS PAGE LOGIC ====================
document.addEventListener("DOMContentLoaded", () => {
  const addGrupoBtn = document.getElementById("add-grupo-btn");
  const modal = document.getElementById("grupo-modal");
  const grupoNameInput = document.getElementById("grupo-name");
  const addMemberBtn = document.getElementById("add-member-btn");
  const membersList = document.getElementById("members-list");
  const saveGrupoBtn = document.getElementById("save-grupo-btn");
  const cancelGrupoBtn = document.getElementById("cancel-grupo-btn");
  const gruposContainer = document.getElementById("grupos-container");

  if (!addGrupoBtn) return; // Only run on Grupos page

  const GRUPOS_STORAGE_KEY = "hexatombe-grupos";
  let currentMembers = [];

  // Load grupos from localStorage
  function loadGrupos() {
    const stored = localStorage.getItem(GRUPOS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save grupos to localStorage
  function saveGruposToStorage(grupos) {
    localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
  }

  // Render grupos in the container
  function renderGrupos() {
    const grupos = loadGrupos();
    gruposContainer.innerHTML = "";

    grupos.forEach((grupo, idx) => {
      const card = document.createElement("div");
      card.className = "grupo-card";

      // Card header with name and delete button
      const header = document.createElement("div");
      header.className = "grupo-card-header";

      const titulo = document.createElement("h3");
      titulo.style.margin = "0";
      titulo.textContent = grupo.name;
      titulo.setAttribute("translate", "no");
      titulo.classList.add("notranslate");

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete-grupo";
      deleteBtn.innerHTML = "❌";
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Tem certeza que quer deletar o grupo "${grupo.name}"?`)) {
          const grupos = loadGrupos();
          grupos.splice(idx, 1);
          saveGruposToStorage(grupos);
          renderGrupos();
        }
      });

      header.appendChild(titulo);
      header.appendChild(deleteBtn);
      card.appendChild(header);

      // Edit group name button
      const editNameBtn = document.createElement("button");
      editNameBtn.className = "btn-edit-grupo";
      editNameBtn.textContent = "✏️ Editar Nome";
      editNameBtn.addEventListener("click", () => {
        const newName = prompt("Novo nome do grupo:", grupo.name);
        if (newName && newName.trim()) {
          const grupos = loadGrupos();
          grupos[idx].name = newName.trim();
          saveGruposToStorage(grupos);
          renderGrupos();
        }
      });
      card.appendChild(editNameBtn);

      // Members section
      const memberLabel = document.createElement("p");
      memberLabel.style.margin = "0.75rem 0 0.5rem 0";
      memberLabel.style.color = "#aaa";
      memberLabel.innerHTML = `<strong>Integrantes (${grupo.members.length}):</strong>`;
      card.appendChild(memberLabel);

      // Members list
      grupo.members.forEach((memberObj, mIdx) => {
        const member = memberObj.name;
        const memberDiv = document.createElement("div");
        memberDiv.className = "member-display";
        memberDiv.innerHTML = `
          <span translate="no" class="notranslate">• ${member}</span>
          <button class="btn-edit-member">✏️</button>
          <button class="btn-remove-member">❌</button>
        `;

        // Edit member
        memberDiv
          .querySelector(".btn-edit-member")
          .addEventListener("click", () => {
            const newMemberName = prompt("Novo nome do integrante:", member);
            if (newMemberName && newMemberName.trim()) {
              const grupos = loadGrupos();
              grupos[idx].members[mIdx].name = newMemberName.trim();
              saveGruposToStorage(grupos);
              renderGrupos();
            }
          });

        // Remove member
        memberDiv
          .querySelector(".btn-remove-member")
          .addEventListener("click", () => {
            const grupos = loadGrupos();
            grupos[idx].members.splice(mIdx, 1);
            saveGruposToStorage(grupos);
            renderGrupos();
          });

        card.appendChild(memberDiv);
      });

      gruposContainer.appendChild(card);
    });
  }

  // Add member input to modal
  function addMemberInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "member-input-wrapper";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nome do integrante";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-member-btn";
    removeBtn.innerHTML = "❌";
    removeBtn.type = "button";

    removeBtn.addEventListener("click", () => {
      wrapper.remove();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    membersList.appendChild(wrapper);
  }

  // Open modal
  addGrupoBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    currentMembers = [];
    grupoNameInput.value = "";
    membersList.innerHTML = "";
  });

  // Add member button
  addMemberBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addMemberInput();
  });

  // Save grupo
  saveGrupoBtn.addEventListener("click", () => {
    const grupoName = grupoNameInput.value.trim();
    if (!grupoName) {
      alert("Digite o nome do grupo");
      return;
    }

    // Collect members
    const memberInputs = document.querySelectorAll(
      ".member-input-wrapper input",
    );
    const members = Array.from(memberInputs)
      .map((input) => input.value.trim())
      .filter((val) => val)
      .map((name) => ({ name, image: "", desc: "", link: "" }));

    // Create grupo object
    const novoGrupo = {
      name: grupoName,
      members: members,
    };

    // Save to storage
    const grupos = loadGrupos();
    grupos.push(novoGrupo);
    saveGruposToStorage(grupos);

    // Close modal and refresh
    modal.classList.add("hidden");
    renderGrupos();
  });

  // Cancel
  cancelGrupoBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Initial render
  renderGrupos();
});

// ==================== INTEGRANTES PAGE LOGIC ====================
document.addEventListener("DOMContentLoaded", () => {
  const integrantesSection = document.getElementById("integrantes-section");
  if (!integrantesSection) return;

  const GRUPOS_STORAGE_KEY = "hexatombe-grupos";

  function loadGrupos() {
    const stored = localStorage.getItem(GRUPOS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  function saveGruposToStorage(grupos) {
    localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
  }

  function renderIntegrantes() {
    const grupos = loadGrupos();
    integrantesSection.innerHTML = "";

    grupos.forEach((grupo, gIdx) => {
      grupo.members.forEach((memberObj, mIdx) => {
        const member = memberObj.name;
        const div = document.createElement("div");
        div.className = "integrante-card";
        div.style.position = "relative"; // for edit button positioning

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "integrante-img-wrapper";
        imgWrapper.dataset.groupIdx = gIdx;
        imgWrapper.dataset.memberIdx = mIdx;

        // Always show image element
        const img = document.createElement("img");
        img.className = "integrante-img";

        // If has image, show it. Otherwise show placeholder
        if (memberObj.image && memberObj.image.length > 100) {
          img.src = memberObj.image;
          img.style.display = "block";
        } else {
          img.style.display = "none";
          const placeholder = document.createElement("span");
          placeholder.className = "img-placeholder";
          placeholder.textContent = "Anexar Imagem";
          imgWrapper.appendChild(placeholder);
        }

        imgWrapper.appendChild(img);

        const nameEl = document.createElement("strong");
        nameEl.setAttribute("translate", "no");
        nameEl.classList.add("notranslate");
        nameEl.textContent = member;

        const groupEl = document.createElement("span");
        groupEl.setAttribute("translate", "no");
        groupEl.classList.add("notranslate");
        groupEl.style.cssText = "font-size:0.85rem;color:#bbb";
        groupEl.textContent = `Grupo: ${grupo.name}`;

        div.appendChild(imgWrapper);
        div.appendChild(nameEl);
        div.appendChild(groupEl);
        // optional link (only if valid URL)
        if (memberObj.link && isValidUrl(memberObj.link)) {
          const a = document.createElement("a");
          a.href = memberObj.link;
          a.textContent = memberObj.link;
          a.target = "_blank";
          a.style.color = "#339cff";
          a.style.display = "block";
          a.style.wordBreak = "break-all";
          div.appendChild(a);
        }

        // add edit button to card
        const editBtnCard = document.createElement("button");
        editBtnCard.className = "btn-edit-card";
        editBtnCard.textContent = "Editar";
        editBtnCard.addEventListener("click", (e) => {
          e.stopPropagation();
          openIntegranteModal(gIdx, mIdx);
        });
        div.appendChild(editBtnCard);

        // click to change image
        imgWrapper.addEventListener("click", () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/png, image/jpeg";
          fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (!file) return;

            // Check file size (max 1MB)
            if (file.size > 1024 * 1024) {
              alert("Imagem muito grande! Máximo 1MB");
              return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target.result;
              console.log(
                "Image loaded, trying to save...",
                base64.substring(0, 50),
              );

              const gruposArr = loadGrupos();
              const gi = parseInt(imgWrapper.dataset.groupIdx, 10);
              const mi = parseInt(imgWrapper.dataset.memberIdx, 10);

              console.log("Indices:", gi, mi);

              if (gruposArr[gi] && gruposArr[gi].members[mi]) {
                gruposArr[gi].members[mi].image = base64;
                saveGruposToStorage(gruposArr);
                console.log("Image saved to storage");
                renderIntegrantes();
              } else {
                console.error("Invalid group/member indices");
              }
            };
            reader.onerror = () => {
              console.error("FileReader error");
            };
            reader.readAsDataURL(file);
          });
          fileInput.click();
        });

        integrantesSection.appendChild(div);
      });
    });
  }

  // modal helper
  const modal = document.getElementById("integrante-modal");
  const modalImageContainer = document.getElementById("modal-image-container");
  const modalName = document.getElementById("modal-name");
  const modalGroup = document.getElementById("modal-group");
  const modalDesc = document.getElementById("modal-desc");
  const modalLink = document.getElementById("modal-link");
  const modalSave = document.getElementById("modal-save");
  const modalCancel = document.getElementById("modal-cancel");

  let currentG = null;
  let currentM = null;

  function openIntegranteModal(gIdx, mIdx) {
    const grupos = loadGrupos();
    const grupo = grupos[gIdx];
    const memberObj = grupo.members[mIdx];
    currentG = gIdx;
    currentM = mIdx;

    // fill fields
    modalImageContainer.innerHTML = "";
    if (memberObj.image) {
      const img = document.createElement("img");
      img.src = memberObj.image;
      img.style.maxWidth = "100%";
      modalImageContainer.appendChild(img);
    }
    modalName.textContent = memberObj.name;
    modalGroup.textContent = grupo.name;
    modalDesc.value = memberObj.desc || "";
    modalLink.value = memberObj.link || "";

    // show modal and focus first input
    modal.classList.remove("hidden");
    modalDesc.focus();
  }

  modalSave.addEventListener("click", () => {
    if (currentG !== null && currentM !== null) {
      // if link provided, verify URL
      const linkVal = modalLink.value.trim();
      if (linkVal && !isValidUrl(linkVal)) {
        alert("Link inválido. Por favor use http:// ou https://");
        return;
      }

      const grupos = loadGrupos();
      grupos[currentG].members[currentM].desc = modalDesc.value;
      grupos[currentG].members[currentM].link = linkVal;
      saveGruposToStorage(grupos);
      modal.classList.add("hidden");
      renderIntegrantes();
    }
  });

  modalCancel.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // close modal clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Debug: check localStorage size
  window.checkStorage = () => {
    const key = "hexatombe-grupos";
    const data = localStorage.getItem(key);
    if (data) {
      const sizeKB = (new Blob([data]).size / 1024).toFixed(2);
      console.log(`Storage size: ${sizeKB} KB`);
      const grupos = JSON.parse(data);
      grupos.forEach((g, idx) => {
        console.log(
          `Grupo ${idx} (${g.name}):`,
          g.members.map((m) => ({
            name: m.name,
            hasImage: m.image
              ? `${(m.image.length / 1024).toFixed(2)} KB`
              : "no",
          })),
        );
      });
    } else {
      console.log("No data in storage");
    }
  };

  checkStorage();
  renderIntegrantes();
});

// ==================== ITENS PAGE LOGIC ====================
document.addEventListener("DOMContentLoaded", () => {
  const itensSection = document.getElementById("itens-section");
  if (!itensSection) return;

  const ITENS_STORAGE_KEY = "hexatombe-itens";
  const addItemBtn = document.getElementById("add-item-btn");
  const itemModal = document.getElementById("item-modal");
  const itemNameInput = document.getElementById("item-name");
  const saveItemBtn = document.getElementById("save-item-btn");
  const cancelItemBtn = document.getElementById("cancel-item-btn");
  const itensContainer = document.getElementById("itens-container");

  // Modal for editing item details
  const detailsModal = document.getElementById("item-details-modal");
  const modalItemImageContainer = document.getElementById(
    "modal-item-image-container",
  );
  const modalItemName = document.getElementById("modal-item-name");
  const modalItemDesc = document.getElementById("modal-item-desc");
  const modalItemSave = document.getElementById("modal-item-save");
  const modalItemCancel = document.getElementById("modal-item-cancel");

  let currentItemIdx = null;

  // Load items from localStorage
  function loadItens() {
    const stored = localStorage.getItem(ITENS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save items to localStorage
  function saveItensToStorage(itens) {
    localStorage.setItem(ITENS_STORAGE_KEY, JSON.stringify(itens));
  }

  // Render items in the container
  function renderItens() {
    const itens = loadItens();
    itensContainer.innerHTML = "";

    itens.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "integrante-card"; // reuse integrante-card styling
      div.style.position = "relative";

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "integrante-img-wrapper";
      imgWrapper.dataset.itemIdx = idx;

      // Always show image element
      const img = document.createElement("img");
      img.className = "integrante-img";

      // If has image, show it. Otherwise show placeholder
      if (item.image && item.image.length > 100) {
        img.src = item.image;
        img.style.display = "block";
      } else {
        img.style.display = "none";
        const placeholder = document.createElement("span");
        placeholder.className = "img-placeholder";
        placeholder.textContent = "Anexar Imagem";
        imgWrapper.appendChild(placeholder);
      }

      imgWrapper.appendChild(img);

      const nameEl = document.createElement("strong");
      nameEl.setAttribute("translate", "no");
      nameEl.classList.add("notranslate");
      nameEl.textContent = item.name;

      div.appendChild(imgWrapper);
      div.appendChild(nameEl);

      // add edit button to card
      const editBtnCard = document.createElement("button");
      editBtnCard.className = "btn-edit-card";
      editBtnCard.textContent = "Editar";
      editBtnCard.addEventListener("click", (e) => {
        e.stopPropagation();
        openItemDetailsModal(idx);
      });
      div.appendChild(editBtnCard);

      // add delete button to card
      const deleteBtnCard = document.createElement("button");
      deleteBtnCard.className = "btn-delete-card";
      deleteBtnCard.innerHTML = "❌";
      deleteBtnCard.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Tem certeza que quer deletar o item "${item.name}"?`)) {
          const itens = loadItens();
          itens.splice(idx, 1);
          saveItensToStorage(itens);
          renderItens();
        }
      });
      div.appendChild(deleteBtnCard);

      // click to change image
      imgWrapper.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/png, image/jpeg";
        fileInput.addEventListener("change", () => {
          const file = fileInput.files[0];
          if (!file) return;

          // Check file size (max 1MB)
          if (file.size > 1024 * 1024) {
            alert("Imagem muito grande! Máximo 1MB");
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target.result;

            const itensArr = loadItens();
            const itemIndex = parseInt(imgWrapper.dataset.itemIdx, 10);

            if (itensArr[itemIndex]) {
              itensArr[itemIndex].image = base64;
              saveItensToStorage(itensArr);
              renderItens();
            }
          };
          reader.onerror = () => {
            console.error("FileReader error");
          };
          reader.readAsDataURL(file);
        });
        fileInput.click();
      });

      itensContainer.appendChild(div);
    });
  }

  function openItemDetailsModal(idx) {
    const itens = loadItens();
    const item = itens[idx];
    currentItemIdx = idx;

    // fill fields
    modalItemImageContainer.innerHTML = "";
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.style.maxWidth = "100%";
      modalItemImageContainer.appendChild(img);
    }
    modalItemName.textContent = item.name;
    modalItemDesc.value = item.desc || "";

    // show modal
    detailsModal.classList.remove("hidden");
    modalItemDesc.focus();
  }

  // Open modal for creating new item
  addItemBtn.addEventListener("click", () => {
    itemModal.classList.remove("hidden");
    itemNameInput.value = "";
    itemNameInput.focus();
  });

  // Save new item
  saveItemBtn.addEventListener("click", () => {
    const itemName = itemNameInput.value.trim();
    if (!itemName) {
      alert("Digite o nome do item");
      return;
    }

    const novoItem = {
      name: itemName,
      image: "",
      desc: "",
    };

    const itens = loadItens();
    itens.push(novoItem);
    saveItensToStorage(itens);

    // Close modal and refresh
    itemModal.classList.add("hidden");
    renderItens();
  });

  // Cancel item creation
  cancelItemBtn.addEventListener("click", () => {
    itemModal.classList.add("hidden");
  });

  // Close item modal when clicking outside
  itemModal.addEventListener("click", (e) => {
    if (e.target === itemModal) {
      itemModal.classList.add("hidden");
    }
  });

  // Save item details
  modalItemSave.addEventListener("click", () => {
    if (currentItemIdx !== null) {
      const itens = loadItens();
      itens[currentItemIdx].desc = modalItemDesc.value;
      saveItensToStorage(itens);
      detailsModal.classList.add("hidden");
      renderItens();
    }
  });

  // Cancel item details edit
  modalItemCancel.addEventListener("click", () => {
    detailsModal.classList.add("hidden");
  });

  // Close details modal when clicking outside
  detailsModal.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
      detailsModal.classList.add("hidden");
    }
  });

  // Initial render
  renderItens();
});
