import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export default async function POST(req: NextRequest, res: NextResponse) {
  try {
    const form = new formidable.IncomingForm();

    await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    const { video } = files;

    const recording = await prisma.recording.create({
      data: {
        title: "Recording Title", // Replace with appropriate title
        videoUrl: `/path/to/recordings/${video.name}`,
        userId: "user123", // Replace with actual user ID
      },
    });

    const newPath = `/path/to/recordings/${video.name}`;
    await fs.rename(video.path, newPath);

    // res.status(201).json({ recording });

    NextResponse.json(
      {
        recording,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    NextResponse.json(
      {
        error,
      },
      {
        status: 400,
      }
    );
  }
}
