import { Schema, model } from 'mongoose';
import validator from 'validator';
import { ISelfCareTask } from '../types/task.js';
import User from './User.js';


const selfCareTaskSchema = new Schema<ISelfCareTask>({
    patientId: {
        type: String,
        required: true,
        ref: User,
    },
    therapistId: {
        type: String,
        required: true,
        ref: User,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "Please engage in this task honestly"
    },
    priority: {
        type: String,
        required: true,
        trim: true,
        enum:  ["high", "low", "medium"],
        message: '{VALUE} is not supported'
    },
    dueDate: {
        type: Date,
        required: true,
        validate(value: string) {
            const today = new Date();
            const inputDate = new Date(value);

            if (!validator.isDate(value)) {
                throw new Error("Invalid date");
            }
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (inputDate <= yesterday) {
                throw new Error("Date must be greater than yesterday");
            }
        }
    },
    status: {
        type: String,
        trim: true,
        default: "assigned",
        enum: {
            values: ["assigned", "in-progress", "pending"],
            message: `{VALUE} invalid`
        }
    }
},
{ timestamps: true });

const SelfCareTask = model('SelfCareTask', selfCareTaskSchema);

export default SelfCareTask;