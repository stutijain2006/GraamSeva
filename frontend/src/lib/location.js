export async function requestBrowserLocation() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported')
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 180000,
      },
    )
  })
}

export async function resolveLocationWithBackend({ latitude, longitude, language }) {
  try {
    const response = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, language }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      displayName: data.displayName || data.formattedAddress || null,
      village: data.village || null,
      district: data.district || null,
      state: data.state || null,
      country: data.country || null,
      latitude,
      longitude,
      source: 'backend',
    }
  } catch {
    return null
  }
}

export async function resolveCurrentLocation(language) {
  const coords = await requestBrowserLocation()
  const backendResolved = await resolveLocationWithBackend({ ...coords, language })

  if (backendResolved) {
    return backendResolved
  }

  return {
    displayName: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
    village: null,
    district: null,
    state: null,
    country: null,
    latitude: coords.latitude,
    longitude: coords.longitude,
    source: 'browser',
  }
}

export function getLocationLabel(location) {
  if (!location) return null
  return location.village || location.district || location.state || location.displayName || null
}