export interface LocalViagem {
  texto: string;
  // Presente quando o local veio de uma sugestão; sem ela, o texto é geocodificado.
  location?: google.maps.LatLngLiteral;
}

export interface PlaceSuggestion {
  id: string;
  titulo: string;
  detalhe: string;
  texto: string;
  prediction: google.maps.places.PlacePrediction;
}
