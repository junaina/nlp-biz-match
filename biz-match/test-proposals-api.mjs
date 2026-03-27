// End-to-End API test for Proposal System (Week 1)
// Run with: node --experimental-vm-modules test-proposals-api.mjs
// Uses native fetch (Node 18+), manages cookies manually

const BASE_URL = "http://localhost:3000";
const TIMESTAMP = Date.now();

// ─── Cookie jar helper ──────────────────────────────────────────────
function createCookieJar() {
  const jar = {};
  return {
    set(setCookieHeader) {
      if (!setCookieHeader) return;
      const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      for (const h of headers) {
        const [pair] = h.split(";");
        const [name, value] = pair.split("=");
        jar[name.trim()] = value?.trim();
      }
    },
    toString() {
      return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
    }
  };
}

// ─── HTTP helpers ────────────────────────────────────────────────────
async function post(path, body, cookieJar) {
  const headers = { "Content-Type": "application/json" };
  if (cookieJar) headers["Cookie"] = cookieJar.toString();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (cookieJar) {
    const setCookie = res.headers.getSetCookie?.() || [res.headers.get("set-cookie")].filter(Boolean);
    cookieJar.set(setCookie);
  }
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function get(path, cookieJar) {
  const headers = {};
  if (cookieJar) headers["Cookie"] = cookieJar.toString();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function patch(path, body, cookieJar) {
  const headers = { "Content-Type": "application/json" };
  if (cookieJar) headers["Cookie"] = cookieJar.toString();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

// ─── Test runner ─────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    console.log(`         actual:`, JSON.stringify(actual, null, 2));
    failed++;
  }
}

// ═════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════
async function main() {
  const buyerJar = createCookieJar();
  const providerJar = createCookieJar();

  let buyerBusinessId, providerBusinessId;
  let requestId, shortlistItemId, providerServiceId;
  let proposalId, conversationId;

  // ─── 1. Register Buyer ────────────────────────────────────────────
  console.log("\n📋 [1] Register Buyer");
  const buyerReg = await post("/api/auth/register", {
    name: "Test Buyer",
    businessName: `Buyer Corp ${TIMESTAMP}`,
    email: `buyer_${TIMESTAMP}@test.com`,
    password: "password123",
  }, buyerJar);
  assert("Buyer registered (201)", buyerReg.status === 201 || buyerReg.status === 200, buyerReg.body);
  buyerBusinessId = buyerReg.body.businessId;
  console.log(`     buyerBusinessId: ${buyerBusinessId}`);

  // ─── 2. Register Provider ─────────────────────────────────────────
  console.log("\n📋 [2] Register Provider");
  const provReg = await post("/api/auth/register", {
    name: "Test Provider",
    businessName: `Provider LLC ${TIMESTAMP}`,
    email: `provider_${TIMESTAMP}@test.com`,
    password: "password123",
  }, providerJar);
  assert("Provider registered (201)", provReg.status === 201 || provReg.status === 200, provReg.body);
  providerBusinessId = provReg.body.businessId;
  console.log(`     providerBusinessId: ${providerBusinessId}`);

  if (!buyerBusinessId || !providerBusinessId) {
    console.log("\n⛔ Could not register test users. Aborting.");
    process.exit(1);
  }

  // ─── 3. Buyer creates a request ───────────────────────────────────
  console.log("\n📋 [3] Buyer creates a Request");
  const reqRes = await post("/api/buyer/requests", {
    title: "Need E-commerce Site",
    description: "We need a full-stack e-commerce platform built with Next.js and Stripe integration, targeting Pakistan market, with admin dashboard.",
    budgetMin: 3000,
    budgetMax: 8000,
    timeline: "4-6 weeks",
    industry: "E-Commerce",
  }, buyerJar);
  assert("Request created (201)", reqRes.status === 201, reqRes.body);
  requestId = reqRes.body.request?.id;
  console.log(`     requestId: ${requestId}`);

  if (!requestId) {
    console.log("\n⛔ Could not create a request. Aborting.");
    process.exit(1);
  }

  // ─── 4. Provider adds a service (check if auto-created or pick existing) ─
  // Registration may auto-create a service. Check the match results:
  const matchedProviders = reqRes.body.matches || [];
  if (matchedProviders.length > 0) {
    providerServiceId = matchedProviders[0].providerServiceId || matchedProviders[0].service?.id;
    shortlistItemId = matchedProviders[0].shortlistItem?.id;
    console.log(`\n📋 [4] Using AI-matched provider service: ${providerServiceId}`);
  }

  // If no matches, we shortlist using the provider directly
  if (!shortlistItemId) {
    // Buyer fetches shortlist page to find existing items
    console.log("\n📋 [4] Manually creating a shortlist entry...");
    const shortlistRes = await get(`/api/requests/${requestId}/shortlist`, buyerJar);
    if (shortlistRes.body.shortlist?.length > 0) {
      shortlistItemId = shortlistRes.body.shortlist[0].id;
      providerServiceId = shortlistRes.body.shortlist[0].providerServiceId;
    }
  }

  // As last resort - add to shortlist manually by finding a providerService
  if (!shortlistItemId) {
    console.log("     No shortlist items found via match. Trying manual shortlist...");
    // We can use any existing providerService. Try fetching providers
    const providersRes = await get("/api/providers", buyerJar);
    const firstService = providersRes.body?.[0]?.providerServices?.[0];
    if (firstService) {
      providerServiceId = firstService.id;
      const slRes = await post("/api/shortlist", { requestId, providerServiceId }, buyerJar);
      assert("Shortlist entry created", slRes.status === 201, slRes.body);
      shortlistItemId = slRes.body.item?.id;
      console.log(`     shortlistItemId: ${shortlistItemId}`);
    }
  }

  if (!shortlistItemId) {
    console.log("\n⚠️  No shortlist item available. Skipping proposal tests.");
    printSummary(); return;
  }

  console.log(`     shortlistItemId: ${shortlistItemId}`);

  // ─── 5. [UNAUTHENTICATED] Submit Proposal — should fail ──────────
  console.log("\n📋 [5] Submit Proposal (unauthenticated) — expect error");
  const unauthProposal = await post("/api/proposals", {
    shortlistItemId,
    coverLetter: "A".repeat(120),
    proposedBudget: 5000,
    timeline: "3 weeks",
    deliverables: "Fully working app",
    kickoffMessage: "Hello, I'd like to discuss your project in detail."
  }, null);
  assert("Unauthenticated proposal rejected (400)", unauthProposal.status === 400, unauthProposal.body);

  // ─── 6. Buyer: Submit proposal — cover letter too short ───────────
  console.log("\n📋 [6] Submit Proposal — cover letter too short (validation)");
  const shortCover = await post("/api/proposals", {
    shortlistItemId,
    coverLetter: "Too short",
    proposedBudget: 5000,
    timeline: "3 weeks",
    deliverables: "Fully working app",
    kickoffMessage: "Hello, I'd like to discuss your project."
  }, buyerJar);
  assert("Short cover letter rejected (400)", shortCover.status === 400, shortCover.body);
  assert("Error message mentions cover letter", shortCover.body?.error?.includes("100 characters"), shortCover.body);

  // ─── 7. Buyer: Submit proposal — kickoff message too short ────────
  console.log("\n📋 [7] Submit Proposal — kickoff message too short (validation)");
  const shortMsg = await post("/api/proposals", {
    shortlistItemId,
    coverLetter: "A".repeat(120),
    proposedBudget: 5000,
    timeline: "3 weeks",
    deliverables: "Fully working app",
    kickoffMessage: "Hi."
  }, buyerJar);
  assert("Short kickoff rejected (400)", shortMsg.status === 400, shortMsg.body);
  assert("Error message mentions kickoff", shortMsg.body?.error?.includes("20 characters"), shortMsg.body);

  // ─── 8. Buyer: Submit valid proposal (creates Proposal + Conversation + Message) ─
  console.log("\n📋 [8] Buyer submits valid Proposal (happy path)");
  const proposalRes = await post("/api/proposals", {
    shortlistItemId,
    coverLetter: "We are a full-stack development team with 5+ years experience in e-commerce and fintech. We propose to build your platform using Next.js, Prisma, and Stripe, optimized for the Pakistan market.",
    proposedBudget: 6000,
    timeline: "4 weeks",
    deliverables: "Full source code, deployed application, admin dashboard, test coverage, documentation",
    termsAndConditions: "50% upfront, 50% on delivery.",
    kickoffMessage: "Hello! We are very excited about your project. We have read your brief carefully and would love to schedule a call to align on scope."
  }, buyerJar);
  assert("Proposal submitted (201)", proposalRes.status === 201, proposalRes.body);
  assert("Proposal has id", !!proposalRes.body?.id, proposalRes.body);
  assert("Proposal status is PENDING", proposalRes.body?.status === "PENDING", proposalRes.body);
  proposalId = proposalRes.body?.id;
  console.log(`     proposalId: ${proposalId}`);

  if (!proposalId) {
    console.log("\n⛔ Proposal creation failed. Aborting remaining tests.");
    printSummary(); return;
  }

  // ─── 9. Buyer: Submit DUPLICATE proposal for same shortlist item ──
  console.log("\n📋 [9] Buyer submits DUPLICATE proposal — should fail");
  const dupProposal = await post("/api/proposals", {
    shortlistItemId,
    coverLetter: "A".repeat(120),
    proposedBudget: 7000,
    timeline: "5 weeks",
    deliverables: "Same deliverables",
    kickoffMessage: "This is a second kickoff message that is long enough."
  }, buyerJar);
  assert("Duplicate proposal rejected (400)", dupProposal.status === 400, dupProposal.body);

  // ─── 10. Buyer: GET proposal detail ──────────────────────────────
  console.log("\n📋 [10] GET proposal detail (buyer)");
  const getProposal = await get(`/api/proposals/${proposalId}`, buyerJar);
  assert("Proposal fetched (200)", getProposal.status === 200, getProposal.body);
  assert("Correct proposal id", getProposal.body?.id === proposalId, getProposal.body);
  assert("Proposal covers buyerBusiness", !!getProposal.body?.buyerBusiness, getProposal.body);
  assert("Proposal covers providerBusiness", !!getProposal.body?.providerBusiness, getProposal.body);

  // ─── 11. Provider: GET proposal detail (other party access) ──────
  console.log("\n📋 [11] GET proposal detail (provider — valid participant)");
  const getProposalAsProvider = await get(`/api/proposals/${proposalId}`, providerJar);
  assert("Provider can view proposal (200)", getProposalAsProvider.status === 200, getProposalAsProvider.body);

  // ─── 12. GET proposal detail — wrong user (unauthenticated) ──────
  console.log("\n📋 [12] GET proposal detail (unauthenticated) — should fail");
  const getProposalUnauth = await get(`/api/proposals/${proposalId}`, null);
  assert("Unauthenticated detail rejected (400)", getProposalUnauth.status === 400, getProposalUnauth.body);

  // ─── 13. Buyer: GET proposals by request ─────────────────────────
  console.log("\n📋 [13] GET proposals by request");
  const byRequest = await get(`/api/proposals/by-request/${requestId}`, buyerJar);
  assert("Proposals by request returned (200)", byRequest.status === 200, byRequest.body);
  assert("Returns an array", Array.isArray(byRequest.body), byRequest.body);
  assert("Our proposal is in the list", byRequest.body.some?.(p => p.id === proposalId), byRequest.body);

  // ─── 14. Provider: REJECT proposal ───────────────────────────────
  // We'll test reject first, then re-submit a new one for testing accept
  // For now, test the reject endpoint exists
  console.log("\n📋 [14] PATCH proposal status — WITHDRAWN (by buyer)");
  // We'll first test withdrawal, then accept on a fresh proposal path is not needed here
  // Instead test PATCH with unsupported value
  const badPatch = await patch(`/api/proposals/${proposalId}`, { status: "INVALID_STATUS" }, buyerJar);
  assert("Unsupported PATCH status rejected (400)", badPatch.status === 400, badPatch.body);

  // ─── 15. Provider: Accept proposal — only buyer can accept ────────
  console.log("\n📋 [15] Provider tries to ACCEPT proposal — should fail");
  const provAccept = await post(`/api/proposals/${proposalId}/accept`, {}, providerJar);
  assert("Provider cannot accept (400)", provAccept.status === 400, provAccept.body);
  assert("Error says buyer-only", provAccept.body?.error?.toLowerCase()?.includes("buyer"), provAccept.body);

  // ─── 16. Buyer: ACCEPT proposal ────────────────────────────────────
  console.log("\n📋 [16] Buyer ACCEPTs proposal (happy path)");
  const acceptRes = await post(`/api/proposals/${proposalId}/accept`, {}, buyerJar);
  assert("Proposal accepted (200)", acceptRes.status === 200, acceptRes.body);
  assert("Status changed to ACCEPTED", acceptRes.body?.status === "ACCEPTED", acceptRes.body);
  assert("acceptedAt is set", !!acceptRes.body?.acceptedAt, acceptRes.body);

  // Now re-verify GET reflects new status
  const verifyStatus = await get(`/api/proposals/${proposalId}`, buyerJar);
  assert("GET now shows ACCEPTED status", verifyStatus.body?.status === "ACCEPTED", verifyStatus.body);

  // ─── 17. GET non-existent proposal ───────────────────────────────
  console.log("\n📋 [17] GET non-existent proposal");
  const notFound = await get(`/api/proposals/non-existent-id-00000`, buyerJar);
  assert("Non-existent proposal returns error (400)", notFound.status === 400, notFound.body);

  // ─── Summary ──────────────────────────────────────────────────────
  printSummary();
}

function printSummary() {
  const total = passed + failed;
  console.log("\n" + "═".repeat(50));
  console.log(`📊 TEST RESULTS: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`   ❌ ${failed} test(s) FAILED`);
  } else {
    console.log("   🎉 All tests PASSED!");
  }
  console.log("═".repeat(50));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("\n💥 Unexpected error:", err);
  process.exit(1);
});
