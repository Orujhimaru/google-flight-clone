import { useState } from "react";
import "./App.css";
import { CircleIcon, LocationPinIcon, SwitchIcon } from "./components/Icons";

function App() {
  const [searchParams, setSearchParams] = useState({
    origin: "",
    originDetails: "",
    destination: "",
    destinationDetails: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    cabinClass: "economy",
    tripType: "roundTrip",
  });
  const [isRotated, setIsRotated] = useState(false);
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "origin") {
      debouncedSearch(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you'll add your API call logic
    console.log("Search params:", searchParams);
  };

  const handleSwitchLocations = () => {
    setIsRotated((prev) => !prev);
    setSearchParams((prev) => ({
      ...prev,
      origin: prev.destination,
      originDetails: prev.destinationDetails,
      destination: prev.origin,
      destinationDetails: prev.originDetails,
    }));
  };

  const searchAirports = async (query) => {
    if (!query || query.length < 3) {
      setAirports([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${query}`,
        {
          headers: {
            "X-RapidAPI-Key":
              "e6698d1b9fmshc297853002e0dc3p14c7b0jsn60512d66c16e",
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );
      const data = await response.json();
      setAirports(data.data || []);
    } catch (error) {
      console.error("Error fetching airports:", error);
      setAirports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = debounce(searchAirports, 300);

  // https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=baku&locale=en-US
  // link for airport search

  return (
    <div className="flight-search-container">
      <h1>Flight Search</h1>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="trip-type-selector">
          <button
            type="button"
            className={`trip-type-button ${
              searchParams.tripType === "oneWay" ? "active" : ""
            }`}
            onClick={() =>
              setSearchParams((prev) => ({
                ...prev,
                tripType: "oneWay",
                returnDate: "",
              }))
            }
          >
            One-way
          </button>
          <button
            type="button"
            className={`trip-type-button ${
              searchParams.tripType === "roundTrip" ? "active" : ""
            }`}
            onClick={() =>
              setSearchParams((prev) => ({ ...prev, tripType: "roundTrip" }))
            }
          >
            Round trip
          </button>
        </div>

        <div className="top-row">
          <div className="locations-wrapper">
            <div className="form-group">
              <label htmlFor="origin">From</label>
              <div className="origin-input-wrapper">
                <CircleIcon />
                <input
                  className="origin-input"
                  type="text"
                  id="origin"
                  name="origin"
                  placeholder="Where from?"
                  value={searchParams.originDetails || searchParams.origin}
                  onChange={handleInputChange}
                  required
                />
                {isLoading && <div className="loading">Loading...</div>}
                {airports.length > 0 && (
                  <ul className="airports-dropdown">
                    {airports.map(
                      (airport) => (
                        console.log(airport),
                        (
                          <li
                            key={airport.entityId}
                            onClick={() => {
                              setSearchParams((prev) => ({
                                ...prev,
                                origin: airport.skyId,
                                originDetails: `${airport.skyId} - ${
                                  airport.presentation.title ||
                                  airport.presentation.suggestionTitle
                                }`,
                              }));
                              setAirports([]); // Clear the dropdown
                            }}
                          >
                            {airport.presentation.title ||
                              airport.presentation.suggestionTitle}
                            {airport.presentation.subtitle && (
                              <span className="airport-subtitle">
                                {airport.presentation.subtitle}
                              </span>
                            )}
                          </li>
                        )
                      )
                    )}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="button"
              className={`switch-locations ${isRotated ? "rotated" : ""}`}
              onClick={handleSwitchLocations}
              aria-label="Switch locations"
            >
              <SwitchIcon />
            </button>

            <div className="form-group">
              <label htmlFor="destination">To</label>
              <div className="destination-input-wrapper">
                <LocationPinIcon />
                <input
                  className="destination-input"
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="Where to?"
                  value={
                    searchParams.destinationDetails || searchParams.destination
                  }
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="dates-wrapper">
            <div className="form-group">
              <label>Depart</label>
              <input
                type="date"
                name="departDate"
                value={searchParams.departDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div
              className={`form-group ${
                searchParams.tripType === "oneWay" ? "disabled" : ""
              }`}
            >
              <label>Return</label>
              <input
                type="date"
                name="returnDate"
                value={searchParams.returnDate}
                onChange={handleInputChange}
                required={searchParams.tripType === "roundTrip"}
                disabled={searchParams.tripType === "oneWay"}
              />
            </div>
          </div>
        </div>

        <div className="bottom-row">
          <div className="form-group">
            <label htmlFor="passengers">Travelers</label>
            <select
              id="passengers"
              name="passengers"
              value={searchParams.passengers}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "passenger" : "passengers"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cabinClass">Class</label>
            <select
              id="cabinClass"
              name="cabinClass"
              value={searchParams.cabinClass}
              onChange={handleInputChange}
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>

          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>

      <div className="flight-results">
        {/* Flight results will be rendered here after API call */}
      </div>
    </div>
  );
}

export default App;
