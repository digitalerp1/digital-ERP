# Task: Refactor Monolithic HTML Files into Multiple Pages

Tumhara kaam is repository ke monolithic HTML files (`index.html` aur `indexphone.html`) ko refactor karke multiple chhote aur manageable code files (jaise `home.html`, `pricing.html`, `terms.html`, etc.) mein convert karna hai.

## Detailed Requirements:

1. **Analysis & File Splitting**:
   - `index.html` aur `indexphone.html` files ko acche se read karo. Abhi inme multiple pages ka content ek hi file me hai (jaise Home, Pricing, Terms & Conditions) jo JavaScript (main.js) ke through hide/show hota hai (`id="pricing-page"`, `id="terms-page"` etc. ka use karke).
   - In sections ko alag-alag files me split karo. Example:
     - `index.html` (Sirf Home page ka content)
     - `pricing.html` (Sirf Pricing page ka content)
     - `terms.html` (Sirf Terms & Conditions ka content)

2. **Update Navigation Links**:
   - Sabhi nav links `<a href="#" data-page="...">` ko update karke actual file paths banao (jaise `<a href="pricing.html">`).
   - Header aur footer components ko sabhi nayi files me sahi tarah se include karo.

3. **Refactor `main.js`**:
   - `main.js` me jo `showPage` function hai jo classes ko `hidden` ya remove karta hai, usko modify ya hata do kyunki ab actual page loads honge.
   - Dusri functionality jaise form submission, mobile menu toggle, aur preloader ko properly preserve karo har page ke liye.

4. **Testing & Verification**:
   - Make sure ki koi bhi styles ya scripts break na ho.
   - Har naya page individually load hone par sahi dikhna chahiye.

Yeh task bina kisi galti ke pura karna, dhyan rahe ki code files sahi se split ho aur navigation perfect kaam kare.
