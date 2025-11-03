import { response } from "express";
import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";
import OpenAI from "openai";

export const enhanceProfessionalSummary = async(req,res) =>{
    try{
        const { userContent } = req.body;
        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing . Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    }catch(error){
        return res.status(400).json({message: error.message})
    }
}



export const enhanceJobDescription = async(req, res) =>{
    try{
        const { userContent } = req.body;
        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing . Your task is to enhance the job description of a resume. The job description should be 1-2 sentences also highlighting key responsibilities, and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    }catch(error){
        return res.status(400).json({message: error.message})
    }
}


export const uploadResume = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("User ID:", req.userId);
    console.log("Model:", process.env.OPENAI_MODEL);

    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const systemPrompt = "You are an expert AI agent to extract data from resume";
    const userPrompt = `extract data from this resume: ${resumeText}
     Provide data in the following JSON format with no additional text before or after: 

     {
        professional_summary: {type: String , default: ''},
        skills: [{ type: String }],
        personal_info: {
            image: {type: String, default: ''},
            full_name: {type: String, default: ''},
            profession: {type: String, default: ''},
            email: {type: String, default: ''},
            phone: {type: String, default: ''},
            location: {type: String, default: ''},
            linkedin: {type: String, default: ''},
            website: {type: String, default: ''},
        },
        experience: [
            {
                company: {type: String},
                position: {type: String},
                start_date: {type: String},
                end_date: {type: String},
                description: {type: String},
                is_current: {type: Boolean},
            }
        ],
        project: [
            {
                name: {type: String},
                type: {type: String},
                description: {type: String},
            }
        ],
        education: [
            {
                institution: {type: String},
                degree: {type: String},
                field: {type: String},
                graduation_date: {type: String},
                gpa: {type: String},
            }
        ],

    }
     `
const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    console.log("AI Response:", response);

    let extractedData = response.choices[0].message.content;

// 🧹 Remove Markdown-style code fences if present
extractedData = extractedData.replace(/```json|```/g, '').trim();

let parsedData;
try {
  parsedData = JSON.parse(extractedData);
} catch (err) {
  console.error(" Invalid JSON from AI:", extractedData);
  throw new Error("AI returned invalid JSON");
}

    const newResume = await Resume.create({ userId, title, ...parsedData });

    res.json({ resumeId: newResume._id });

  } catch (error) {
    console.error("Error in uploadResume:", error);
    return res.status(500).json({ message: error.message });
  }
}