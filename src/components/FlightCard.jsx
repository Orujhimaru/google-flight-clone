import React from "react";
import PropTypes from "prop-types";

export const FlightCard = ({ itinerary }) => {
  const { price, legs } = itinerary;
  const leg = legs[0];
  const airline = leg.carriers.marketing[0];

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flight-card">
      <div className="flight-card-content">
        <div className="airline-logo-container">
          <img
            src={airline.logoUrl}
            alt={airline.name}
            className="airline-logo"
          />
        </div>

        <div className="flight-main-info">
          <div className="flight-header">
            <div className="time-route">
              <div className="times">
                <span>
                  {formatTime(leg.departure)} – {formatTime(leg.arrival)}
                </span>
              </div>
              <div className="route">
                <span>
                  {leg.origin.displayCode}–{leg.destination.displayCode}
                </span>
              </div>
            </div>

            <div className="flight-details">
              <span className="duration">
                {Math.floor(leg.durationInMinutes / 60)} hrs{" "}
                {leg.durationInMinutes % 60} min
              </span>
              <span className="separator">·</span>
              <span className="stops">{leg.stopCount} stop</span>
            </div>
          </div>

          <div className="airline-name">{airline.name}</div>
        </div>

        <div className="flight-price-container">
          <div className="price">{price.formatted}</div>
          <div className="trip-type">round trip</div>
        </div>
      </div>
    </div>
  );
};

FlightCard.propTypes = {
  itinerary: PropTypes.shape({
    price: PropTypes.shape({
      formatted: PropTypes.string.isRequired,
    }).isRequired,
    legs: PropTypes.arrayOf(
      PropTypes.shape({
        departure: PropTypes.string.isRequired,
        arrival: PropTypes.string.isRequired,
        durationInMinutes: PropTypes.number.isRequired,
        origin: PropTypes.shape({
          displayCode: PropTypes.string.isRequired,
        }).isRequired,
        destination: PropTypes.shape({
          displayCode: PropTypes.string.isRequired,
        }).isRequired,
        carriers: PropTypes.shape({
          marketing: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string.isRequired,
              logoUrl: PropTypes.string.isRequired,
            })
          ).isRequired,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
};
