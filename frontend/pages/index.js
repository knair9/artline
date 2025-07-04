// import { useEffect, useState } from 'react';

// export default function Home() {
//   const [year, setYear] = useState(2020); // default year
//   const [artifact, setArtifact] = useState(null);

//   // Fetch artifact data on mount
//   useEffect(() => {
//     fetch('https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts')
//       .then((res) => res.json())
//       .then((data) => setArtifact(data))
//       .catch((err) => console.error('Error fetching artifact:', err));
//   }, []);

//   const handleSliderChange = (e) => {
//     setYear(parseInt(e.target.value));
//   };

//   const shouldShowArtifact = artifact && parseInt(artifact.date) === year;

//   return (
//     <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
//       <h1>🖼️ Art Out of Time</h1>

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

//         {shouldShowArtifact ? (
//           <div
//             style={{
//               marginTop: '1rem',
//               padding: '1rem',
//               border: '1px solid #ccc',
//               borderRadius: '8px',
//               backgroundColor: '#fff',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               textAlign: 'center',
//             }}
//           >
//             <h2>{artifact.name}</h2>
//             <p>
//               <em>{artifact.artist}</em> — {artifact.location}
//             </p>
//             <img
//               src={artifact.source}
//               alt={artifact.name}
//               style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '1rem' }}
//             />
//             <p style={{ marginTop: '1rem' }}>{artifact.description}</p>
//           </div>
//         ) : (
//           <div
//             style={{
//               marginTop: '1rem',
//               height: '200px',
//               background: '#f0f0f0',
//               border: '1px solid #ccc',
//               borderRadius: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#666',
//             }}
//           >
//             (No artifact from this year)
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';

export default function Home() {
  const [startYear, setStartYear] = useState(1800);
  const [endYear, setEndYear] = useState(1820);
  const [artifacts, setArtifacts] = useState([]);

  // Fetch artifacts whenever startYear or endYear changes
  useEffect(() => {
    if (startYear > endYear) return; // guard: invalid range
    fetch(`https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts?${startYear}&end=${endYear}`)
      .then((res) => res.json())
      .then((data) => setArtifacts(data))
      .catch((err) => console.error('Error fetching artifacts:', err));
  }, [startYear, endYear]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>🖼️ Art Out of Time</h1>

      {/* Year range sliders */}
      <div style={{ marginTop: '2rem' }}>
        <div>
          <label htmlFor="start-year">
            <strong>Start Year:</strong> {startYear}
          </label>
          <input
            type="range"
            id="start-year"
            min="0"
            max="2024"
            step="1"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="end-year">
            <strong>End Year:</strong> {endYear}
          </label>
          <input
            type="range"
            id="end-year"
            min="0"
            max="2024"
            step="1"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Display image results */}
      <div
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {artifacts.length > 0 ? (
          artifacts.map((artifact) => (
            <img
              key={artifact.objectID}
              src={artifact.image_small || artifact.image}
              alt={artifact.title || 'Artifact'}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            No images found for this year range.
          </p>
        )}
      </div>
    </div>
  );
}