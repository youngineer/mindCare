import { model, Schema } from "mongoose";
import { IDailySummaryReport } from "../types/dailyPatientSummary.js";

const DailySummaryReportSchema: Schema<IDailySummaryReport> = new Schema({
    patientId: {
        type: String,
        ref: 'User', 
        required: true,
        index: true
    },
    moodSnapshot: {
        averageMood: { type: Number }, // Average of moodLevel for the day
        moodTrend: { type: String, enum: ['improving', 'declining', 'stable', 'volatile'] }, // Comparison to previous day
        significantMoodShifts: [{
            time: { type: Date },
            moodChange: { type: String } // e.g., "Sharp drop from 8 to 3"
        }]
    },
    // Key insights extracted from the patient's chat logs for the day.
    conversationSummary: {
        sentiment: { type: String, enum: ['positive', 'negative', 'neutral', 'mixed'] },
        keyThemes: [{ type: String }], // e.g., ["anxiety about work", "family conflict"]
        distressSignalsDetected: { type: Boolean, default: false },
        quotesOfInterest: [{ type: String }] // Direct quotes that are clinically significant
    },
    // A comparative analysis against yesterday's full report.
    progressUpdate: {
        riskLevelChange: { type: String, enum: ['increased', 'decreased', 'stable'] },
        goalProgressNotes: { type: String }, // e.g., "Made progress on 'practice mindfulness' goal."
        emergingConcerns: [{ type: String }] // New issues not present in yesterday's report
    },
    // Actionable recommendations for the patient for the next 24 hours.
    dailyRecommendations: {
        suggestedTasks: [{ type: String }], // e.g., "Try a 5-minute breathing exercise."
        discussionPointsForTherapist: [{ type: String }], // Topics the therapist should review
        selfHelpResources: [{
            title: { type: String },
            reason: { type: String } // Why this resource is recommended today
        }]
    },
    // The final, human-readable summary text.
    overallSummary: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const DailySummaryReport = model<IDailySummaryReport>('DailySummaryReport', DailySummaryReportSchema);

export default DailySummaryReport;
