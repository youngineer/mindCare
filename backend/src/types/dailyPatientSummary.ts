interface ISignificantMoodShift {
    time: Date;
    moodChange: string;
}

interface IMoodSnapshot {
    averageMood?: number;
    moodTrend?: 'improving' | 'declining' | 'stable' | 'volatile';
    significantMoodShifts?: ISignificantMoodShift[];
}

interface IConversationSummary {
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    keyThemes?: string[];
    distressSignalsDetected?: boolean;
    quotesOfInterest?: string[];
}

interface IProgressUpdate {
    riskLevelChange?: 'increased' | 'decreased' | 'stable';
    goalProgressNotes?: string;
    emergingConcerns?: string[];
}

interface ISelfHelpResource {
    title: string;
    reason: string;
}

interface IDailyRecommendations {
    suggestedTasks?: string[];
    discussionPointsForTherapist?: string[];
    selfHelpResources?: ISelfHelpResource[];
}

export interface IDailySummaryReport extends Document {
    patientId: string;
    reportDate: Date;
    moodSnapshot: IMoodSnapshot;
    conversationSummary: IConversationSummary;
    progressUpdate: IProgressUpdate;
    dailyRecommendations: IDailyRecommendations;
    overallSummary: string;
}