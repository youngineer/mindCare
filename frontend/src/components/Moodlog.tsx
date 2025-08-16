import { useState } from 'react'
import Chart from './Chart'
import { handleMoodSubmit } from '../services/patientServices';
import type { IAlertProps } from '../types/common';
import MoodSlider from './MoodSlider';

const Moodlog = () => {
  const [moodLevel, setMoodLevel] = useState<string>('0');
  const [alert, setAlert] = useState<IAlertProps>({
    display: false,
    message: "",
    isSuccess: false
  });
  const handleSubmit = async () => {
    try {
      const response = await handleMoodSubmit(moodLevel);
      console.log(response);
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className='flex justify-center'>
      <Chart />
      <div className="w-full max-w-xs">
        <MoodSlider />
        <button
          className="btn btn-primary btn-wide mt-6 text-lg"
          onClick={handleSubmit}
        >
          Submit Mood
        </button>
      </div>
    </div>
  )
}

export default Moodlog