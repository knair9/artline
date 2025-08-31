import { useState, useEffect, useRef } from 'react';


export default function Home() {
  const minYear = BCE_START;
  const maxYear = CE_END;
  const interval = 50;

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
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [classificationFilter, setClassificationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cultureFilter, setCultureFilter] = useState('');

  const prettyArtist = (val) => // Artist helper: convert pipes to commas
    (val || '')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i) // dedupe
      .join(', ');
  const prettyLocation = (val) => // Location helper: convert pipes to slashes
    (val || '')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(' / ');
    // --- Nonlinear timeline mapping ---
  const BCE_START = -4000;       // min timeline year
  const CE_END = 2024;           // max timeline year (already your max)
  const TRACK_UNITS = 1000;      // virtual slider units
  const SPLIT = 0.30;            // 30% of track for BCE (-4000..0), 70% for CE (0..2024)

  // slider units (0..TRACK_UNITS) -> year
  const sliderToYear = (units) => {
    const pos = units / TRACK_UNITS;
    if (pos <= SPLIT) {
      const f = pos / SPLIT;                   // 0..1 across BCE
      return Math.round(BCE_START + f * (0 - BCE_START));   // -4000..0
    } else {
      const f = (pos - SPLIT) / (1 - SPLIT);   // 0..1 across CE
      return Math.round(0 + f * (CE_END - 0));               // 0..2024
    }
  };

  // year -> slider units (0..TRACK_UNITS)
  const yearToSlider = (y) => {
    if (y < 0) {
      const f = (y - BCE_START) / (0 - BCE_START);         // -4000..0 → 0..1
      return Math.round(f * SPLIT * TRACK_UNITS);
    } else {
      const f = y / (CE_END - 0);                          // 0..2024 → 0..1
      return Math.round((SPLIT + f * (1 - SPLIT)) * TRACK_UNITS);
    }
  };

  // For tick positions in %
  const tickLeftPct = (y) => (yearToSlider(y) / TRACK_UNITS) * 100;
  const formatYear = (y) => (y < 0 ? `${Math.abs(y)} BCE` : `${y}`);

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

  useEffect(() => {
    const [start, end] = range; 

    const delayDebounce = setTimeout(() => {
      setDisplayedRange(range);       // keep your banner in sync with fetch
      setIsLoading(true);             // show spinner
      setLoadedArtifacts([]);         // clear previous images so only spinner shows
  
    
    const params = new URLSearchParams({
      start: String(start),
      end: String(end),
      _: String(refreshTick), // your cache-buster
    });

    // Only send filters if they’re set
    if (classificationFilter && classificationFilter.trim()) params.set('classification', classificationFilter.trim());
    if (countryFilter && countryFilter.trim()) params.set('country', countryFilter.trim());
    if (cultureFilter && cultureFilter.trim()) params.set('culture', cultureFilter.trim());

    const url = `https://art-in-time-api-22380654468.us-central1.run.app/api/artifacts?${params.toString()}`;

    fetch(url)
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
          setIsRefreshing(false);
        });
    }, 500); // debounce: 500ms
  
    return () => clearTimeout(delayDebounce);
  }, [range, refreshTick]);


  const handleChange = (e) => {
    const units = parseInt(e.target.value, 10);   // 0..TRACK_UNITS
    const newStart = sliderToYear(units);
    const newEnd = newStart + customInterval;
  
    if (newEnd <= maxYear) {
      setRange([newStart, newEnd]);
    }
  
    if (sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const percent = units / TRACK_UNITS;
      setThumbPosition(percent * sliderWidth);    // keeps your moving tooltip in sync
    }
  };

  const handleShuffle = () => {
    setIsRefreshing(true);
    setIsLoading(true);         // show spinner immediately
    setRefreshTick(t => t + 1); // triggers the refetch for the SAME range
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
          max-height: 100%;
          box-sizing: border-box;
          overflow: hidden;
          pointer-events: none;
        }

        .image-wrapper:hover .hover-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .overlay-text {
          font-size: 0.85rem;
          line-height: 1.3;
          max-width: 98%;
          max-height: 98%;
          overflow: visible;
          display: block;
          padding: 0.05rem 0.05rem 0.05rem 0.05rem;
          box-sizing: border-box;
        }

        .image-wrapper:hover .hover-overlay,
        .hover-overlay:hover {
          overflow: auto;                /* enable scroll */
          -webkit-overflow-scrolling: touch; /* smooth on iOS */
          overscroll-behavior: contain;  /* don’t scroll the page by accident */
        }

        .hover-overlay::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.35);
        border-radius: 4px;
        }
        .hover-overlay::-webkit-scrollbar-track {
          background: transparent;
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
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        position: 'relative'     // needed so the panel anchors to the header
      }}>
      <div style={{ 
        justifySelf: 'start', 
        fontSize: '32px',       // makes it bigger
        fontFamily: '"Comic Sans MS", "Pacifico", cursive', // cuter font
      }}>
          Artline
      </div>
        
        <div style={{
          justifySelf: 'center',
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: '500',
          //marginTop: '1rem'
        }}>
          displaying artifacts from {formatYear(displayedRange[0])} – {formatYear(displayedRange[1])}
        </div>

        {/* Right */}
        
        <div style={{ justifySelf: 'end', display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <button
            className="btn-red"
            onClick={() => setShowFilter(v => !v)}
            aria-expanded={showFilter}
            aria-controls="filters-panel"
            type="button"
          >
            Filters
          </button>

          <button
            className="btn-red"
            onClick={handleShuffle}
            disabled={isRefreshing || isLoading}
            aria-label="Shuffle images"
            type="button"
          >
            {isRefreshing || isLoading ? 'Refreshing…' : 'Shuffle'}
          </button>

          {/* Slide-down panel ANCHORED HERE */}
          <div
            id="filters-panel"
            ref={filterRef}
            className={`filter-panel ${showFilter ? 'open' : ''}`}
            style={{
              right: 0,
              left: 'auto',
              top: 'calc(100% + 8px)',
              zIndex: 2000, // ensure on top
            }}
          >
            <button
              onClick={() => setShowFilter(false)}
              style={{
                position: 'absolute',
                top: '0.5rem',
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

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
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

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              Classification:
              <input
                type="text"
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                placeholder="e.g. oil, tempera"
                style={{ marginLeft: '0.5rem', width: '180px' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              Country:
              <input
                type="text"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                placeholder="e.g. Spain"
                style={{ marginLeft: '0.5rem', width: '180px' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              Culture:
              <input
                type="text"
                value={cultureFilter}
                onChange={(e) => setCultureFilter(e.target.value)}
                placeholder="e.g. Egyptian"
                style={{ marginLeft: '0.5rem', width: '180px' }}
              />
            </label>
            
            <button
              className="btn-red"
              onClick={() => {
                const newEnd = range[0] + customInterval;
                setRange([range[0], Math.min(newEnd, maxYear)]);
                setRefreshTick((t) => t + 1);
                setShowFilter(false);
              }}
              type="button"
            >
              Apply
            </button>
          </div>
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
                    <strong>{artifact["Title"]}</strong><br />
                    {prettyArtist(artifact["Artist Display Name"]) || "Unknown Artist"}<br />
                    {artifact["Object Date"]}<br />
                    {(() => {
                    const geoType = (artifact["Geography Type"] || "").trim();
                    if (!geoType) return null;

                    const culture = prettyLocation(artifact["Culture"]);
                    const city    = prettyLocation(artifact["City"]);
                    const country = prettyLocation(artifact["Country"]);

                    const left = [culture, geoType].filter(Boolean).join(' — ');
                    const rightParts = [city, country].filter(Boolean);
                    const right = rightParts.length ? `: ${rightParts.join(', ')}` : '';

                    return <div>{left}{right}</div>;
                    })()}
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
            {/* Tooltip container (follows the thumb) */}
            <div style={{ position: 'relative', height: '30px', width: '100%' }}>
              <div style={{
                position: 'absolute',
                left: `${thumbPosition}px`,
                transform: 'translateX(-50%)',
                bottom: 0,
                backgroundColor: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
                zIndex: 5
              }}>
                {formatYear(range[0])} – {formatYear(range[1])}
              </div>
            </div>

            {/* Slider row with edge labels + ticks */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              width: '100%',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.9rem' }}>{formatYear(minYear)}</span>

              {/* Track wrapper for ticks */}
              <div style={{ position: 'relative', flexGrow: 1 }}>
                {/* Tick marks */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '12px', pointerEvents: 'none' }}>
                  {/* 2000 BCE */}
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(-2000)}%`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    width: 2, height: '100%',
                    background: '#333', opacity: 0.6
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(-2000)}%`,
                    top: 22, /* just below tick */
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    color: '#333'
                  }}>
                    2000 BCE
                  </div>
                  {/* Year 0 */}
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(0)}%`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    width: 2, height: '100%',
                    background: '#333', opacity: 0.6
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(0)}%`,
                    top: 22, /* just below tick */
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    color: '#333'
                  }}>
                    0 
                  </div>                  
                  {/* 1000 CE */}
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(1000)}%`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    width: 2, height: '100%',
                    background: '#333', opacity: 0.6
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${tickLeftPct(1000)}%`,
                    top: 22, /* just below tick */
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    color: '#333'
                  }}>
                    1000 CE
                  </div>
                </div>

                {/* Non-linear slider (uses virtual units) */}
                <input
                  ref={sliderRef}
                  type="range"
                  min={0}
                  max={TRACK_UNITS}
                  step={1}
                  value={yearToSlider(range[0])}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '12px',
                    borderRadius: '6px',
                    background: '#b7492f',
                    accentColor: '#b7492f',
                    appearance: 'none'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.9rem' }}>{formatYear(maxYear)}</span>
            </div>
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
                    <strong>{artifact["Title"]}</strong><br />
                    {prettyArtist(artifact["Artist Display Name"]) || "Unknown Artist"}<br />
                    {artifact["Object Date"]}<br />
                    {(() => {
                    const geoType = (artifact["Geography Type"] || "").trim();
                    if (!geoType) return null;

                    const culture = prettyLocation(artifact["Culture"]);
                    const city    = prettyLocation(artifact["City"]);
                    const country = prettyLocation(artifact["Country"]);

                    const left = [culture, geoType].filter(Boolean).join(' — ');
                    const rightParts = [city, country].filter(Boolean);
                    const right = rightParts.length ? `: ${rightParts.join(', ')}` : '';

                    return <div>{left}{right}</div>;
                    })()}
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
