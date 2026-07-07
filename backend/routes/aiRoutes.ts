import express from 'express';
import axios from 'axios';
import { protect, managerOnly } from '../middleware/auth';
import WeeklyReport from '../models/WeeklyReport';

const router = express.Router();

router.post('/chat', protect, managerOnly, async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch recent reports with proper population
    const recentReports = await WeeklyReport.find()
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(15);

    // Format context for AI
    const reportsContext = recentReports.map(r => ({
      member: (r.user as any)?.name || 'Unknown',
      project: (r.project as any)?.name || 'Unknown',
      week: r.weekStartDate.toISOString().split('T')[0],
      tasksCompleted: Array.isArray(r.tasksCompleted) 
        ? r.tasksCompleted.join(', ') 
        : String(r.tasksCompleted || ''),
      tasksPlanned: r.tasksPlanned,
      blockers: r.blockers || 'None',
      hoursWorked: r.hoursWorked || 0,
      status: r.status
    }));

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful team management assistant for Sisenco Digital.
You have access to the following recent weekly reports data:

${JSON.stringify(reportsContext, null, 2)}

Use this real data to answer questions accurately about team activity, blockers, workload, and progress.` 
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 700
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error: any) {
    console.error("Groq API Error:", error.response?.data || error.message);
    res.status(500).json({ reply: "Sorry, I'm having trouble right now. Please try again." });
  }
});

export default router;