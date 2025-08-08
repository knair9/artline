import { useState, useEffect, useRef } from 'react';


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
  const [thumbPosition, setThumbPosition] = useState(0);
  const sliderRef = useRef(null);
  const [displayedRange, setDisplayedRange] = useState([range[0], range[1]]);
  const filterRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);




  // const preloadImages = async (data) => {
  //   const promises = data.map((artifact) => {
  //     return new Promise((resolve) => {
  //       const img = new Image();
  //       img.src = artifact.image_url;
  //       img.onload = () => resolve({ ...artifact, loaded: true });
  //       img.onerror = () => resolve({ ...artifact, loaded: false });
  //     });
  //   });

  //   const resolved = await Promise.all(promises);
  //   setLoadedArtifacts(resolved);
  // };

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
    return resolved; // <- return, don't setLoadedArtifacts here
  };

  // useEffect(() => {
  //   const [start, end] = range;

  //   const delayDebounce = setTimeout(() => {
  //     setDisplayedRange(range);
  //     fetch(`https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts?start=${start}&end=${end}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //       setArtifacts(data);
  //       const newStyles = {};
  //       data.forEach((artifact) => {
  //         const id = artifact["Object ID"];
  //         newStyles[id] = {
  //           height: `${150 + Math.random() * 100}px`,  // was 80 + 160
  //           transform: `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`
  //         };
  //       });
  //       setRandomStylesMap(newStyles);
  //       preloadImages(data);
  //     })
  //       .catch((err) => console.error('Error fetching:', err));
  //   }, 300);

  //   return () => clearTimeout(delayDebounce);
  // }, [range]);

  useEffect(() => {
    const [start, end] = range;
  
    const delayDebounce = setTimeout(() => {
      setDisplayedRange(range);       // keep your banner in sync with fetch
      setIsLoading(true);             // show spinner
      setLoadedArtifacts([]);         // clear previous images so only spinner shows
  
      fetch(`https://2cee4517-367f-42a2-a853-ea6b5692fafd-00-24mm7jzsa4gt5.kirk.replit.dev/api/artifacts?start=${start}&end=${end}`)
        .then((res) => res.json())
        .then(async (data) => {
          setArtifacts(data);
  
          // Build randomized styles for this batch
          const newStyles = {};
          data.forEach((artifact) => {
            const id = artifact["Object ID"];
            newStyles[id] = {
              height: `${150 + Math.random() * 100}px`,
              transform: `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`
            };
          });
          setRandomStylesMap(newStyles);
  
          // Preload all images; show nothing until this completes
          const resolved = await preloadImages(data);
  
          // Now swap in the fully-loaded set
          setLoadedArtifacts(resolved);
        })
        .catch((err) => {
          console.error('Error fetching:', err);
          // leave loadedArtifacts [] so spinner hides to empty state instead of stale images
        })
        .finally(() => {
          setIsLoading(false); // hide spinner (only after preload + swap)
        });
    }, 500); // debounce: 500ms
  
    return () => clearTimeout(delayDebounce);
  }, [range]);


  const handleChange = (e) => {
    const newStart = parseInt(e.target.value);
    const newEnd = newStart + customInterval;

    if (newEnd <= maxYear) {
      setRange([newStart, newEnd]);
    }
    if (sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const percent = (newStart - minYear) / (maxYear - interval - minYear);
      setThumbPosition(percent * sliderWidth);
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
          font-size: 0.85rem;
          line-height: 1.3;
          max-width: 180px;
        }

        .overlay-text a {
          color: #aad;
          text-decoration: underline;
        }
    
        .filter-panel {
          position: absolute;
          right: 2rem;
          top: 100%;                 
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 1.5rem 1rem 1rem 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          color: #222;

          /* start hidden (for slide-up) */
          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;

          /* animate slide + fade */
          transition: transform 200ms ease, opacity 200ms ease;
          z-index: 1000;
        }

        .filter-panel.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* red button to match the timeline */
        .btn-red {
          background-color: #b7492f;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        .btn-red:hover { filter: brightness(0.95); }
        
        /* === Spinner Overlay === */
        .spinner-wrap {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          background: rgba(247, 239, 231, 0.6); /* faint beige veil to reinforce loading */
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(0,0,0,0.15);
          border-top-color: rgba(0,0,0,0.6);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'     // needed so the panel anchors to the header
      }}>
        <span>Art Out of Time</span>

        <div style={{
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: '500',
          marginTop: '1rem'
        }}>
          displaying artifacts from {displayedRange[0]} – {displayedRange[1]}
        </div>

        {/* Filters button now lives in the header */}
        <button
          className="btn-red"
          onClick={() => setShowFilter((v) => !v)}
          aria-expanded={showFilter}
          aria-controls="filters-panel"
        >
          Filters
        </button>

        {/* Slide-down panel attached to the header */}
        <div
          id="filters-panel"
          ref={filterRef}
          className={`filter-panel ${showFilter ? 'open' : ''}`}
        >
          <button
            onClick={() => setShowFilter(false)}
            style={{
              position: 'absolute',
              top: '0.5rem',     // adjust the “×” position here
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#333',
              lineHeight: 1
            }}
            aria-label="Close filter panel"
            type="button"
          >
            ×
          </button>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Time Range (in years):
            <input
              type="number"
              value={customInterval}
              onChange={(e) => setCustomInterval(parseInt(e.target.value))}
              min={1}
              max={maxYear - minYear}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </label>

          <button
            className="btn-red"
            onClick={() => {
              const newEnd = range[0] + customInterval;
              setRange([range[0], Math.min(newEnd, maxYear)]);
              setShowFilter(false);
            }}
            type="button"
          >
            Apply
          </button>
        </div>
      </header>
      
        {/* Spinner overlay */}
        {isLoading && (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        )}
            
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
            gap: '1.5rem'
          }}>
            {loadedArtifacts.slice(0, Math.ceil(loadedArtifacts.length / 2)).map((artifact, index) => (
              artifact.loaded ? (
                <div
                key={artifact["Object ID"]}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
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
                    display: 'block',
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
              ) : null
            ))}
          </div>

        {/* Center Timeline */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          {/* Tooltip container */}
          <div style={{
            position: 'relative',
            height: '30px', // space reserved for tooltip
            width: '100%'
          }}>
            <div style={{
              position: 'absolute',
              left: `${thumbPosition}px`,
              transform: 'translateX(-50%)',
              bottom: '0',
              backgroundColor: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
              zIndex: 5
            }}>
              {range[0]} – {range[1]}
            </div>
          </div>

            {/* Slider row with edge labels */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              width: '100%'
            }}>
              <span style={{ fontSize: '0.9rem' }}>{minYear}</span>
              <input
                ref={sliderRef}
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
              <span style={{ fontSize: '0.9rem' }}>{maxYear}</span>
            </div>
          </div>
          
          {/* Center Timeline
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
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
          </div> */}

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
                  display: 'inline-block',
                  height: randomStylesMap[artifact["Object ID"]]?.height || '120px',
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
                    display: 'block',
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
              ) : null
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
