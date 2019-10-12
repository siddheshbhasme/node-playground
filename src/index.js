import 'dotenv/config';
import express from 'express';
import router from "./routes";

const app = express();

app.use(router);

app.listen(process.env.PORT, () =>
  console.log(`Metadata service listening on port ${process.env.PORT}!`),
);

export default app;