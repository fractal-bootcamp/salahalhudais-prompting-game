import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fetch from 'node-fetch';

// Convert pipeline to promise
const streamPipeline = promisify(pipeline);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, filename } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    // Ensure directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const gameImagesDir = path.join(publicDir, 'game-images');
    const punsDir = path.join(gameImagesDir, 'puns');
    
    if (!fs.existsSync(punsDir)) {
      fs.mkdirSync(punsDir, { recursive: true });
    }

    // Save the image
    const imagePath = path.join(punsDir, path.basename(filename));
    const fileStream = fs.createWriteStream(imagePath);
    await streamPipeline(imageResponse.body, fileStream);

    // Return success response with image URL
    return NextResponse.json({
      success: true,
      imageUrl: `/game-images/puns/${path.basename(filename)}`,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 