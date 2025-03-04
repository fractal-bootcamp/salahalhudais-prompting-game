import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imagePath, originalPrompt, userPrompt } = req.body;

    if (!imagePath || !originalPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Read the image file from the public directory
    const publicPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
    
    if (!fs.existsSync(publicPath)) {
      return res.status(404).json({ error: `Image not found at path: ${publicPath}` });
    }
    
    const imageBuffer = fs.readFileSync(publicPath);
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('image_bytes', imageBuffer, {
      filename: path.basename(publicPath),
      contentType: `image/${path.extname(publicPath).substring(1)}`,
    });
    formData.append('original_prompt', originalPrompt);
    formData.append('user_prompt', userPrompt);
    
    // Try with FormData
    try {
      const modalUrl = 'https://modal.com/apps/onepercentbetter/main/deployed/clip-similarity';
      console.log('Sending FormData request to Modal API');
      
      const response = await fetch(modalUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Modal API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        return res.status(200).json(result);
      } else {
        const errorText = await response.text();
        console.error('Modal API error response:', errorText);
        
        // If FormData approach fails, try with base64 encoding
        console.log('Trying with base64 encoding');
        const base64Image = imageBuffer.toString('base64');
        
        const jsonResponse = await fetch(modalUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_base64: base64Image,
            original_prompt: originalPrompt,
            user_prompt: userPrompt
          })
        });
        
        if (jsonResponse.ok) {
          const result = await jsonResponse.json();
          return res.status(200).json(result);
        } else {
          const jsonErrorText = await jsonResponse.text();
          console.error('Modal API JSON error response:', jsonErrorText);
          return res.status(jsonResponse.status).json({ error: jsonErrorText });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error calling Modal API:', error.message);
      } else {
        console.error('Unknown error calling Modal API:', error);
      }
      return res.status(500).json({ error: 'Failed to call Modal API', details: error instanceof Error ? error.message : error });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in clip-similarity API route:', error.message);
    } else {
      console.error('Unknown error in clip-similarity API route:', error);
    }
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : error });
  }
} 