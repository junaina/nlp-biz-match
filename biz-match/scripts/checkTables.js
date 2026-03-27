const { Client } = require("pg");

const conn = "postgresql://postgres:ditchtheweatherapp@db.krsytinnruhylcvglfzp.supabase.co:5432/postgres";

(async () => {
  const client = new Client({
    connectionString: conn,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('Proposal','Conversation','Message');"
  );
  console.log(res.rows);
  await client.end();
})();
