# Lantern Books

A small, dependency-free bookstore site: search, genre filters, sorting, book details and a cart that remembers items in the browser.

## Run locally
Open `index.html` in a browser. No build step.

## Deploy
1. Create a new repository on GitHub and upload these files to the root of it.
2. In Vercel, choose **Add New → Project**, import the repository, leave **Framework Preset** as *Other*, and click **Deploy**.

## Customize
- `books.js`: add, remove or edit books (title, author, genre, price, cover colors).
- `styles.css`: colors and fonts are CSS variables at the top of the file.
- `index.html`: the store name and text.

## Real payments
The cart is a demo; "Place demo order" only clears it. To take payments, connect a provider such as Stripe Checkout.
