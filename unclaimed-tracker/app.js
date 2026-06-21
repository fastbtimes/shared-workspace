/* ClaimTrail — unclaimed-property tracker (front-end demo).
 * Data persists in the browser via localStorage. No backend, nothing uploaded.
 * The actual property search is always free at the official state sites; this
 * tool only organizes and tracks the work. See README.md to wire up Stripe +
 * a real backend for production. */

(function () {
  "use strict";

  /* ---------- payments config ----------
   * Two ways to charge, in priority order:
   *   1. Serverless Stripe Checkout at /api/create-checkout-session (best).
   *      Set STRIPE_SECRET_KEY + price IDs in your Vercel project env.
   *   2. Stripe Payment Links — paste the URLs below for a zero-backend setup.
   *      Create them at https://dashboard.stripe.com/payment-links and set the
   *      "after payment" redirect to:  https://YOURSITE/?checkout=success&plan=family
   * If neither is configured the buttons run in demo mode (no charge). */
  var PAYMENT_LINKS = {
    family: "", // e.g. "https://buy.stripe.com/xxxxxxxx"
    pro: ""     // e.g. "https://buy.stripe.com/yyyyyyyy"
  };

  var STORE_KEY = "claimtrail.v1";
  var STATUSES = ["found", "filing", "submitted", "paid"];
  var STATUS_LABEL = { found: "Found", filing: "Filing", submitted: "Submitted", paid: "Paid" };

  /* ---------- state ---------- */
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    // seed with a friendly empty structure
    return { plan: "free", people: [], claims: [], selectedPersonId: null };
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function money(n) {
    return "$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- navigation between marketing + app ---------- */
  var marketing = document.getElementById("marketing");
  var app = document.getElementById("app");

  function showApp() {
    marketing.classList.add("hidden");
    app.classList.remove("hidden");
    window.scrollTo(0, 0);
    render();
  }
  function showMarketing() {
    app.classList.add("hidden");
    marketing.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var navApp = e.target.closest("[data-nav-app]");
    if (navApp) {
      e.preventDefault();
      var plan = navApp.getAttribute("data-plan");
      if (plan) choosePlan(plan);
      showApp();
      return;
    }
    var navMkt = e.target.closest("[data-nav-marketing]");
    if (navMkt) { e.preventDefault(); showMarketing(); }
  });

  // Deep-link straight to the app via #app
  if (location.hash === "#app") showApp();

  // Handle return from Stripe Checkout: ?checkout=success&plan=family
  handleCheckoutReturn();

  function handleCheckoutReturn() {
    var params = new URLSearchParams(location.search);
    var status = params.get("checkout");
    if (!status) return;
    if (status === "success") {
      var plan = params.get("plan") || "family";
      state.plan = plan;
      save();
      showApp();
      setTimeout(function () {
        alert("🎉 Payment received — your " + plan.toUpperCase() + " plan is active. Add your whole family below.");
      }, 50);
    } else if (status === "cancel") {
      setTimeout(function () { alert("Checkout canceled — no charge was made."); }, 50);
    }
    // Clean the URL so a refresh doesn't re-trigger.
    history.replaceState({}, document.title, location.pathname + location.hash);
  }

  function choosePlan(plan) {
    if (plan === "free") { state.plan = "free"; save(); return; }
    startCheckout(plan);
  }

  // 1) Try the serverless Checkout Session. 2) Fall back to a Payment Link.
  // 3) Fall back to demo mode (unlock locally, no charge).
  function startCheckout(plan) {
    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan })
    }).then(function (r) {
      return r.json().then(function (data) { return { ok: r.ok, data: data }; });
    }).then(function (res) {
      if (res.ok && res.data && res.data.url) {
        window.location.href = res.data.url; // off to Stripe Checkout
      } else {
        fallbackCheckout(plan);
      }
    }).catch(function () {
      fallbackCheckout(plan);
    });
  }

  function fallbackCheckout(plan) {
    var link = PAYMENT_LINKS[plan];
    if (link) {
      window.location.href = link; // Stripe Payment Link
      return;
    }
    // Demo mode — no payments configured yet.
    state.plan = plan;
    save();
    render();
    alert("Demo mode: '" + plan + "' unlocked locally (no charge).\n\nTo charge for real, set STRIPE_SECRET_KEY + price IDs in Vercel, or paste a Payment Link in app.js. See README.md.");
  }

  /* ---------- people ---------- */
  var personForm = document.getElementById("personForm");
  var personName = document.getElementById("personName");
  var personStates = document.getElementById("personStates");
  var peopleList = document.getElementById("peopleList");

  personForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = personName.value.trim();
    if (!name) return;

    // Free plan: cap at 1 tracked person, nudge to upgrade.
    var limit = state.plan === "free" ? 1 : Infinity;
    if (state.people.length >= limit) {
      alert("The Free plan tracks 1 person. Upgrade to Family ($9/mo) to track your whole family.\n\n(Demo: pick the Family plan on the pricing section.)");
      return;
    }

    var person = {
      id: uid(),
      name: name,
      states: normStates(personStates.value)
    };
    state.people.push(person);
    state.selectedPersonId = person.id;
    save();
    personForm.reset();
    render();
  });

  function normStates(raw) {
    return (raw || "")
      .split(/[,\s]+/)
      .map(function (s) { return s.trim().toUpperCase(); })
      .filter(Boolean)
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  function selectPerson(id) {
    state.selectedPersonId = (state.selectedPersonId === id) ? null : id;
    save();
    render();
  }

  function deletePerson(id) {
    var p = state.people.find(function (x) { return x.id === id; });
    var hasClaims = state.claims.some(function (c) { return c.personId === id; });
    var msg = "Remove " + (p ? p.name : "this person") + "?" + (hasClaims ? " Their claims will also be deleted." : "");
    if (!confirm(msg)) return;
    state.people = state.people.filter(function (x) { return x.id !== id; });
    state.claims = state.claims.filter(function (c) { return c.personId !== id; });
    if (state.selectedPersonId === id) state.selectedPersonId = null;
    save();
    render();
  }

  /* ---------- claims ---------- */
  var modal = document.getElementById("claimModal");
  var claimForm = document.getElementById("claimForm");
  var claimPerson = document.getElementById("claimPerson");
  var claimState = document.getElementById("claimState");
  var claimAmount = document.getElementById("claimAmount");
  var claimType = document.getElementById("claimType");
  var claimLink = document.getElementById("claimLink");
  var claimStatus = document.getElementById("claimStatus");
  var claimNotes = document.getElementById("claimNotes");
  var editingId = null;

  document.getElementById("addClaimBtn").addEventListener("click", function () { openClaimModal(); });
  document.getElementById("claimCancel").addEventListener("click", closeClaimModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeClaimModal(); });

  function openClaimModal(claim) {
    if (!state.people.length) { alert("Add a person first."); return; }
    editingId = claim ? claim.id : null;
    document.getElementById("claimModalTitle").textContent = claim ? "Edit claim" : "Add claim";

    // populate person dropdown
    claimPerson.innerHTML = state.people.map(function (p) {
      return '<option value="' + p.id + '">' + esc(p.name) + "</option>";
    }).join("");
    claimPerson.value = claim ? claim.personId : (state.selectedPersonId || state.people[0].id);
    claimState.value = claim ? claim.state : "";
    claimAmount.value = claim ? claim.amount : "";
    claimType.value = claim ? claim.type : "";
    claimLink.value = claim ? claim.link : "";
    claimStatus.value = claim ? claim.status : "found";
    claimNotes.value = claim ? claim.notes : "";

    modal.classList.remove("hidden");
    claimState.focus();
  }
  function closeClaimModal() { modal.classList.add("hidden"); editingId = null; }

  claimForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      personId: claimPerson.value,
      state: claimState.value.trim().toUpperCase(),
      amount: parseFloat(claimAmount.value) || 0,
      type: claimType.value.trim(),
      link: claimLink.value.trim(),
      status: claimStatus.value,
      notes: claimNotes.value.trim()
    };
    if (editingId) {
      var c = state.claims.find(function (x) { return x.id === editingId; });
      if (c) Object.assign(c, data);
    } else {
      data.id = uid();
      state.claims.push(data);
    }
    save();
    closeClaimModal();
    render();
  });

  function cycleStatus(id) {
    var c = state.claims.find(function (x) { return x.id === id; });
    if (!c) return;
    var i = STATUSES.indexOf(c.status);
    c.status = STATUSES[(i + 1) % STATUSES.length];
    save();
    render();
  }

  function deleteClaim(id) {
    if (!confirm("Delete this claim?")) return;
    state.claims = state.claims.filter(function (x) { return x.id !== id; });
    save();
    render();
  }

  /* ---------- export ---------- */
  document.getElementById("exportBtn").addEventListener("click", function () {
    var rows = [["Name", "State", "Type", "Amount", "Status", "Link", "Notes"]];
    state.claims.forEach(function (c) {
      var p = state.people.find(function (x) { return x.id === c.personId; });
      rows.push([p ? p.name : "", c.state, c.type, c.amount, STATUS_LABEL[c.status] || c.status, c.link, c.notes]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell == null ? "" : cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(",");
    }).join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "claimtrail-export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- render ---------- */
  function visibleClaims() {
    if (state.selectedPersonId) {
      return state.claims.filter(function (c) { return c.personId === state.selectedPersonId; });
    }
    return state.claims;
  }

  function render() {
    document.getElementById("planBadge").textContent =
      ({ free: "Free", family: "Family", pro: "Pro" })[state.plan] || "Free";

    // people sidebar
    if (!state.people.length) {
      peopleList.innerHTML = '<li class="hint" style="padding:.4rem 0">No one added yet.</li>';
    } else {
      peopleList.innerHTML = state.people.map(function (p) {
        var count = state.claims.filter(function (c) { return c.personId === p.id; }).length;
        var meta = (p.states.length ? p.states.join(", ") : "no states") + " · " + count + " claim" + (count === 1 ? "" : "s");
        return '<li class="person-item ' + (state.selectedPersonId === p.id ? "active" : "") + '" data-person="' + p.id + '">' +
          '<span><span class="p-name">' + esc(p.name) + '</span><br><span class="p-meta">' + esc(meta) + '</span></span>' +
          '<button class="p-del" data-del-person="' + p.id + '" title="Remove">✕</button>' +
          "</li>";
      }).join("");
    }

    // content title + add-claim enabled state
    var sel = state.people.find(function (p) { return p.id === state.selectedPersonId; });
    document.getElementById("contentTitle").textContent = sel ? sel.name + "'s claims" : "All claims";
    document.getElementById("addClaimBtn").disabled = !state.people.length;

    // search links for the selected person (or generic)
    renderSearchLinks(sel);

    // totals
    var claims = visibleClaims();
    var totalAll = sum(claims);
    var totalPaid = sum(claims.filter(function (c) { return c.status === "paid"; }));
    var totalOpen = totalAll - totalPaid;
    document.getElementById("totals").innerHTML =
      totalCard("Tracked", money(totalAll), "") +
      totalCard("Recovered", money(totalPaid), "t-paid") +
      totalCard("Still owed", money(totalOpen), "t-open");

    // claims table
    var body = document.getElementById("claimsBody");
    var empty = document.getElementById("emptyState");
    if (!claims.length) {
      body.innerHTML = "";
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      body.innerHTML = claims.map(function (c) {
        var p = state.people.find(function (x) { return x.id === c.personId; });
        var link = c.link
          ? '<a href="' + esc(c.link) + '" target="_blank" rel="noopener">Open ↗</a>'
          : '<span class="p-meta">—</span>';
        return "<tr>" +
          "<td>" + esc(p ? p.name : "?") + "</td>" +
          "<td>" + esc(c.state) + "</td>" +
          "<td>" + esc(c.type || "—") + "</td>" +
          '<td class="amount">' + money(c.amount) + "</td>" +
          '<td><span class="pill pill-' + c.status + '" data-cycle="' + c.id + '" title="Click to advance">' + (STATUS_LABEL[c.status] || c.status) + "</span></td>" +
          "<td>" + link + "</td>" +
          '<td style="text-align:right">' +
            '<button class="row-del" data-edit="' + c.id + '" title="Edit">✎</button> ' +
            '<button class="row-del" data-del-claim="' + c.id + '" title="Delete">🗑</button>' +
          "</td>" +
          "</tr>";
      }).join("");
    }
  }

  function sum(arr) { return arr.reduce(function (t, c) { return t + (Number(c.amount) || 0); }, 0); }
  function totalCard(label, val, cls) {
    return '<div class="total-card ' + cls + '"><span>' + label + "</span><strong>" + val + "</strong></div>";
  }

  function renderSearchLinks(person) {
    var el = document.getElementById("searchLinks");
    var links = [
      ['Search missingmoney.com', "https://www.missingmoney.com/en/"],
      ['State sites (unclaimed.org)', "https://www.unclaimed.org/"]
    ];
    var html = links.map(function (l) {
      return '<a href="' + l[1] + '" target="_blank" rel="noopener">🔎 ' + l[0] + "</a>";
    }).join("");
    if (person && person.states.length) {
      html += person.states.map(function (s) {
        return '<a href="https://www.missingmoney.com/en/" target="_blank" rel="noopener">📍 ' + esc(person.name.split(" ")[0]) + " in " + esc(s) + "</a>";
      }).join("");
    }
    el.innerHTML = html;
  }

  /* ---------- event delegation for dynamic elements ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    var personItem = t.closest("[data-person]");
    var delPerson = t.closest("[data-del-person]");
    if (delPerson) { e.stopPropagation(); deletePerson(delPerson.getAttribute("data-del-person")); return; }
    if (personItem) { selectPerson(personItem.getAttribute("data-person")); return; }

    var cycle = t.closest("[data-cycle]");
    if (cycle) { cycleStatus(cycle.getAttribute("data-cycle")); return; }
    var edit = t.closest("[data-edit]");
    if (edit) {
      var c = state.claims.find(function (x) { return x.id === edit.getAttribute("data-edit"); });
      if (c) openClaimModal(c);
      return;
    }
    var delClaim = t.closest("[data-del-claim]");
    if (delClaim) { deleteClaim(delClaim.getAttribute("data-del-claim")); return; }
  });

  // initial paint if app is already visible
  if (!app.classList.contains("hidden")) render();
})();
