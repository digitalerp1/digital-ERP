Tumhara task hai `index.html` file ko optimize aur modularize karna. Abhi `index.html` file bahut badi hai (lagbhag 736 lines) aur isme CSS aur JavaScript dono embedded hain. Tumhe is file ko refactor karke multiple files me split karna hai jisse codebase clean aur maintainable ban sake.

Niche diye gaye steps ko dhyan se follow karo:

1.  **CSS Extraction:** `index.html` me jo `<style>` tag ke andar CSS code hai, usko extract karke ek nayi file `styles.css` me daalo. Fir `index.html` me `<head>` section ke andar is `styles.css` file ko link karo:
    `<link rel="stylesheet" href="styles.css">`

2.  **JavaScript Extraction:** `index.html` me jo `<script>` tags ke andar custom JavaScript code (excluding third-party scripts like Google Tag Manager, Tailwind CSS) hai, usko extract karke ek nayi file `main.js` me daalo. Fir is `main.js` file ko `index.html` ke end me `</body>` tag ke upar link karo:
    `<script src="main.js"></script>`

3.  **HTML Component Split (Optional but recommended):** Agar `index.html` me alag-alag sections (jaise Hero section, Features section, Footer) clear hain, to unhe separate HTML components me break karne ka structure banao agar possible ho, ya fir bas code ko properly format aur indent karo taki read karna aasan ho.

4.  **Verification:** Changes karne ke baad verify karo ki `index.html` me saari functionalities aur styles pehle jaise hi work kar rahi hain aur koi errors nahi aa rahe hain.

Yeh ek bahut important task hai, isliye isko bina kisi galti ke pura karna hai. Good luck!