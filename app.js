(() => {
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + n.toFixed(2);
  const GENRES = ["All", ...new Set(BOOKS.map((b) => b.genre))];
  const state = { q: "", genre: "All", sort: "featured" };
  let cart = load();

  function load() {
    try { return JSON.parse(localStorage.getItem("lantern-cart")) || []; } catch { return []; }
  }
  function save() {
    try { localStorage.setItem("lantern-cart", JSON.stringify(cart)); } catch {}
  }
  const byId = (id) => BOOKS.find((b) => b.id === id);

  function coverHTML(b) {
    return `<span class="cover" data-motif="${b.motif}" style="--c:${b.color};--k:${b.ink}">
      <span class="motif"></span><b class="t">${b.title}</b><i class="a">${b.author}</i></span>`;
  }

  /* spines */
  function renderSpines() {
    $("#spines").innerHTML = BOOKS.slice(0, 16).map((b) => {
      const h = 130 + ((b.id * 37) % 70);
      const w = Math.max(30, Math.min(56, Math.round(b.pages / 12)));
      return `<button class="spine" role="listitem" data-id="${b.id}" title="${b.title}, ${b.author}"
        style="height:${h}px;width:${w}px;background:${b.color};color:${b.ink}">${b.title}</button>`;
    }).join("");
  }

  /* genres */
  function renderGenres() {
    $("#genres").innerHTML = GENRES.map((g) =>
      `<button class="chip" aria-pressed="${g === state.genre}" data-genre="${g}">${g}</button>`).join("");
  }

  /* shelf */
  function visibleBooks() {
    const q = state.q.trim().toLowerCase();
    let list = BOOKS.filter((b) =>
      (state.genre === "All" || b.genre === state.genre) &&
      (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)));
    if (state.sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (state.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }
  function renderShelf() {
    const list = visibleBooks();
    $("#status").textContent = list.length === 1 ? "1 book" : `${list.length} books`;
    if (!list.length) {
      $("#shelf").innerHTML = `<div class="empty"><p>No books match your search. Try another title or author, or clear the filters.</p>
        <button class="plain" id="clear">Clear filters</button></div>`;
      return;
    }
    $("#shelf").innerHTML = list.map((b) => `
      <div class="slot">
        <div class="stand"><button class="book" data-id="${b.id}" aria-label="View ${b.title} by ${b.author}">${coverHTML(b)}</button></div>
        <div class="caption"><h3>${b.title}</h3><p>${b.author}</p><p class="price">${money(b.price)}</p></div>
      </div>`).join("");
  }

  /* detail dialog */
  function openDetail(id) {
    const b = byId(id);
    const d = $("#detail");
    d.innerHTML = `<div class="detail-body">
      ${coverHTML(b)}
      <div>
        <h2 id="dTitle">${b.title}</h2>
        <p class="by">by ${b.author}</p>
        <p>${b.blurb}</p>
        <ul class="facts"><li>${b.genre}</li><li>First published ${b.year}</li><li>${b.pages} pages</li></ul>
        <div class="buy"><strong>${money(b.price)}</strong><button class="primary" id="addBtn">Add to cart</button></div>
      </div>
      <button class="plain close" id="dClose" aria-label="Close details">Close</button>
    </div>`;
    d.showModal();
    $("#dClose").onclick = () => d.close();
    $("#addBtn").onclick = () => { addToCart(b.id); d.close(); openCart(); };
  }
  $("#detail").addEventListener("click", (e) => { if (e.target.id === "detail") e.target.close(); });

  /* cart */
  function addToCart(id) {
    const line = cart.find((l) => l.id === id);
    line ? line.qty++ : cart.push({ id, qty: 1 });
    save(); renderCart();
  }
  function setQty(id, qty) {
    cart = qty <= 0 ? cart.filter((l) => l.id !== id) : cart.map((l) => (l.id === id ? { ...l, qty } : l));
    save(); renderCart();
  }
  function renderCart() {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const total = cart.reduce((n, l) => n + l.qty * byId(l.id).price, 0);
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = money(total);
    $("#checkout").disabled = !count;
    $("#cartItems").innerHTML = count ? cart.map((l) => {
      const b = byId(l.id);
      return `<div class="line">
        <div><h3>${b.title}</h3><p>${b.author}</p>
          <div class="qty"><button data-dec="${b.id}" aria-label="Fewer copies of ${b.title}">−</button>
            <span>${l.qty}</span>
            <button data-inc="${b.id}" aria-label="More copies of ${b.title}">+</button></div></div>
        <div class="sum">${money(b.price * l.qty)}</div>
        <button class="remove" data-rm="${b.id}">Remove</button></div>`;
    }).join("") : `<p>Your cart is empty. Pick a book from the shelves to add it.</p>`;
  }
  function openCart() { $("#drawer").hidden = false; $("#scrim").hidden = false; $("#closeCart").focus(); }
  function closeCart() { $("#drawer").hidden = true; $("#scrim").hidden = true; $("#orderMsg").textContent = ""; $("#cartBtn").focus(); }

  /* events */
  $("#q").addEventListener("input", (e) => { state.q = e.target.value; renderShelf(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderShelf(); });
  $("#genres").addEventListener("click", (e) => {
    const g = e.target.closest("[data-genre]"); if (!g) return;
    state.genre = g.dataset.genre; renderGenres(); renderShelf();
  });
  $("#shelf").addEventListener("click", (e) => {
    if (e.target.id === "clear") {
      state.q = ""; state.genre = "All"; $("#q").value = ""; renderGenres(); renderShelf(); return;
    }
    const b = e.target.closest("[data-id]"); if (b) openDetail(+b.dataset.id);
  });
  $("#spines").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]"); if (b) openDetail(+b.dataset.id);
  });
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#scrim").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#drawer").hidden) closeCart(); });
  $("#cartItems").addEventListener("click", (e) => {
    const t = e.target;
    const cur = (id) => cart.find((l) => l.id === id).qty;
    if (t.dataset.inc) setQty(+t.dataset.inc, cur(+t.dataset.inc) + 1);
    if (t.dataset.dec) setQty(+t.dataset.dec, cur(+t.dataset.dec) - 1);
    if (t.dataset.rm) setQty(+t.dataset.rm, 0);
  });
  $("#checkout").addEventListener("click", () => {
    cart = []; save(); renderCart();
    $("#orderMsg").textContent = "Demo order placed. Connect a payment provider to take real orders.";
  });

  renderSpines(); renderGenres(); renderShelf(); renderCart();
})();
