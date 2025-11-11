/**
 * OCR Helper using Tesseract.js
 * 
 * This file provides functions to extract text from receipt images
 * using Tesseract.js OCR library
 */

import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image file using OCR
 * @param imageFile - The image file (File object from input)
 * @returns Promise with extracted text
 */
export async function extractTextFromImage(
  imageFile: File
): Promise<string> {
  try {
    // Create a Tesseract worker
    const worker = await createWorker('eng'); // 'eng' for English language

    // Convert File to ImageData or use recognize method
    const { data } = await worker.recognize(imageFile);

    // Terminate the worker to free up resources
    await worker.terminate();

    return data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parses OCR text to extract expense information
 * Attempts to find title and amount from the extracted text
 * @param ocrText - The text extracted from OCR
 * @returns Object with parsed title and amount
 */
export function parseExpenseFromOCR(ocrText: string): {
  title: string;
  amount: number | null;
} {
  // Clean up the text
  const cleanedText = ocrText.trim().replace(/\s+/g, ' ');

  // Try to extract amount (look for currency patterns)
  // Matches patterns like: $123.45, 123.45, $123, etc.
  const amountRegex = /[\$€£]?\s*(\d+\.?\d{0,2})/g;
  const amountMatches = cleanedText.match(amountRegex);

  let amount: number | null = null;
  if (amountMatches && amountMatches.length > 0) {
    // Get the largest amount (usually the total)
    const amounts = amountMatches.map((match) => {
      const numStr = match.replace(/[\$€£\s]/g, '');
      return parseFloat(numStr);
    });
    amount = Math.max(...amounts);
  }

  // Extract title (first line or first few words)
  const lines = cleanedText.split('\n').filter((line) => line.trim().length > 0);
  const title = lines[0]?.substring(0, 50) || cleanedText.substring(0, 50) || 'Receipt';

  return {
    title: title.trim(),
    amount,
  };
}

