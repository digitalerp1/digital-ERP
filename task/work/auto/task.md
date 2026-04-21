# Task: Modularize the Codebase (HTML Component Extraction)

**Objective**:
Our project's main HTML files (`index.html` and `indexphone.html`) are currently very large and monolithic. Your task is to refactor and modularize these files to improve maintainability, readability, and performance. This will involve splitting them into multiple separate files and dynamically loading them using Vanilla JavaScript.

**Detailed Instructions for AI Model**:
1. **Analyze Current Code**:
   - Thoroughly review `index.html`, `indexphone.html`, `main.js`, and `styles.css`.
   - Identify distinct sections/components within the HTML files (e.g., Header, Navigation, Hero Section, Features Section, Pricing, Footer, Modals). Use `grep` or read the files carefully to find these logical blocks.

2. **Component Separation**:
   - Create a new directory named `components/`.
   - Extract these identified sections from `index.html` and `indexphone.html` into their own separate HTML files (e.g., `components/header.html`, `components/footer.html`, `components/hero.html`, `components/features.html`, `components/pricing.html`, `components/contact.html`, `components/terms.html`, `components/modals.html`).
   - Leave only structural placeholders in the main files, for example: `<div id="header-placeholder"></div>`. Ensure the structure remains valid when components are isolated.

3. **Dynamic Loading Implementation (Vanilla JS)**:
   - Since there is no modern framework (like React or Vue) in use, implement a robust Vanilla JavaScript solution in a new script (e.g., `loader.js` or directly inside `main.js` at the top) to dynamically load these components into a main layout file.
   - Use the `fetch` API to load the HTML fragments and inject them into designated container elements using `innerHTML` or `insertAdjacentHTML`.
   - Implement error handling for the `fetch` calls.

4. **Handle Script Dependencies & Execution Order**:
   - Ensure that JavaScript logic in `main.js` that depends on DOM elements from these components is executed *after* the components are successfully loaded.
   - **Crucial:** Implement a CustomEvent mechanism. After all components have finished loading and being injected into the DOM, dispatch a custom event on the document (e.g., `document.dispatchEvent(new Event('componentsLoaded'));`).
   - Modify `main.js` so that its initialization logic (like attaching event listeners to nav links, setting up observers) is wrapped inside an event listener for this custom event: `document.addEventListener('componentsLoaded', () => { /* original main.js logic */ });`.
   - Also, do not forget to replace `DOMContentLoaded` with `componentsLoaded` where appropriate, since elements won't be in the DOM when `DOMContentLoaded` fires.

5. **CSS Modularization (Optional but Recommended)**:
   - If feasible, split `styles.css` into smaller, component-specific CSS files and load them dynamically, or keep them centralized but well-organized using CSS comments and clear scoping.

6. **Testing and Verification**:
   - Ensure the website functions exactly as before. The transition should be seamless for the end-user.
   - Verify that all navigation links, modals, scroll animations, and external integrations (like Google Tag Manager) still work correctly.

**Expected Outcome**:
- Multiple smaller HTML component files in a `components/` folder.
- A modernized, cleaner `index.html` acting as a template/skeleton with placeholders.
- Updated JavaScript capable of dynamic component loading and initialization after load.
- A fully functional frontend website without any visual or functional regressions.

*Note: You are expected to manage these changes autonomously. Make sure to commit the changes and mark this task as 'task complete' when done.*
