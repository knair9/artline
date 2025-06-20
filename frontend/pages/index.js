import { useEffect, useState } from 'react';

export default function Home() {
  const [year, setYear] = useState(2020); // default year
  const [artifact, setArtifact] = useState(null);

  // Fetch artifact data on mount
  useEffect(() => {
    fetch('https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts')
      .then((res) => res.json())
      .then((data) => setArtifact(data))
      .catch((err) => console.error('Error fetching artifact:', err));
  }, []);

  const handleSliderChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const shouldShowArtifact = artifact && artifact.date === year;

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
          min="0"
          max="2024"
          step="1"
          value={year}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <p>Images and artifacts from the year {year} will appear here.</p>

        {shouldShowArtifact ? (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <h2>{artifact.name}</h2>
            <p>
              <em>{artifact.artist}</em> — {artifact.location}
            </p>
            <img
              src={artifact.source}
              alt={artifact.name}
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '1rem' }}
            />
            <p style={{ marginTop: '1rem' }}>{artifact.description}</p>
          </div>
        ) : (
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
            (No artifact from this year)
          </div>
        )}
      </div>
    </div>
  );
}

// import { useState } from 'react';

// export default function Home() {
//   const [year, setYear] = useState(2020); // default year

//   const handleSliderChange = (e) => {
//     setYear(parseInt(e.target.value));
//   };

//   return (
//     <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
//       <h1>🖼️ Art in Time</h1>

//       <div style={{ marginTop: '2rem' }}>
//         <label htmlFor="time-slider">
//           <strong>Year:</strong> {year}
//         </label>
//         <input
//           type="range"
//           id="time-slider"
//           min="0"
//           max="2024"
//           step="1"
//           value={year}
//           onChange={handleSliderChange}
//           style={{ width: '100%' }}
//         />
//       </div>

//       <div style={{ marginTop: '3rem' }}>
//         <p>Images and artifacts from the year {year} will appear here.</p>
//         <div
//           style={{
//             marginTop: '1rem',
//             height: '200px',
//             background: '#f0f0f0',
//             border: '1px solid #ccc',
//             borderRadius: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: '#666',
//           }}
//         >
//           (Image content placeholder)
//         </div>
//       </div>
//     </div>
//   );
// }