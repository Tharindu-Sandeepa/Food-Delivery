const haversine = require('haversine-distance')

exports.calculateDistance = (point1, point2) => {
  return haversine(
    { lat: point1.lat, lng: point1.lng },
    { lat: point2.lat, lng: point2.lng }
  )
}