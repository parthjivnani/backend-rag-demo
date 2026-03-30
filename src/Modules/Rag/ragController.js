import { OpenAI } from 'openai';
import 'dotenv/config';
import { getPool } from '../../config/db.js';
import { sqlGeneratorPrompt, answerGeneratorPrompt } from './prompt.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class RagController {

  ask = async (req, res) => {
    try {
      const { question } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'Please provide a valid question.' });
      }

      // Step 1: Generate SQL from the user's question
      const sqlResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        messages: [
          { role: 'system', content: sqlGeneratorPrompt },
          { role: 'user', content: question.trim() }
        ]
      });

      const generatedSQL = sqlResponse.choices[0].message.content.trim();
      console.log('Generated SQL:', generatedSQL);

      // If the model says it can't answer
      if (generatedSQL === 'CANNOT_ANSWER') {
        return res.json({
          answer: "Sorry, I can't answer that question based on the available data.",
          sql: null,
          data: null
        });
      }

      // Step 2: Validate — only allow SELECT
      const normalised = generatedSQL.replace(/\s+/g, ' ').toUpperCase().trim();
      const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'];
      for (const keyword of forbidden) {
        if (normalised.startsWith(keyword) || normalised.includes(` ${keyword} `)) {
          return res.json({
            answer: 'I can only answer read-only questions about the data. Modifications are not allowed.',
            sql: null,
            data: null
          });
        }
      }

      if (!normalised.startsWith('SELECT')) {
        return res.json({
          answer: 'I could not generate a valid query for your question. Please try rephrasing.',
          sql: null,
          data: null
        });
      }

      // Step 3: Execute the SQL query
      const pool = getPool();
      const [rows] = await pool.query(generatedSQL);
      console.log('Query result rows:', rows.length);

      // Step 4: Send results to OpenAI for a natural language answer
      const answerResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        messages: [
          { role: 'system', content: answerGeneratorPrompt },
          {
            role: 'user',
            content: `Question: ${question}\n\nSQL Query: ${generatedSQL}\n\nResult:\n${JSON.stringify(rows, null, 2)}`
          }
        ]
      });

      const answer = answerResponse.choices[0].message.content.trim();

      return res.json({
        answer,
        sql: generatedSQL,
        data: rows
      });

    } catch (error) {
      console.error('RAG Error:', error);

      // Handle SQL execution errors gracefully
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_PARSE_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
        return res.json({
          answer: 'I had trouble querying the database for your question. Please try rephrasing.',
          sql: null,
          data: null
        });
      }

      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}
