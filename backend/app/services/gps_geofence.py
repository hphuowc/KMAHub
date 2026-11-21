"""
KMA Hub — GPS Geofencing Service (Haversine Formula)
File: backend/app/services/gps_geofence.py
"""

import math
from typing import Tuple


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two GPS coordinates on Earth
    using the Haversine formula. Returns distance in meters.
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)


def is_within_geofence(
    user_lat: float,
    user_lon: float,
    event_lat: float,
    event_lon: float,
    allowed_radius_meters: float,
) -> Tuple[bool, float]:
    """
    Evaluates whether the user's location is within the allowed geofence perimeter.
    Returns (is_inside: bool, distance_in_meters: float).
    """
    distance = calculate_haversine_distance(user_lat, user_lon, event_lat, event_lon)
    is_inside = distance <= allowed_radius_meters
    return is_inside, distance
