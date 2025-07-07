import { useState, useEffect } from 'react';

export default function Home() {
  const minYear = 0;
  const maxYear = 2024;
  const interval = 10;

  const [range, setRange] = useState([2010, 2020]); // default 10-year window
  const [artifacts, setArtifacts] = useState([]);


  useEffect(() => {
    const [start, end] = range;

    const delayDebounce = setTimeout(() => {
      fetch(`https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts?start=${start}&end=${end}`)
        .then((res) => res.json())
        .then((data) => {
          setArtifacts(data);
      })
      .catch((err) => console.error('Error fetching:', err));
    }, 500); // waits 500ms after slider stops

    return () => clearTimeout(delayDebounce); // cancel if slider moves again quickly
  }, [range]);
  

  const handleChange = (e) => {
    const newStart = parseInt(e.target.value);
    const newEnd = newStart + interval;

    if (newEnd <= maxYear) {
      setRange([newStart, newEnd]);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>🖼️ Art Out of Time</h1>
      <div style={{ marginTop: '2rem' }}>
        <label>
          <strong>Years:</strong> {range[0]} – {range[1]}
        </label>
        <input
          type="range"
          min={minYear}
          max={maxYear - interval}
          step={1}
          value={range[0]}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
        {artifacts.map((artifact, index) => (
          <img
          key={artifact.objectID}
          src={artifact.image}
          alt={artifact.objectID}
          onError={(e) => {
            console.log(`Failed to load image: ${artifact.image}`);
            e.target.src = 'https://eagle-sensors.com/wp-content/uploads/unavailable-image.jpg';
          }}
          style={{
            width: 'auto',         // fills the grid cell width
            height: 'auto',        // keeps aspect ratio
            maxHeight: '200px',    // cap height to prevent huge images
            objectFit: 'cover',    // crops excess to fit nicely
            borderRadius: '8px',   // optional: rounded corners
          }}
        />
          // <img key={artifact.objectID} src={artifact.image} alt={`Artifact ${artifact.objectID}`} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  );
}