# Task: Complete Modularization of HTML Codebase

**Goal:** Refactor the large monolithic HTML files (`index.html` and `indexphone.html`) by extracting distinct sections into separate HTML components within a new `components/` directory. Then, implement dynamic loading of these components using Vanilla JavaScript.

**Context:**
The current `index.html` and `indexphone.html` files are too long and difficult to maintain. The objective is to make the codebase modular. We will use Vanilla JavaScript (no frameworks) to dynamically load the HTML fragments. Since elements will be loaded asynchronously, scripts that depend on these elements need to wait for a custom event instead of `DOMContentLoaded`.

**Step-by-Step Instructions for the AI:**

1.  **Analyze and Extract Components (index.html):**
    *   Examine `index.html`. Identify the main sections (Header, Hero, Features, Services, Contact, Pricing, Terms, Footer, Modals).
    *   Create a `components/` directory in the root.
    *   Extract each section's HTML content and save it into separate files:
        *   `components/header.html` (The `<header id="main-header">` block)
        *   `components/hero.html` (The `<section id="hero">` block)
        *   `components/features.html` (The `<section id="features">` block)
        *   `components/services.html` (The `<section id="services">` block)
        *   `components/contact.html` (The `<section id="contact">` block)
        *   `components/pricing.html` (The content inside `<div id="pricing-page">`)
        *   `components/terms.html` (The content inside `<div id="terms-page">`)
        *   `components/footer.html` (The `<footer class="bg-slate-800...">` block)
        *   `components/modals.html` (The `<div id="registration-popup">` block)
    *   **Crucial:** In `index.html`, replace the extracted code with placeholder `<div>` elements having specific IDs, such as `<div id="header-placeholder"></div>`, `<div id="hero-placeholder"></div>`, etc. Make sure the container structure is preserved.

2.  **Analyze and Extract Components (indexphone.html):**
    *   Examine `indexphone.html`. Identify the main sections.
    *   Extract the sections into new files inside the `components/` directory:
        *   `components/phone_home.html` (The content inside `<div id="home-page">`)
        *   `components/phone_terms.html` (The content inside `<div id="terms-page">`)
        *   `components/phone_ai_tools.html` (The content inside `<div id="ai-tools-page">`)
        *   `components/phone_chatbot.html` (The content inside `<div id="chatbot-page">`)
        *   `components/phone_tools.html` (The content inside `<div id="tools-page">`)
        *   `components/phone_tool_viewer.html` (The content inside `<div id="tool-viewer-page">`)
    *   In `indexphone.html`, replace the extracted code with corresponding placeholder `<div>` elements, such as `<div id="phone-home-placeholder"></div>`, etc.

3.  **Implement Dynamic Loading (Vanilla JS):**
    *   Create a new JavaScript file named `loader.js` in the root directory.
    *   In `loader.js`, write an `async` function to load a component: `async function loadComponent(placeholderId, filePath)` that uses the `fetch` API to get the HTML content from `filePath` and sets the `innerHTML` of the element with `placeholderId`.
    *   Create an initialization function that calls `loadComponent` for all the placeholders you created in Step 1 and Step 2.
    *   **Crucial Requirement:** The loading process must be asynchronous, but after *all* components are fully loaded and injected into the DOM, you MUST dispatch a custom event on the document: `document.dispatchEvent(new Event('componentsLoaded'));`.
    *   Add `<script src="loader.js"></script>` to the `<head>` or just before the closing `</body>` tag in *both* `index.html` and `indexphone.html` (ensure it runs before `main.js`).

4.  **Update Script Initialization (`main.js` and inline scripts):**
    *   In `main.js`, locate the line `document.addEventListener('DOMContentLoaded', () => { ... })`.
    *   Change `DOMContentLoaded` to `componentsLoaded` because the DOM elements needed by `main.js` will only be available after the dynamic loading is complete.
        *   `document.addEventListener('componentsLoaded', () => { ... })`.
    *   Similarly, review any script logic inside `indexphone.html`. If it relies on elements that are now dynamically loaded (like buttons, grids, forms), ensure that logic is wrapped inside a `document.addEventListener('componentsLoaded', () => { ... })` event listener.

5.  **Final Verification:**
    *   Ensure that all extraction was complete and placeholders match the loader logic.
    *   Ensure there are no console errors when running a local server.
    *   Verify the website functions identically to its monolithic state (navigation works, tool loading works, forms can be submitted, modals open).

Please execute these steps carefully and thoroughly. Ensure no code logic is lost during the extraction.