import { useState } from "react";
import "./App.css";
import { CircleIcon, LocationPinIcon, SwitchIcon } from "./components/Icons";
import { FlightCard } from "./components/FlightCard";
import { ThemeSwitch } from "./components/ThemeSwitch";
import { FlightFilters } from "./components/FlightFilters";

function App() {
  const [searchParams, setSearchParams] = useState({
    originName: "",
    origin: "",
    originDetails: "",
    destinationName: "",
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
  const [activeField, setActiveField] = useState(null);
  const [flightResults, setFlightResults] = useState([]);
  const [theme, setTheme] = useState("light");
  const [filters, setFilters] = useState({
    maxPrice: 2000,
    maxDuration: 18,
    sortBy: "",
    stops: {
      direct: true,
      oneStop: true,
      twoPlus: true,
    },
    timeOfDay: {
      morning: true,
      afternoon: true,
      evening: true,
      night: true,
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "origin" || name === "destination") {
      // Update the name field when typing airports
      setSearchParams((prev) => ({
        ...prev,
        [`${name}Name`]: value,
      }));
      setActiveField(name);
      debouncedSearch(value);
    } else {
      // Handle all other inputs (dates, passengers, cabin class)
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Log the request parameters first
    console.log("Search Parameters:", {
      originSkyId: searchParams.origin,
      destinationSkyId: searchParams.destination,
      originEntityId: searchParams.originDetails,
      destinationEntityId: searchParams.destinationDetails,
      date: searchParams.departDate,
      cabinClass: searchParams.cabinClass,
      adults: searchParams.passengers,
    });

    try {
      const response = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsWebComplete?originSkyId=${searchParams.origin}&destinationSkyId=${searchParams.destination}&originEntityId=${searchParams.originDetails}&destinationEntityId=${searchParams.destinationDetails}&date=${searchParams.departDate}&cabinClass=${searchParams.cabinClass}&adults=${searchParams.passengers}&sortBy=best&currency=USD&market=en-US&countryCode=US`,
        {
          headers: {
            "X-RapidAPI-Key":
              "e6698d1b9fmshc297853002e0dc3p14c7b0jsn60512d66c16e",
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );

      const data = await response.json();
      console.log("API Response Status:", response.status);
      console.log("Flight search results:", data);

      if (!response.ok) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }

      if (data?.data?.itineraries) {
        setFlightResults(data.data.itineraries);
      }
    } catch (error) {
      console.error("Error searching flights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchLocations = () => {
    setIsRotated((prev) => !prev);
    setSearchParams((prev) => ({
      ...prev,
      origin: prev.destination,
      originDetails: prev.destinationDetails,
      originName: prev.destinationName,
      destination: prev.origin,
      destinationDetails: prev.originDetails,
      destinationName: prev.originName,
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

  const toggleTheme = () => {
    console.log("Toggling theme from:", theme);
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const filterFlights = (flights) => {
    return flights.filter((flight) => {
      const leg = flight.legs[0];
      const price = flight.price.raw;
      const duration = leg.durationInMinutes / 60;
      const departureHour = new Date(leg.departure).getHours();

      // Price filter
      if (price > filters.maxPrice) return false;

      // Duration filter
      if (duration > filters.maxDuration) return false;

      // Stops filter
      const stopCount = leg.stopCount;
      if (stopCount === 0 && !filters.stops.direct) return false;
      if (stopCount === 1 && !filters.stops.oneStop) return false;
      if (stopCount >= 2 && !filters.stops.twoPlus) return false;

      // Time of day filter
      if (
        departureHour >= 6 &&
        departureHour < 12 &&
        !filters.timeOfDay.morning
      )
        return false;
      if (
        departureHour >= 12 &&
        departureHour < 18 &&
        !filters.timeOfDay.afternoon
      )
        return false;
      if (
        departureHour >= 18 &&
        departureHour < 24 &&
        !filters.timeOfDay.evening
      )
        return false;
      if (departureHour >= 0 && departureHour < 6 && !filters.timeOfDay.night)
        return false;

      return true;
    });
  };

  const sortFlights = (flights) => {
    if (!filters.sortBy) return flights;

    return [...flights].sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc":
          return a.price.raw - b.price.raw;
        case "price_desc":
          return b.price.raw - a.price.raw;
        case "duration_asc":
          return a.legs[0].durationInMinutes - b.legs[0].durationInMinutes;
        case "duration_desc":
          return b.legs[0].durationInMinutes - a.legs[0].durationInMinutes;
        default:
          return 0;
      }
    });
  };

  // https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=baku&locale=en-US
  // link for airport search

  return (
    <div className="flight-search-container">
      <div className="header-row">
        <h1>Flight Search</h1>
        <ThemeSwitch theme={theme} onToggle={toggleTheme} />
      </div>

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
                  value={searchParams.originName}
                  onChange={handleInputChange}
                  required
                />
                {isLoading && activeField === "origin" && (
                  <div className="loading">Loading...</div>
                )}
                {airports.length > 0 && activeField === "origin" && (
                  <ul className="airports-dropdown">
                    {airports.map((airport) => (
                      <li
                        key={airport.entityId}
                        onClick={() => {
                          setSearchParams((prev) => ({
                            ...prev,
                            origin: airport.skyId,
                            originDetails: airport.entityId,
                            originName: `${airport.skyId} - ${airport.presentation.title}`,
                          }));
                          setAirports([]);
                          setActiveField(null);
                        }}
                      >
                        <div className="flight-list-item">
                          <h3>{airport.skyId}</h3>
                          <span className="airport-subtitle">
                            {airport.presentation.title}
                          </span>
                        </div>
                      </li>
                    ))}
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
                  value={searchParams.destinationName}
                  onChange={handleInputChange}
                  required
                />
                {isLoading && activeField === "destination" && (
                  <div className="loading">Loading...</div>
                )}
                {airports.length > 0 && activeField === "destination" && (
                  <ul className="airports-dropdown">
                    {airports.map((airport) => (
                      <li
                        key={airport.entityId}
                        onClick={() => {
                          setSearchParams((prev) => ({
                            ...prev,
                            destination: airport.skyId,
                            destinationDetails: airport.entityId,
                            destinationName: `${airport.skyId} - ${airport.presentation.title}`,
                          }));
                          setAirports([]);
                          setActiveField(null);
                        }}
                      >
                        <div className="flight-list-item">
                          <h3>{airport.skyId}</h3>
                          <span className="airport-subtitle">
                            {airport.presentation.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="dates-wrapper">
            <div className="form-group">
              <label>Departure</label>
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
        <div className="bottom-row-wrapper">
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
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>

      <div className="flight-results">
        {isLoading ? (
          <div className="loading-state">
            <p>Finding the best flights for you...</p>
          </div>
        ) : flightResults.length > 0 ? (
          <>
            <FlightFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <h2 className="flight-group-header">✈️ Departing Flights</h2>
            {filterFlights(sortFlights(flightResults)).map((itinerary) => (
              <FlightCard key={itinerary.id} itinerary={itinerary} />
            ))}

            {searchParams.tripType === "roundTrip" && (
              <>
                <hr className="flight-group-divider" />
                <h2 className="flight-group-header">🛬 Returning Flights</h2>
                {filterFlights(sortFlights(flightResults)).map((itinerary) => (
                  <FlightCard
                    key={`return-${itinerary.id}`}
                    itinerary={itinerary}
                  />
                ))}
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
