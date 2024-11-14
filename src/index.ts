import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import assetRoutes from './routes/assetRoutes';
// import authRoutes from "./routes/auth";
// import { authenticateToken } from "./middleware/authMiddleware";
import { setupSwagger } from "./swagger"; // Ensure this path is correct
// import icErpReceiptRoutes from "./routes/icErpReceipt";
import { checkDbConnection } from "./lib/db";
import os from 'os';

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
// app.use("/auth", authRoutes);
app.use("/qrasset", assetRoutes);
// app.use("/ic_receipt", authenticateToken, icErpReceiptRoutes);

// Start the server
app.listen(port, async () => {
  await checkDbConnection();
  const host = getLocalIP();
  console.log(`Server is running on http://${host}:${port}`);
});
