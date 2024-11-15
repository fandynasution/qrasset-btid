import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import assetRoutes from './routes/assetRoutes';
import { setupSwagger } from "./swagger"; // Ensure this path is correct
import { checkDbConnection } from "./lib/db";
import os from 'os';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 9077;

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
      if (!iface) continue; // Skip if iface is undefined
      for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
              return alias.address;
          }
      }
  }
  return 'localhost'; // Default to localhost if IP cannot be found
};

app.use(cors({ origin: "*" }));
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Define routes
app.use('/api/qrasset', express.static(path.join(__dirname, 'storage')));
app.use("/api", assetRoutes);

// Start the server
app.listen(port, async () => {
  await checkDbConnection();
  const host = getLocalIP();
  console.log(`Server is running on http://${host}:${port}`);
});
