import express from "express";
import { authMiddleware } from "./middlewares/middleware";
import { prismaClient } from "db/client";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/website", authMiddleware, async (req, res) => {
  const data = await prismaClient.website.create({
    data: {
      url: req.body.url,
      userId: req.userId!,
    },
  });

  res.json({ id: data.id });
});

app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
  const websiteId = req.query.websiteId as string;
  const userId = req.userId!;
  const data = await prismaClient.website.findFirst({
    where: { id: websiteId, userId: userId },
    include: { ticks: true },
  });

  res.json(data);
});

app.get("/api/v1/websites", authMiddleware, async (req, res) => {
  const websites = await prismaClient.website.findMany({
    where: { userId: req.userId },
    include:{ticks:true}
  });
  res.json({ websites });
});

app.delete("/api/v1/website", authMiddleware, async (req, res) => {
  const websiteId = req.query.websiteId as string;
  const userId = req.userId!;
  const data = await prismaClient.website.delete({
    where: { id: websiteId, userId: userId },
  });
  res.json({
    message: "Website deleted successfully",
    id: data.id,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
