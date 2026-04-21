# Task: Refactor UI into Multiple Code Files for Modular Architecture

**Objective:**
The goal is to convert our monolithic HTML files (`index.html` and `indexphone.html`) into a clean, modular architecture. Currently, these files are huge and hard to maintain. Your task is to extract distinct parts of the user interface into separate, manageable code files (HTML fragments/components), and write the necessary JavaScript to load them dynamically. You must be extremely precise and not introduce any bugs or visual changes.

**Very Detailed Step-by-Step Instructions for the AI Agent:**

1. **Understand the Current State:**
   - Read `index.html` and `indexphone.html` carefully. They contain sections like Header, Hero, Features, Services, Contact Form, Pricing Page, Terms Page, and Footer.
   - Read `main.js`. It contains all the routing, event listeners, and logic.

2. **Create a Component Directory:**
   - Create a folder named `components/` in the root directory.

3. **Extract HTML Sections into Files:**
   - You need to slice the main HTML files into separate files inside `components/`.
   - Create `components/header.html` and paste the `<header>` block into it.
   - Create `components/hero.html` and paste the hero `<section>`.
   - Create `components/features.html` and paste the features `<section>`.
   - Create `components/services.html` and paste the services `<section>`.
   - Create `components/contact.html` and paste the contact `<section>`.
   - Create `components/pricing.html` and paste the pricing `<div>`.
   - Create `components/terms.html` and paste the terms `<div>`.
   - Create `components/footer.html` and paste the `<footer>` block.
   - *Crucial Rule:* The extracted files should ONLY contain the HTML tags for that specific block. No `<html>`, `<head>`, or `<body>` tags in the component files.

4. **Refactor `index.html` and `indexphone.html`:**
   - Replace the extracted blocks in `index.html` and `indexphone.html` with empty placeholder `div`s.
   - Use meaningful IDs for placeholders, like `<div id="component-header"></div>`, `<div id="component-hero"></div>`, etc.
   - Ensure the structure of the `<main>` tag is preserved if it wraps multiple components.

5. **Write Dynamic Component Loader (`componentLoader.js`):**
   - Create a new file called `componentLoader.js`.
   - Write a JavaScript function that uses the `fetch()` API to load the HTML fragments asynchronously.
   - Example logic: Iterate through all elements that look like placeholders (e.g., `<div data-component="header"></div>`), fetch `components/header.html`, and inject `response.text()` into the element's `innerHTML`.
   - Add `<script src="componentLoader.js"></script>` to `index.html` and `indexphone.html` right before `main.js`.

6. **Fix Event Listeners & Logic in `main.js`:**
   - *This is the most critical step.* Currently, `main.js` runs on `DOMContentLoaded` and immediately attaches event listeners (like scroll, click for nav links, form submission) to elements.
   - Because elements are now loaded dynamically via `fetch`, they won't exist in the DOM when `main.js` initially runs.
   - You must modify `main.js` so that its initialization logic runs *only after* all components have been fully loaded and injected into the DOM by `componentLoader.js`.
   - *Hint:* Have `componentLoader.js` dispatch a custom event (e.g., `document.dispatchEvent(new Event('ComponentsLoaded'))`) when all fetches are complete, and change `document.addEventListener('DOMContentLoaded', ...)` in `main.js` to listen for `ComponentsLoaded` instead.

7. **Strict Testing and Verification:**
   - Ensure absolutely no CSS styles break. Check animations, scroll-smooth behaviors, and responsive classes.
   - Verify that clicking navigation links still shows/hides the correct pages (Home, Pricing, Terms).
   - Ensure the contact form submission still works.
   - Ensure mobile menus toggle correctly.

**Expected Final State:**
- A `components/` folder containing multiple small HTML files.
- Lean `index.html` and `indexphone.html` files mostly consisting of placeholders.
- A new `componentLoader.js` script.
- A modified `main.js` that correctly waits for components to load before attaching events.
- Zero visual or functional differences for the user.

*Note: Please implement this meticulously. Read through the code thoroughly before replacing blocks. Good luck!*
