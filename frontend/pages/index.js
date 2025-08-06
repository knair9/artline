import { useState, useEffect } from 'react';

export default function Home() {
  const minYear = 0;
  const maxYear = 2024;
  const interval = 10;

  const [range, setRange] = useState([2010, 2020]);
  const [artifacts, setArtifacts] = useState([]);
  const [randomStylesMap, setRandomStylesMap] = useState({});
  const [loadedArtifacts, setLoadedArtifacts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [customInterval, setCustomInterval] = useState(interval); // replace static 10 later


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
    const newEnd = newStart + customInterval;

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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .image-loaded {
            opacity: 0;
            animation-name: fadeIn;
            animation-duration: 0.4s;
            animation-timing-function: ease;
            animation-fill-mode: forwards;
        }
        .image-wrapper {
          position: relative;
          cursor: pointer;
        }

        .hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(30, 30, 30, 0.6);
          color: white;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
          padding: 0.5rem;
          text-align: center;
        }

        .image-wrapper:hover .hover-overlay {
          opacity: 1;
        }

        .overlay-text {
          font-size: 0.75rem;
          line-height: 1.2;
          max-width: 140px;
        }

        .overlay-text a {
          color: #aad;
          text-decoration: underline;
        }
      `}</style>
      <button
          onClick={() => setShowFilter(true)}
          style={{
            backgroundColor: '#45633d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            position: 'absolute',
            right: '2rem',
            top: '7rem',
            zIndex: 10
          }}
        >
          Filters
      </button>

      {showFilter && (
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
          position: 'absolute',
          top: '9rem',
          right: '2rem',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={() => setShowFilter(false)}
            style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#333'
            }}
            aria-label="Close filter panel"
            >
              ×
          </button>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Time Period (in years):
            <input
              type="number"
              value={customInterval}
              onChange={(e) => setCustomInterval(parseInt(e.target.value))}
              min={1}
              max={maxYear - minYear}
              style={{ marginLeft: '0.5rem', width: '60px' }}
            />
          </label>
          <button
            onClick={() => {
              const newEnd = range[0] + customInterval;
              if (newEnd <= maxYear) {
                setRange([range[0], newEnd]);
              } else {
                setRange([range[0], maxYear]); // fallback
              }
              setShowFilter(false);
            }}
            style={{
              backgroundColor: '#45633d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Apply
          </button>
        </div>
      )}

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
                <div
                  key={artifact["Object ID"]}
                  style={{
                    position: 'relative',
                    height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                    maxWidth: '160px',
                    transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                    animationDelay: `${index * 100}ms`
                  }}
                  className="image-wrapper"
                >
                  <img
                    src={artifact.image_url}
                    alt={artifact.image_url}
                    loading="eager"
                    decoding="sync"
                    className="image-loaded"
                    style={{
                      height: '100%',
                      width: 'auto',
                      objectFit: 'contain',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div className="overlay-text">
                    {artifact["Title"] && artifact["Object Date"] && (
                      <div>
                        <strong>{artifact["Title"]}</strong>, {artifact["Object Date"]}
                      </div>
                    )}

                    {artifact["Artist Display Name"] && (
                      <div>{artifact["Artist Display Name"]}</div>
                    )}

                    {(artifact["Culture"] || artifact["Geography Type"] || artifact["City"] || artifact["Country"]) && (
                      <div>
                        {artifact["Culture"] ? artifact["Culture"] : ""}
                        {artifact["Culture"] && artifact["Geography Type"] ? " — " : ""}
                        {artifact["Geography Type"] ? artifact["Geography Type"] : ""}
                        {(artifact["City"] || artifact["Country"]) && ": "}
                        {[artifact["City"], artifact["Country"]].filter(Boolean).join(", ")}
                      </div>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={`https://www.metmuseum.org/art/collection/search/${artifact["Object ID"]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Met →
                      </a>
                    </div>
                  </div>
                </div>
                // <img
                //   key={artifact["Object ID"]}
                //   src={artifact.image_url}
                //   alt={artifact.image_url}
                //   loading="eager"
                //   decoding="sync"
                //   className="image-loaded"
                //   style={{
                //     height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                //     maxWidth: '160px',
                //     objectFit: 'cover',
                //     transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                //     boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                //     animationDelay: `${index * 100}ms`
                //   }}
                // />
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
                <div
                key={artifact["Object ID"]}
                style={{
                  position: 'relative',
                  height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                  maxWidth: '160px',
                  transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                  animationDelay: `${index * 100}ms`
                }}
                className="image-wrapper"
              >
                <img
                  src={artifact.image_url}
                  alt={artifact.image_url}
                  loading="eager"
                  decoding="sync"
                  className="image-loaded"
                  style={{
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                />
                <div className="hover-overlay">
                  {/* You can insert whatever text/markup you want here */}
                  <div className="overlay-text">
                    <strong>{artifact["Artist Display Name"] || "Unknown Artist"}</strong><br />
                    {artifact["Object Date"]}<br />
                    <em>{artifact["Medium"]}</em><br />
                    <a href={`https://www.metmuseum.org/art/collection/search/${artifact["Object ID"]}`} target="_blank" rel="noopener noreferrer">
                      View on Met →
                    </a>
                  </div>
                </div>
              </div>
                // <img
                //   key={artifact["Object ID"]}
                //   src={artifact.image_url}
                //   alt={artifact.image_url}
                //   loading="eager"
                //   decoding="sync"
                //   className="image-loaded"
                //   style={{
                //     height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
                //     maxWidth: '160px',
                //     objectFit: 'cover',
                //     transform: randomStylesMap[artifact["Object ID"]]?.transform || 'none',
                //     boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                //     animationDelay: `${index * 100}ms`
                //   }}
                // />
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