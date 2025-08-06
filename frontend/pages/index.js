import { useState, useEffect } from 'react';

export default function Home() {
  const minYear = 0;
  const maxYear = 2024;
  const interval = 10;

  const [range, setRange] = useState([2010, 2020]);
  const [artifacts, setArtifacts] = useState([]);
  const [randomStylesMap, setRandomStylesMap] = useState({});
  const [loadedArtifacts, setLoadedArtifacts] = useState([]);


  const preloadImages = async (data) => {
    const promises = data.map((artifact) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = artifact.image_url;
        img.onload = () => resolve({ ...artifact, loaded: true });
        img.onerror = () => resolve({ ...artifact, loaded: false });
      });
    });

    const resolved = await Promise.all(promises);
    setLoadedArtifacts(resolved);
  };

  useEffect(() => {
    const [start, end] = range;

    const delayDebounce = setTimeout(() => {
      fetch(`https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts?start=${start}&end=${end}`)
        .then((res) => res.json())
        .then((data) => {
        setArtifacts(data);
        const newStyles = {};
        data.forEach((artifact) => {
          const id = artifact["Object ID"];
          newStyles[id] = {
              height: `${80 + Math.random() * 160}px`,
              transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${Math.random() * 6 - 3}deg)`
            };
        });
        setRandomStylesMap(newStyles);
        preloadImages(data);
      })

        // .then((data) => {
        //   setArtifacts(data);
        //   const newStyles = {};
        //   data.forEach((artifact) => {
        //     const id = artifact["Object ID"];
        //     newStyles[id] = {
        //       height: `${80 + Math.random() * 160}px`,
        //       transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${Math.random() * 6 - 3}deg)`
        //     };
        //   });
        //   setRandomStylesMap(newStyles);
        // })
        .catch((err) => console.error('Error fetching:', err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [range]);

  const handleChange = (e) => {
    const newStart = parseInt(e.target.value);
    const newEnd = newStart + interval;

    if (newEnd <= maxYear) {
      setRange([newStart, newEnd]);
    }
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      
      <div style={{ backgroundColor: '#f7efe7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Thicker Green Header */}
        <header style={{
          backgroundColor: '#45633d',
          color: 'white',
          padding: '1.5rem 2rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'left'
        }}>
          Art Out of Time
        </header>

        {/* Main Section Centered Around Timeline */}
        <main style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          {/* Top Images */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
              {loadedArtifacts.slice(0, Math.ceil(loadedArtifacts.length / 2)).map((artifact, index) => (
              artifact.loaded ? (
                <img
                  key={artifact["Object ID"]}
                  src={artifact.image_url}
                  alt={artifact.image_url}
                  loading="eager"
                  decoding="sync"
                  className="image-loaded"
                  style={{
                    height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                    maxWidth: '160px',
                    objectFit: 'cover',
                    transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    opacity: 0,
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                />
              ) : null
            ))}

          </div>

          {/* Center Timeline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <span style={{ fontSize: '0.9rem' }}>{range[0] === 0 ? '8,000 BCE' : range[0]}</span>
            <input
              type="range"
              min={minYear}
              max={maxYear - interval}
              step={1}
              value={range[0]}
              onChange={handleChange}
              style={{
                flexGrow: 1,
                height: '12px',
                borderRadius: '6px',
                background: '#b7492f',
                accentColor: '#b7492f',
                appearance: 'none'
              }}
            />
            <span style={{ fontSize: '0.9rem' }}>{range[1]}</span>
          </div>

          {/* Bottom Images */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            {loadedArtifacts.slice(Math.ceil(loadedArtifacts.length / 2)).map((artifact, index) => (
              artifact.loaded ? (
                <img
                  key={artifact["Object ID"]}
                  src={artifact.image_url}
                  alt={artifact.image_url}
                  loading="eager"
                  decoding="sync"
                  className="image-loaded"
                  style={{
                    height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                    maxWidth: '160px',
                    objectFit: 'cover',
                    transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    opacity: 0,
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                />
              ) : null
            ))}
          </div>
        </main>
      </div>
    </>
  );
}



// //            {artifacts.slice(0, Math.ceil(artifacts.length / 2)).map((artifact) => (
//               <img
//                 key={artifact["Object ID"]}
//                 src={artifact.image_url}
//                 alt={artifact["Object ID"]}
//                 loading="eager" //prevents top down loading 
//                 decoding="sync"
//                 onError={(e) => {
//                   console.log(`Failed to load image for artifact ${artifact["Object ID"]}`);
//                   e.target.src = 'https://eagle-sensors.com/wp-content/uploads/unavailable-image.jpg';
//                 }}
//                 style={{
//                   height: randomStylesMap[artifact["Object ID"]]?.height || '150px',
//                   maxWidth: '200px',
//                   objectFit: 'cover',
//                   transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
//                   boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
//                 }}
//               />
//             ))}