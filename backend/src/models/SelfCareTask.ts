import { Schema, model } from 'mongoose';
import validator from 'validator';
import { ISelfCareTask } from '../types/task.js';


const selfCareTaskSchema = new Schema<ISelfCareTask>({
    patientId: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        validate(value: string) {
            if(!validator.isAlphanumeric(value)) {
                throw new Error("Invalid description");
            }
        }
    },
    priority: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ["high", "low"],
            message: '{VALUE} is not supported'
        }
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
        default: "pending",
        trim: true,
        enum: {
            values: ["high", "low"],
            message: `{VALUE} invalid`
        }
    },
    assignedBy: {
        type: Number,
        required: true
    }
},
{ timestamps: true });

const SelfCareTask = model('SelfCareTask', selfCareTaskSchema);

export default SelfCareTask;