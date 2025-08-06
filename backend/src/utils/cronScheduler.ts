import cron from 'node-cron';
import User from '../models/User.js';
import MoodEntry from '../models/MoodEntry.js';
import ChatBotLog from '../models/ChatBotLog.js';
import DailySummaryReport from '../models/PatientAnalysis.js';
import { PATIENT_DAILY_SUMMARY_PROMPT } from './constants.js';
import { getAiResponse } from './aiResponse.js';

// Generate patient daily summary at 03.11 AM everyday
export const generateReports = cron.schedule("27 20 * * *", async() => {
    console.log("report gen started")
    try {
        getPatientIds();
    } catch (error) {
        console.error(error);
    }
});


export async function getPatientIds(): Promise<void> {
    try {
        console.log("generating now");
        const allPatientIds = await User.find({role: "patient"}, "_id");
        for(const entity of allPatientIds) {
            const patientId = entity._id as string;
            console.log(patientId)
            const patientSummary = await generateSummary(patientId);
            if(!patientSummary) continue;

            const summary = new DailySummaryReport({
                patientId: patientId,
                moodSnapshot: patientSummary?.moodSnapshot,
                conversationSummary: patientSummary?.conversationSummary,
                progressUpdate: patientSummary?.progressUpdate,
                dailyRecommendations: patientSummary?.dailyRecommendations,
                overallSummary: patientSummary?.overallSummary
            });

            const savedSummary = await summary.save();
            if(!savedSummary) throw new Error("Error saving the report");
            console.log(savedSummary);
        }
        
    } catch (error) {
        console.error(error);
    }
};


export async function generateSummary(patientId: string): Promise<any> {
    try {
        let prompt = PATIENT_DAILY_SUMMARY_PROMPT;
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        // Mood logs
        const moodLogsToday = await MoodEntry.find({ 
            patientId: patientId,
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        }, "moodLevel");
        const moodLevels = moodLogsToday.map(log => log?.moodLevel);
        if (moodLevels.length > 0) prompt += "\n\nToday's patient mood logs: " + moodLevels.join(", ");

        // Chat messages
        const chatEntries = await ChatBotLog.find({
            userId: patientId,
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        }, "userMessage");
        const messages = chatEntries.map(entry => entry.userMessage);
        if (messages.length > 0) prompt += "\n\nToday's patient chat messages: " + messages.join(" | ");

        const previousReportModel = await DailySummaryReport.find({ patientId }).sort({ _id: -1 }).limit(1);
        if (previousReportModel && previousReportModel.length > 0) {

            const previousReport = previousReportModel[0].toObject();
            prompt += "\n\nPrevious daily summary report: " + JSON.stringify({
                reportDate: previousReport.createdAt,
                moodSnapshot: previousReport.moodSnapshot,
                conversationSummary: previousReport.conversationSummary,
                progressUpdate: previousReport.progressUpdate,
                dailyRecommendations: previousReport.dailyRecommendations,
                overallSummary: previousReport.overallSummary
            });
        }

        const report = await getAiResponse(prompt);
        return report;
    } catch (error) {
        console.error(error);
    }
}