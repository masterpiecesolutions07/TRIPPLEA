import { connectDb } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import app from "./src/app.js";

await connectDb();
app.listen(env.port, () => {
  const address = env.publicUrl || `port ${env.port}`;
  console.log(`API listening on ${address}`);
});
