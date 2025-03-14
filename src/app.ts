import express from 'express';
import dotenv from 'dotenv';

// Initialize dotenv for environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Import Routes
import telexConfigRoute from './routes/integrationRouter'
import targetUrlRoute from './routes/targetUrlRouter'

// Middleware to parse JSON
app.use(express.json());
app.use('/api/v1', telexConfigRoute)
app.use('/api/v1', targetUrlRoute)

// Default routes
app.get('/', (req, res) => {
  res.send('Telex Profile Icon Agent');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
