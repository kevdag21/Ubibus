const apiKey = "AIzaSyDNg52BASakvP6Os7gOxyk3ccAvYMsjKu4";

/* Retorna el nombre y localización en coordenadas de la ubicación que se busca
 */
export function getSearchLocation (placeId) {
  const apiURL = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry/location&key=${apiKey}`
  return fetch(apiURL).then((res) => res.json())
  console.log(apiURL)
}
