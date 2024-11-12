// src/scripts/train-model.ts
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const dotenv = require('dotenv');
const nodeFetch = require('node-fetch');
const NodeAbortController = require('node-abort-controller');

// Import type only for fetch Response
import type { Response } from 'node-fetch';

// Load environment variables first, before any checks
dotenv.config({ path: '.env.local', override: true });

interface MindsDBResponse {
  status: 'success' | 'error';
  error_message?: string;
}

interface PDFData {
  text: string;
  info: Record<string, any>;
  metadata: Record<string, any>;
  version: string;
  numpages: number;
}

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body: string;
  signal?: AbortSignal;
}

const PDF_PARSE_OPTIONS = {
  pagerender: undefined as undefined,
  max: 0,
  version: 'v2.0.550'
};

// Rest of the code remains the same but use nodeFetch instead of fetch
async function fetchWithRetry(url: string, options: FetchOptions, retries = 3, timeout = 30000): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new NodeAbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await nodeFetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return response;
    } catch (err) {
      lastError = err as Error;
      console.error(`Attempt ${i + 1} failed:`, lastError.message);
      
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // exponential backoff
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

async function trainModel(): Promise<void> {
  try {
    // Debug: Print environment status
    const envPath = path.join(process.cwd(), '.env.local');
    console.log('Reading .env.local from:', envPath);
    const envContent = await fs.readFile(envPath, 'utf8');
    console.log('Raw .env.local content:', envContent);

    const MINDSDB_API_ENDPOINT = 'https://cloud.mindsdb.com/api/sql/query';
    const MINDSDB_KEY = process.env.MINDSDB_RC_KEY;
    const TOGETHER_KEY = process.env.TOGETHER_API_KEY;

    console.log('\nEnvironment variables loaded:');
    console.log('MINDSDB_RC_KEY:', MINDSDB_KEY ? '✓ Present' : '✗ Missing');
    console.log('TOGETHER_API_KEY:', TOGETHER_KEY ? '✓ Present' : '✗ Missing');

    if (!MINDSDB_KEY) {
      throw new Error('MINDSDB_RC_KEY is not defined in environment variables');
    }

    if (!TOGETHER_KEY) {
      throw new Error('TOGETHER_API_KEY is not defined in environment variables');
    }

    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    console.log('Looking for PDFs in:', pdfDir);
    
    let files: string[];
    try {
      files = await fs.readdir(pdfDir);
    } catch (error) {
      console.error('Error accessing pdfs directory:', error);
      throw new Error('public/pdfs directory not found. Please ensure the directory structure is correct.');
    }
    
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    console.log(`Found ${pdfFiles.length} PDF files to process:`, pdfFiles);
    
    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in public/pdfs directory');
    }

    // Set up database
    console.log('Setting up database...');
    try {
      const setupQuery = `
        CREATE PROJECT IF NOT EXISTS forms_project;
        CREATE DATABASE IF NOT EXISTS forms_project.files_database;
        CREATE TABLE IF NOT EXISTS forms_project.files_database.pdf_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255),
          text_content TEXT,
          file_path VARCHAR(512),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const setupResponse = await fetchWithRetry(MINDSDB_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MINDSDB_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: setupQuery }),
      });

      const setupResult = await setupResponse.json();
      console.log('Database setup response:', setupResult);
    } catch (error) {
      console.error('Database setup error:', error);
      throw error;
    }

    // Process PDFs
    for (const file of pdfFiles) {
      try {
        console.log(`Processing ${file}...`);
        const filePath = path.join(pdfDir, file);
        const dataBuffer = await fs.readFile(filePath);

        // Parse PDF
        const pdfData = await pdfParse(dataBuffer, PDF_PARSE_OPTIONS) as PDFData;
        
        const cleanText = pdfData.text
          .replace(/'/g, "''")
          .replace(/[\r\n]+/g, ' ')
          .trim();

        const insertQuery = `
          INSERT INTO forms_project.files_database.pdf_files (
            filename,
            text_content,
            file_path
          ) VALUES (
            '${file}',
            '${cleanText}',
            '${filePath.replace(/'/g, "''")}'
          );
        `;

        const response = await fetchWithRetry(MINDSDB_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MINDSDB_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: insertQuery }),
        });

        console.log(`Successfully processed ${file}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        continue;
      }
    }

    // Create model
    console.log('Creating Llama 3.2 Vision model...');
    const createModelQuery = `
      CREATE MODEL IF NOT EXISTS forms_project.forms_due_dates
      PREDICT due_date
      USING ENGINE = 'together',
      MODEL_NAME = 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      API_KEY = '${TOGETHER_KEY}';
    `;

    const createModelResponse = await fetchWithRetry(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSDB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createModelQuery }),
    });

    // Train model
    console.log('Training model...');
    const trainQuery = `
      RETRAIN forms_project.forms_due_dates
      FROM forms_project.files_database.pdf_files
      USING text_content;
    `;

    const trainResponse = await fetchWithRetry(MINDSDB_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSDB_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: trainQuery }),
    });

    console.log('Model training started successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Execute the training
trainModel().catch(console.error);