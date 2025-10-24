import imageKit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;
    const newResume = await Resume.create({ userId, title });
    return res.status(201).json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const deletedResume = await Resume.findOneAndDelete({ userId, _id: resumeId });
    if (!deletedResume) return res.status(404).json({ message: "Resume not found" });
    return res.status(200).json({ message: "Resume deleted successfully", resume: deletedResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    const { __v, createdAt, updatedAt, ...resumeData } = resume.toObject();
    return res.status(200).json({ resume: resumeData });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findOne({ public: true, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;
    let resumeDataCopy = JSON.parse(resumeData);

    if (image) {
      const imageBufferData = fs.createReadStream(image.path);
      const response = await imageKit.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: [
          {
            width: 300,
            height: 300,
            focus: "face",
            zoom: "0.75",
            effect: removeBackground ? "bgremove" : undefined,
          },
        ],
      });
      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
