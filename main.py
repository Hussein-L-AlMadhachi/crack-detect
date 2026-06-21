from crack_dimension import measure_crack

# Measure crack with known pixel scale (e.g., 10 pixels = 1 mm)
measurements = measure_crack("crack.jpg", pixels_per_mm=10)
print(f"Length: {measurements['length_mm']} mm")
print(f"Avg Width: {measurements['avg_width_mm']} mm")
print(f"Max Width: {measurements['max_width_mm']} mm")
print(f"Area: {measurements['area_mm2']} mm²")
print(f"Angle: {measurements['angle_deg']}°")
print(f"Crack Type: {measurements['crack_type']}")
