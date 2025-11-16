// const { Client } = require("pg");
// require("dotenv").config();
// const db = new Client({
//   connectionString: process.env.DB_URL,
// });

// db.connect()
//   .then(() => console.log("Connected to Neon DB"))
//   .catch((err) => console.error("DB connection error:", err));

require("dotenv").config();
const { ethers } = require("ethers");
const { Client } = require("pg");

// =====================================
// 1. SETUP NEON DB
// =====================================
const db = new Client({
  connectionString: process.env.DB_URL + "?sslmode=require",
});

async function connectDB() {
  await db.connect();
  console.log("Connected to Neon DB");
}

connectDB();

// =====================================
// 2. SETUP PROVIDER + CONTRACT
// =====================================
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require("./abi.json"); // <-- Put ABI file here

const registry = new ethers.Contract(contractAddress, contractABI, provider);

// =====================================
// 3. STORE LAST SYNCED BLOCK
// =====================================
let lastSyncedBlock = 0;

async function loadLastSynced() {
  const res = await db.query("SELECT block FROM indexer_state LIMIT 1;");
  if (res.rows.length === 0) {
    await db.query("INSERT INTO indexer_state (block) VALUES (0);");
    lastSyncedBlock = 0;
  } else {
    lastSyncedBlock = Number(res.rows[0].block);
  }
  console.log("Last synced block:", lastSyncedBlock);
}

async function updateLastSynced(blockNumber) {
  await db.query("UPDATE indexer_state SET block = $1;", [blockNumber]);
}

// Run at startup
loadLastSynced();

// =====================================
// 4. EVENT HANDLERS
// =====================================

// ------- ProjectSubmitted(projectId, owner, name, fundingGoal)
registry.on(
  "ProjectSubmitted",
  async (projectId, owner, name, fundingGoal, event) => {
    console.log("📌 ProjectSubmitted:", projectId.toString());

    await db.query(
      `
      INSERT INTO projects (
        id, owner, name, description, category, logo_url,
        funding_goal, submission_date, status, total_funds_raised, total_predictions
      )
      VALUES ($1, $2, $3, '', '', '', $4, EXTRACT(EPOCH FROM NOW()), 'Active', 0, 0)
      ON CONFLICT (id) DO NOTHING;
    `,
      [projectId.toString(), owner, name, fundingGoal.toString()]
    );

    await updateLastSynced(event.blockNumber);
  }
);

// ------- MilestoneAdded(projectId, milestoneId, description, targetDate)
registry.on(
  "MilestoneAdded",
  async (projectId, milestoneId, description, targetDate, event) => {
    console.log("📌 MilestoneAdded:", milestoneId.toString());

    await db.query(
      `
      INSERT INTO milestones (
        id, project_id, description, target_date,
        is_resolved, outcome_achieved, resolution_date
      )
      VALUES ($1, $2, $3, $4, false, false, null)
      ON CONFLICT (id) DO NOTHING;
      `,
      [
        milestoneId.toString(),
        projectId.toString(),
        description,
        targetDate.toString(),
      ]
    );

    await updateLastSynced(event.blockNumber);
  }
);

// ------- MilestoneResolved(projectId, milestoneId, outcomeAchieved)
registry.on(
  "MilestoneResolved",
  async (projectId, milestoneId, outcomeAchieved, event) => {
    console.log("📌 MilestoneResolved:", milestoneId.toString());

    await db.query(
      `
      UPDATE milestones SET
        is_resolved = true,
        outcome_achieved = $1,
        resolution_date = EXTRACT(EPOCH FROM NOW())
      WHERE id = $2;
      `,
      [outcomeAchieved, milestoneId.toString()]
    );

    await updateLastSynced(event.blockNumber);
  }
);

// ------- ProjectStatusUpdated(projectId, oldStatus, newStatus)
registry.on(
  "ProjectStatusUpdated",
  async (projectId, oldStatus, newStatus, event) => {
    console.log("📌 ProjectStatusUpdated:", projectId.toString(), newStatus);

    await db.query(
      `
      UPDATE projects SET
        status = $1
      WHERE id = $2;
      `,
      [newStatus, projectId.toString()]
    );

    await updateLastSynced(event.blockNumber);
  }
);

// ------- FundsRaised(projectId, amount, totalRaised)
registry.on("FundsRaised", async (projectId, amount, totalRaised, event) => {
  console.log("📌 FundsRaised:", projectId.toString());

  await db.query(`UPDATE projects SET total_funds_raised = $1 WHERE id = $2;`, [
    totalRaised.toString(),
    projectId.toString(),
  ]);

  await updateLastSynced(event.blockNumber);
});

// ------- Predictions increment
// registry.on("IncrementPredictions", async (projectId, event) => {
//   console.log("📌 Prediction Added:", projectId.toString());

//   await db.query(
//     `UPDATE projects SET total_predictions = total_predictions + 1 WHERE id = $1;`,
//     [projectId.toString()]
//   );

//   await updateLastSynced(event.blockNumber);
// });

// =====================================
// 5. LIVE BLOCK SYNC LOOP
// =====================================
async function runSyncLoop() {
  console.log("⏳ Indexer running...");

  provider.on("block", async (blockNumber) => {
    console.log("🔍 New block:", blockNumber);
  });
}

runSyncLoop();
