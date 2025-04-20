const haversine = require('haversine-distance')

exports.findNearestDriver = async (location, maxDistance = 5000) => {
  const drivers = await Driver.find({
    available: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        $maxDistance: maxDistance
      }
    }
  }).limit(5)
  
  return drivers
}

exports.calculateDistance = (point1, point2) => {
  return haversine(
    { lat: point1.lat, lng: point1.lng },
    { lat: point2.lat, lng: point2.lng }
  )
}