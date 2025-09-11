// server.js
import express from "express";

const app = express();
const PORT = 3001;

// Mock Shopee
app.get("/api/shopee/orders", (req, res) => {
  res.json([
    {
      orderId: "SHP12345",
      buyer: "João Silva",
      product: "Fone Bluetooth",
      status: "READY_TO_SHIP",
      address: "Rua A, Centro - Cidade X"
    },
    {
      orderId: "SHP67890",
      buyer: "Maria Oliveira",
      product: "Câmera HD",
      status: "WAITING_PICKUP",
      address: "Rua B, Bairro Y - Cidade X"
    }
  ]);
});

// Mock Mercado Livre
app.get("/api/ml/orders", (req, res) => {
  res.json([
    {
      orderId: "ML12345",
      buyer: "Carlos Souza",
      product: "Notebook Lenovo",
      status: "SHIPPED",
      address: "Av. Brasil, 123 - Cidade X"
    },
    {
      orderId: "ML67890",
      buyer: "Ana Pereira",
      product: "Smartphone Samsung",
      status: "DELIVERED",
      address: "Rua das Flores, 55 - Cidade X"
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
