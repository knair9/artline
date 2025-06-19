import { useState } from 'react';

export default function Home() {
  const [year, setYear] = useState(2020); // default year

  const handleSliderChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>🖼️ Art in Time</h1>

      <div style={{ marginTop: '2rem' }}>
        <label htmlFor="time-slider">
          <strong>Year:</strong> {year}
        </label>
        <input
          type="range"
          id="time-slider"
          min="1000"
          max="2024"
          step="1"
          value={year}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <p>Images and artifacts from the year {year} will appear here.</p>
        <div
          style={{
            marginTop: '1rem',
            height: '200px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          (Image content placeholder)
        </div>
      </div>
    </div>
  );
}