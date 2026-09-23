import "dotenv/config";
import { seed } from "./seed";

seed().then(() => {
  console.log("Seed done");
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
