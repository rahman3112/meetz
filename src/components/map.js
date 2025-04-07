import React, { useEffect, useRef, useState } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import ttservices from '@tomtom-international/web-sdk-services';
import './Map.css';

const Map = ({ loggedInEmail }) => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [pins, setPins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API_KEY = 'lLcJIAppIBBRFN6wNjpax85Vpoj2FqLN'; // Your TomTom API key

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapInstance = tt.map({
          key: API_KEY,
          container: mapElement.current,
          center: [78.4867, 17.3850], // Hyderabad coordinates [lng, lat]
          zoom: 12, // City-level view
        });
        setMap(mapInstance);

        // Fetch existing pins
        const response = await fetch('https://meetz-back.onrender.com/api/pins');
        if (!response.ok) throw new Error('Failed to fetch pins');
        const data = await response.json();
        setPins(data);
        data.forEach((pin) => addPinToMap(mapInstance, pin));

        // Double-click to add pin
        mapInstance.on('dblclick', async (e) => {
          const { lng, lat } = e.lngLat;
          const title = prompt('Enter a nickname for this place:', 'Meeting Spot') || 'Unnamed Spot';
          const newPin = {
            latitude: lat,
            longitude: lng,
            title,
            creatorEmail: loggedInEmail,
          };

          try {
            const pinResponse = await fetch('https://meetz-back.onrender.com/api/pins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPin),
            });
            const result = await pinResponse.json();
            if (!pinResponse.ok) throw new Error(result.message || 'Failed to create pin');
            setPins((prevPins) => [...prevPins, result]);
            addPinToMap(mapInstance, result);
          } catch (error) {
            console.error('Error creating pin:', error);
            alert(error.message);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();
    return () => map && map.remove();
  }, [loggedInEmail]);

  const addPinToMap = (mapInstance, pin) => {
    const marker = new tt.Marker()
      .setLngLat([pin.longitude, pin.latitude])
      .addTo(mapInstance);

    const popup = new tt.Popup({ offset: 35 }).setHTML(`
      <div class="popup">
        <h3>${pin.title}</h3>
        <p>Created by: ${pin.creatorEmail}</p>
      </div>
    `);
    marker.setPopup(popup);
  };

  const handleVote = async (pinId, vote) => {
    console.log('Voting attempt:', { pinId, vote, email: loggedInEmail });
    try {
      const response = await fetch(`https://meetz-back.onrender.com/api/pins/${pinId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loggedInEmail, vote }),
      });
      const result = await response.json();
      console.log('Vote response:', result);
      if (!response.ok) throw new Error(result.message || 'Failed to vote');
      setPins((prevPins) => prevPins.map((p) => (p._id === pinId ? result : p)));
    } catch (error) {
      console.error('Vote error:', error);
      alert(error.message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !map) return;

    try {
      const response = await ttservices.services.fuzzySearch({
        key: API_KEY,
        query: searchQuery,
        limit: 1, // Get the top result
        center: [78.4867, 17.3850], // Bias towards Hyderabad (optional)
      });

      const result = response.results[0];
      if (!result) throw new Error('No results found');

      const { position } = result;
      const [lng, lat] = [position.lng, position.lat];

      // Zoom to the searched location
      map.flyTo({
        center: [lng, lat],
        zoom: 14, // Closer zoom for specific location
      });

      // Add a temporary marker that disappears after 5 seconds
      const tempMarker = new tt.Marker({ color: 'red' }) // Different color to distinguish from pins
        .setLngLat([lng, lat])
        .addTo(map);

      setTimeout(() => {
        tempMarker.remove(); // Remove the marker after 5 seconds
      }, 5000);
    } catch (error) {
      console.error('Search error:', error);
      alert('Could not find the place. Try a different search term.');
    }
  };

  return (
    <div className="map-container">
      <div className="search-bar" >
      <button onClick={()=>window.location.href='/'} style={{position:"relative",right:"260px"}}>HOME</button>
      <button onClick={()=>window.location.href='/explore'} style={{position:"relative",right:"250px"}}>EXPLORE</button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a place..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div ref={mapElement} className="map" />
      <div className="vote-sidebar">
        <h2>LOCATIONS</h2>
        <div className="pins-list">
          {pins.map((pin) => {
            const yesVotes = pin.votes.filter((v) => v.vote).length;
            const noVotes = pin.votes.filter((v) => !v.vote).length;
            const userVote = pin.votes.find((v) => v.email === loggedInEmail);
            const canVote = pin.creatorEmail !== loggedInEmail;

            return (
              <div key={pin._id} className="pin-item">
                <h3>{pin.title}</h3>
                <p>Created by: {pin.creatorEmail}</p>
                <p>Votes - Yes: {yesVotes} | No: {noVotes}</p>
                {canVote ? (
                  <div className="vote-buttons">
                    <button
                      onClick={() => handleVote(pin._id, true)}
                      disabled={userVote && userVote.vote === true}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleVote(pin._id, false)}
                      disabled={userVote && userVote.vote === false}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <p>You created this pin</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Map;