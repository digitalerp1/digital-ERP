# Task: Modularize the Codebase

**Objective**:
Our project's main HTML files (`index.html` and `indexphone.html`) are currently very large and monolithic. Your task is to refactor and modularize these files to improve maintainability, readability, and performance.

**Detailed Instructions for AI Model**:
1. **Analyze Current Code**:
   - Thoroughly review `index.html`, `indexphone.html`, `main.js`, and `styles.css`.
   - Identify distinct sections/components within the HTML files (e.g., Header, Navigation, Hero Section, Features Section, Pricing, Footer, Modals).

2. **Component Separation**:
   - Extract these identified sections into their own separate HTML files (e.g., `components/header.html`, `components/footer.html`, `components/hero.html`, etc.).
   - Ensure the structure remains valid when components are isolated.

3. **Dynamic Loading Implementation (Vanilla JS)**:
   - Since there is no modern framework (like React or Vue) in use, implement a robust Vanilla JavaScript solution to dynamically load these components into a main layout file.
   - Use `fetch` API to load the HTML fragments and inject them into designated container elements (e.g., `<div id="header-placeholder"></div>`).
   - Create a central layout file (or modify `index.html` / `indexphone.html`) to act as the skeleton that loads these components.

4. **Handle Script Dependencies**:
   - Ensure that JavaScript logic in `main.js` that depends on DOM elements from these components is executed *after* the components are successfully loaded.
   - You might need to implement a callback mechanism or emit custom events when a component finishes loading.

5. **CSS Modularization (Optional but Recommended)**:
   - If feasible, split `styles.css` into smaller, component-specific CSS files and load them dynamically, or keep them centralized but well-organized using CSS comments and clear scoping.

6. **Testing and Verification**:
   - Ensure the website functions exactly as before. The transition should be seamless for the end-user.
   - Verify that all navigation links, modals, scroll animations, and external integrations (like Google Tag Manager) still work correctly.

**Expected Outcome**:
- Multiple smaller HTML component files.
- A modernized, cleaner `index.html` acting as a template/skeleton.
- Updated `main.js` capable of dynamic component loading and initialization.
- A fully functional frontend website without any visual or functional regressions.

*Note: You are expected to manage these changes autonomously. Make sure to commit the changes and mark this task as 'task complete' when done.*
