import React, { useState } from "react";

const MoodSlider = () => {
  const [moodLevel, setMoodLevel] = useState<string>("1"); // Initial value for moodLevel

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMoodLevel(event.target.value);
  };

  return (
    <div>
        <legend className="fieldset-legend">
            Current Mood Level: {moodLevel}
        </legend>
        <input 
            name="totalQuestions"
            type="range" 
            min={1} 
            max={10} 
            value={moodLevel}
            className="range range-sm w-full"
            onChange={handleChange}
        />
        <div className="w-full flex justify-between text-xs px-2 mt-2">
            <span>Min: 1</span>
            <span>Max: 10</span>
        </div>
    </div>
    );
};

export default MoodSlider;
