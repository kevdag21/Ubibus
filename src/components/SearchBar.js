import { Platform } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

import { getSearchLocation } from '../services/getSearchLocation'

export function SearchBar ({ currentLocation, onSearch = () => {} }) {
  const handleSearch = (search) => {
    const placeId = search.place_id
    getSearchLocation(placeId).then((placeDetail) => {
      const location = placeDetail.result.geometry.location
      location.name = placeDetail.result.name
      onSearch(location)

      container: {
          bottom: Platform.select({ ios: "16%", android: "12%" })
      }
    })

    
  }

  return (
    <>
      <GooglePlacesAutocomplete
        placeholder="Buscar"
        onPress={(search) => {
          handleSearch(search);
        }}
 
        query={{
          key: "AIzaSyDNg52BASakvP6Os7gOxyk3ccAvYMsjKu4",
          language: "es",
          components: "country:mx",
          radius: 5000,
          location: `${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`,
          strictbounds: true,
        }}
        styles={{
          container: {
            position: "absolute",
            top: Platform.select({ ios: "15%", android: "12%" }),
            width: "100%",
          },
        }}
      />
    </>
  );
}
