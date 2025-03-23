"use client";
// import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Website {
  id: string;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[];
}

export function useWebsites() {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  async function refreshWebsites() {
    const token = await getToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/websites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setWebsites(response.data.websites);
  }

  useEffect(() => {
    refreshWebsites();

    const interval = setInterval(
      () => {
        refreshWebsites();
      },
      1000 * 60 * 3
    );

    return () => clearInterval(interval);
  }, []);

  return { websites, refreshWebsites };
}

// `
// give me the dashboard page for  a better uptime like platform
// which shows the website that i have ,if i click on them an accordian
// should open and i should see the uptime ticks for the last 30 minutes(
// 10 lines red or green ).I should also see the overall status in a circle (red or green)

// `
