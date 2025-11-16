require("dotenv").config();
const { ethers } = require("ethers");
const { Client } = require("pg");

// ----------------------------
// Neon DB Setup
// ----------------------------
const db = new Client({
  connectionString: process.env.DB_URL,
});

db.connect()
  .then(() => console.log("✅ Connected to Neon DB"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ----------------------------
// Provider & Contract Setup
// ----------------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const registryAddress = process.env.CONTRACT_ADDRESS;
const registryABI = require("./abi.json"); // ABI from compilation
const registry = new ethers.Contract(registryAddress, registryABI, provider);

// ----------------------------
// Last synced block tracking
// ----------------------------
let lastSyncedBlock = parseInt(process.env.LAST_SYNCED_BLOCK) || 0;

// ----------------------------
// Safe queryFilter with retries
// ----------------------------
async function safeQueryFilter(eventName, fromBlock, toBlock, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await registry.queryFilter(eventName, fromBlock, toBlock);
    } catch (err) {
      console.log(
        `⚠️ Error fetching ${eventName} from ${fromBlock} to ${toBlock}, retry ${
          i + 1
        }: ${err.message}`
      );
      await new Promise((r) => setTimeout(r, 3000 * (i + 1))); // exponential backoff
    }
  }
  throw new Error(`Failed to fetch ${eventName} after ${retries} retries`);
}

// ----------------------------
// Backfill function
// ----------------------------
async function backfillEvents(fromBlock, toBlock) {
  console.log(`⏳ Backfilling events from block ${fromBlock} to ${toBlock}...`);

  // --- ProjectSubmitted ---
  const projectEvents = await safeQueryFilter(
    "ProjectSubmitted",
    fromBlock,
    toBlock
  );
  for (const e of projectEvents) {
    const { projectId, owner, name, fundingGoal } = e.args;
    await db.query(
      `INSERT INTO projects (id, owner, name, description, category, logo_url, funding_goal, submission_date, status, total_funds_raised, total_predictions)
       VALUES ($1, $2, $3, '', '', '', $4, EXTRACT(EPOCH FROM NOW()), 'Active', 0, 0)
       ON CONFLICT (id) DO NOTHING;`,
      [projectId.toString(), owner, name, fundingGoal.toString()]
    );
  }

  // --- MilestoneAdded ---
  const milestoneEvents = await safeQueryFilter(
    "MilestoneAdded",
    fromBlock,
    toBlock
  );
  for (const e of milestoneEvents) {
    const { projectId, milestoneId, description, targetDate } = e.args;
    await db.query(
      `INSERT INTO milestones (id, project_id, description, target_date, is_resolved, outcome_achieved, resolution_date)
       VALUES ($1, $2, $3, $4, false, false, null)
       ON CONFLICT (id) DO NOTHING;`,
      [
        milestoneId.toString(),
        projectId.toString(),
        description,
        targetDate.toString(),
      ]
    );
  }

  // --- MilestoneResolved ---
  const resolvedEvents = await safeQueryFilter(
    "MilestoneResolved",
    fromBlock,
    toBlock
  );
  for (const e of resolvedEvents) {
    const { milestoneId, outcomeAchieved } = e.args;
    await db.query(
      `UPDATE milestones SET is_resolved = true, outcome_achieved = $1, resolution_date = EXTRACT(EPOCH FROM NOW()) WHERE id = $2;`,
      [outcomeAchieved, milestoneId.toString()]
    );
  }

  // --- ProjectStatusUpdated ---
  const statusEvents = await safeQueryFilter(
    "ProjectStatusUpdated",
    fromBlock,
    toBlock
  );
  for (const e of statusEvents) {
    const { projectId, newStatus } = e.args;
    await db.query(`UPDATE projects SET status = $1 WHERE id = $2;`, [
      newStatus,
      projectId.toString(),
    ]);
  }

  // --- FundsRaised ---
  const fundsEvents = await safeQueryFilter("FundsRaised", fromBlock, toBlock);
  for (const e of fundsEvents) {
    const { projectId, totalRaised } = e.args;
    await db.query(
      `UPDATE projects SET total_funds_raised = $1 WHERE id = $2;`,
      [totalRaised.toString(), projectId.toString()]
    );
  }

  console.log(`✅ Backfill complete from block ${fromBlock} to ${toBlock}`);
}

// ----------------------------
// Run backfill in small chunks
// ----------------------------
async function runBackfill() {
  const currentBlock = await provider.getBlockNumber();
  const CHUNK = 20; // safe small chunk to avoid rate limits

  for (let start = lastSyncedBlock + 1; start <= currentBlock; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, currentBlock);
    await backfillEvents(start, end);
    lastSyncedBlock = end;
    console.log(`⏱ Last synced block updated to ${lastSyncedBlock}`);
    await new Promise((r) => setTimeout(r, 10000)); // slight delay between chunks
  }
}

// ----------------------------
// Live block listener
// ----------------------------
function startLiveIndexer() {
  provider.on("block", async (blockNumber) => {
    console.log(`🔍 New block: ${blockNumber}`);
    try {
      await backfillEvents(blockNumber, blockNumber);
      lastSyncedBlock = blockNumber;
    } catch (err) {
      console.error(
        `❌ Live indexing error at block ${blockNumber}:`,
        err.message
      );
    }
  });
}

// ----------------------------
// Main
// ----------------------------
(async () => {
  try {
    await runBackfill();
    startLiveIndexer();
    console.log("🚀 Indexer running...");
  } catch (err) {
    console.error("❌ Indexer error:", err);
  }
})();
