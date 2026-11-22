/* Bloom Valley Nursery - Touchstone 4
   Feature: saved-items list on products.html (saved with localStorage)
   Also:    JavaScript validation and pre-filling on contact.html
   Layout:  data first, then storage helpers, then the saved-items
            feature, then form validation, then init at the bottom. */

"use strict";

/* ====================================================================
   DATA
   ==================================================================== */

// Object: the localStorage keys used by the site
const STORAGE_KEYS = {
  favorites: "bloomValley.savedItems",
  contact: "bloomValley.contactInfo"
};

// Array of objects: every product that can be saved
const PRODUCTS = [
  { id: "apple-tree", name: "Apple tree", category: "Trees" },
  { id: "birch-tree", name: "Birch tree", category: "Trees" },
  { id: "maple-tree", name: "Maple tree", category: "Trees" },
  { id: "aloe-vera", name: "Aloe vera plant", category: "Plants" },
  { id: "spider-plant", name: "Spider plant", category: "Plants" },
  { id: "string-of-pearls", name: "String of pearls plant", category: "Plants" },
  { id: "birdhouse", name: "Birdhouse", category: "Gardening supplies" },
  { id: "potting-soil", name: "Potting soil", category: "Gardening supplies" },
  { id: "watering-can", name: "Watering can", category: "Gardening supplies" }
];

// Object: the rules and error messages used by the form validation
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    required: "Please enter your full name.",
    tooShort: "Your name must be at least 2 characters long."
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: "Please enter your email address.",
    invalid: "Enter a valid email address, such as name@example.com."
  },
  phone: {
    pattern: /^\d{3}-\d{3}-\d{4}$/,
    invalid: "Use the format 555-555-5555, or leave this blank."
  },
  topic: {
    required: "Please choose what your inquiry is about."
  },
  quantity: {
    min: 1,
    max: 100,
    invalid: "Enter a whole number from 1 to 100, or leave this blank."
  },
  message: {
    minLength: 10,
    maxLength: 500,
    required: "Please write a message so we know how to help.",
    tooShort: "Your message must be at least 10 characters long.",
    tooLong: "Your message must be 500 characters or fewer."
  }
};

// The list of saved product ids for the current visitor
let savedItems = [];

/* ====================================================================
   STORAGE HELPERS (localStorage)
   ==================================================================== */

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage may be blocked; the site still works without saving.
  }
}

function removeData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Nothing to do if storage is blocked.
  }
}

/* ====================================================================
   FEATURE: SAVED ITEMS
   ==================================================================== */

function findProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

function loadSavedItems() {
  const stored = loadData(STORAGE_KEYS.favorites, []);
  if (!Array.isArray(stored)) {
    return [];
  }
  // Keep only real, unique product ids
  return stored.filter(function (id, index) {
    return findProduct(id) && stored.indexOf(id) === index;
  });
}

function isSaved(id) {
  return savedItems.includes(id);
}

function toggleSavedItem(id) {
  if (isSaved(id)) {
    savedItems = savedItems.filter(function (savedId) {
      return savedId !== id;
    });
  } else {
    savedItems.push(id);
  }
  saveData(STORAGE_KEYS.favorites, savedItems);
  refreshSavedUI();
}

function clearSavedItems() {
  savedItems = [];
  removeData(STORAGE_KEYS.favorites);
  refreshSavedUI();
}

function addSaveButtons() {
  document.querySelectorAll("[data-product-id]").forEach(function (item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "save-button";
    button.dataset.productId = item.dataset.productId;
    item.appendChild(button);
  });
}

function updateSaveButtons() {
  document.querySelectorAll(".save-button").forEach(function (button) {
    const product = findProduct(button.dataset.productId);
    const saved = isSaved(product.id);
    button.textContent = saved ? "Saved ✓" : "Save";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute(
      "aria-label",
      (saved ? "Remove " : "Save ") + product.name + (saved ? " from my saved items" : " to my saved items")
    );
  });
}

function renderSavedList() {
  const list = document.getElementById("saved-list");
  const message = document.getElementById("saved-message");
  const clearButton = document.getElementById("clear-saved");
  list.replaceChildren();

  savedItems.forEach(function (id) {
    const product = findProduct(id);
    const item = document.createElement("li");
    const label = document.createElement("span");
    const remove = document.createElement("button");

    label.textContent = product.name + " (" + product.category + ")";
    remove.type = "button";
    remove.className = "remove-saved";
    remove.dataset.productId = id;
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove " + product.name + " from my saved items");

    item.append(label, remove);
    list.appendChild(item);
  });

  if (savedItems.length === 0) {
    message.textContent = "You have not saved any items yet. Choose Save next to an item to build your list.";
  } else {
    message.textContent = "You have saved " + savedItems.length + (savedItems.length === 1 ? " item." : " items.");
  }
  clearButton.hidden = savedItems.length === 0;
}

function refreshSavedUI() {
  updateSaveButtons();
  renderSavedList();
}

function handleProductsClick(event) {
  const target = event.target;
  if (target.matches(".save-button, .remove-saved")) {
    toggleSavedItem(target.dataset.productId);
  } else if (target.id === "clear-saved") {
    clearSavedItems();
  }
}

function initSavedItems() {
  addSaveButtons();
  refreshSavedUI();
  document.addEventListener("click", handleProductsClick);
}

/* ====================================================================
   FORM VALIDATION (contact.html)
   ==================================================================== */

function getErrorElement(field) {
  return document.getElementById(field.id + "-error");
}

function showError(field, message) {
  getErrorElement(field).textContent = "Error: " + message;
  field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
  getErrorElement(field).textContent = "";
  field.removeAttribute("aria-invalid");
}

function validateName(value) {
  const rules = VALIDATION_RULES.name;
  if (value === "") {
    return rules.required;
  }
  if (value.length < rules.minLength) {
    return rules.tooShort;
  }
  return "";
}

function validateEmail(value) {
  const rules = VALIDATION_RULES.email;
  if (value === "") {
    return rules.required;
  }
  if (!rules.pattern.test(value)) {
    return rules.invalid;
  }
  return "";
}

function validatePhone(value) {
  const rules = VALIDATION_RULES.phone;
  if (value !== "" && !rules.pattern.test(value)) {
    return rules.invalid;
  }
  return "";
}

function validateTopic(value) {
  return value === "" ? VALIDATION_RULES.topic.required : "";
}

function validateQuantity(value) {
  const rules = VALIDATION_RULES.quantity;
  if (value === "") {
    return "";
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < rules.min || number > rules.max) {
    return rules.invalid;
  }
  return "";
}

function validateMessage(value) {
  const rules = VALIDATION_RULES.message;
  if (value === "") {
    return rules.required;
  }
  if (value.length < rules.minLength) {
    return rules.tooShort;
  }
  if (value.length > rules.maxLength) {
    return rules.tooLong;
  }
  return "";
}

// Object: connects each field id to its validation function
const VALIDATORS = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  topic: validateTopic,
  quantity: validateQuantity,
  message: validateMessage
};

function validateField(field) {
  const error = VALIDATORS[field.id](field.value.trim());
  if (error) {
    showError(field, error);
    return false;
  }
  clearError(field);
  return true;
}

function validateForm() {
  let firstInvalid = null;
  Object.keys(VALIDATORS).forEach(function (fieldId) {
    const field = document.getElementById(fieldId);
    if (!validateField(field) && firstInvalid === null) {
      firstInvalid = field;
    }
  });
  if (firstInvalid) {
    firstInvalid.focus();
  }
  return firstInvalid === null;
}

/* ====================================================================
   CONTACT FORM: STORAGE, PRE-FILL, AND SUBMIT
   ==================================================================== */

function rememberContact(form) {
  if (form.elements.remember.checked) {
    saveData(STORAGE_KEYS.contact, {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim()
    });
  } else {
    removeData(STORAGE_KEYS.contact);
  }
}

function restoreContact(form) {
  const saved = loadData(STORAGE_KEYS.contact, null);
  if (saved && typeof saved === "object") {
    form.elements.name.value = saved.name || "";
    form.elements.email.value = saved.email || "";
    form.elements.remember.checked = true;
  }
}

function prefillMessageFromSavedItems(form) {
  const note = document.getElementById("prefill-note");
  if (savedItems.length === 0 || form.elements.message.value.trim() !== "") {
    return;
  }
  const names = savedItems.map(function (id) {
    return findProduct(id).name;
  });
  form.elements.message.value = "Hello! I am interested in these items: " + names.join(", ") + ".";
  note.textContent = "We added your " + savedItems.length + " saved item" +
    (savedItems.length === 1 ? "" : "s") + " to your message. You can edit it before sending.";
}

function setupLiveValidation(form) {
  Object.keys(VALIDATORS).forEach(function (fieldId) {
    const field = document.getElementById(fieldId);
    field.addEventListener("input", function () {
      // Re-check while the user corrects a field so its error disappears
      // as soon as the entry is valid. Fields are not checked on blur,
      // because a new error message would push the Send button down
      // before the click registered.
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById("form-status");
  status.textContent = "";

  if (!validateForm()) {
    status.textContent = "Please fix the fields marked with an error and send again.";
    return;
  }

  const firstName = form.elements.name.value.trim().split(" ")[0];
  rememberContact(form);
  form.reset();
  restoreContact(form);
  document.getElementById("prefill-note").textContent = "";
  status.textContent = "Thank you, " + firstName + "! Your inquiry was received. We will reply within one business day.";
}

function initContactForm() {
  const form = document.getElementById("inquiry-form");
  restoreContact(form);
  prefillMessageFromSavedItems(form);
  setupLiveValidation(form);
  form.addEventListener("submit", handleSubmit);
}

/* ====================================================================
   START
   ==================================================================== */

function init() {
  savedItems = loadSavedItems();
  if (document.getElementById("saved-list")) {
    initSavedItems();
  }
  if (document.getElementById("inquiry-form")) {
    initContactForm();
  }
}

document.addEventListener("DOMContentLoaded", init);
