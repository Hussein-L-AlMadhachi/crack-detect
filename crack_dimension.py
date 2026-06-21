#!/usr/bin/env python3
"""
Simple crack dimension measurement using YOLOv8 segmentation.
"""

import cv2
import numpy as np
from ultralytics import YOLO
from typing import Dict, Tuple


def skeletonize(mask: np.ndarray) -> np.ndarray:
    """Thin a binary mask to a 1-pixel-wide skeleton using morphological thinning."""
    try:
        skeleton = cv2.ximgproc.thinning(mask, thinningType=cv2.ximgproc.THINNING_ZHANGSUEN)
        return skeleton
    except AttributeError:
        # Manual Zhang-Suen thinning fallback
        skel = mask.copy() // 255
        skel = skel.astype(np.uint8)
        prev = np.zeros_like(skel)

        while True:
            markers = np.zeros_like(skel)
            rows, cols = skel.shape
            for r in range(1, rows - 1):
                for c in range(1, cols - 1):
                    if skel[r, c] != 1:
                        continue
                    p2, p3, p4, p5, p6, p7, p8, p9 = [
                        skel[r-1, c], skel[r-1, c+1], skel[r, c+1], skel[r+1, c+1],
                        skel[r+1, c], skel[r+1, c-1], skel[r, c-1], skel[r-1, c-1]
                    ]
                    neighbours = [p2, p3, p4, p5, p6, p7, p8, p9]
                    n = sum(neighbours)
                    t = sum(1 for a, b in zip(neighbours, neighbours[1:] + [neighbours[0]]) if a == 0 and b == 1)
                    if 2 <= n <= 6 and t == 1 and p2 * p4 * p6 == 0 and p4 * p6 * p8 == 0:
                        markers[r, c] = 1
            skel[markers == 1] = 0

            markers = np.zeros_like(skel)
            for r in range(1, rows - 1):
                for c in range(1, cols - 1):
                    if skel[r, c] != 1:
                        continue
                    p2, p3, p4, p5, p6, p7, p8, p9 = [
                        skel[r-1, c], skel[r-1, c+1], skel[r, c+1], skel[r+1, c+1],
                        skel[r+1, c], skel[r+1, c-1], skel[r, c-1], skel[r-1, c-1]
                    ]
                    neighbours = [p2, p3, p4, p5, p6, p7, p8, p9]
                    n = sum(neighbours)
                    t = sum(1 for a, b in zip(neighbours, neighbours[1:] + [neighbours[0]]) if a == 0 and b == 1)
                    if 2 <= n <= 6 and t == 1 and p2 * p4 * p8 == 0 and p2 * p6 * p8 == 0:
                        markers[r, c] = 1
            skel[markers == 1] = 0

            if np.array_equal(skel, prev):
                break
            prev = skel.copy()

        return skel * 255


def calculate_orientation(skeleton: np.ndarray) -> Tuple[float, str]:
    """
    Calculate the dominant orientation angle of a crack using PCA on skeleton points.
    
    Args:
        skeleton: Binary skeleton mask.
    
    Returns:
        (angle_degrees, crack_type) where angle is in degrees [0, 180) from horizontal,
        and crack_type is one of: 'horizontal', 'vertical', 'diagonal', 'shear'
    """
    # Get skeleton points
    points = np.argwhere(skeleton > 0)
    if len(points) < 2:
        return 0.0, 'unknown'
    
    # Center the points
    centered = points - np.mean(points, axis=0)
    
    # Compute covariance matrix
    cov = np.cov(centered.T)
    
    # Get eigenvectors and eigenvalues
    eigenvalues, eigenvectors = np.linalg.eig(cov)
    
    # The principal eigenvector (largest eigenvalue) gives the dominant direction
    principal_idx = np.argmax(eigenvalues)
    principal_vec = eigenvectors[:, principal_idx]
    
    # Calculate angle from horizontal (in degrees)
    angle_rad = np.arctan2(principal_vec[0], principal_vec[1])  # row, col -> y, x
    angle_deg = np.degrees(angle_rad) % 180  # Normalize to [0, 180)
    
    # Classify crack type based on angle
    # Shear cracks typically occur at ~45° (±15°)
    if 30 <= angle_deg <= 60 or 120 <= angle_deg <= 150:
        crack_type = 'shear'
    elif 0 <= angle_deg < 15 or 165 <= angle_deg < 180:
        crack_type = 'horizontal'
    elif 75 <= angle_deg < 105:
        crack_type = 'vertical'
    else:
        crack_type = 'diagonal'
    
    return round(angle_deg, 1), crack_type


"""
    Measure crack dimensions (length, width, area) using YOLOv8 segmentation.
    
    ACCURACY CONSTRAINTS:
    ---------------------
    1. Pixel-to-mm calibration: Must be accurate. Calibrate using a reference object
       (e.g., coin, ruler) of known physical size placed on the same plane as the crack.
       Formula: pixels_per_mm = (reference_width_px / reference_width_mm)
    
    2. Camera angle: Camera must be perpendicular (90°) to the surface. Angled shots
       cause perspective distortion that invalidates measurements.
    
    3. Image quality: 
       - High resolution recommended (minimum 1024x1024)
       - Sharp focus on crack edges
       - Even lighting to avoid shadows affecting segmentation
    
    4. Reference object placement (if using calibration):
       - Must be on the same plane as the crack
       - Must be in focus
       - Must have precisely known dimensions
       - Should not be partially occluded
    
    5. Crack characteristics:
       - Best accuracy for continuous, non-branching cracks
       - Fragmented or highly branching cracks may have less accurate length estimates
       - Width estimation assumes relatively smooth crack boundaries
    
    6. Model confidence: Default conf=0.25. Adjust based on your use case:
       - Lower: detect more cracks but may include noise
       - Higher: fewer false positives but may miss faint cracks
    
    Args:
        image_path: Path to the crack image.
        model_path: Path to YOLOv8 segmentation model (.pt).
        pixels_per_mm: Pixel to millimeter conversion factor (CRITICAL for accuracy).
    
    Returns:
        Dict with keys: length_mm, avg_width_mm, max_width_mm, area_mm2
"""
def measure_crack(image_path: str, model_path: str = "YOLOv8s.pt", pixels_per_mm: float = 1.0) -> Dict:
    # Load model
    model = YOLO(model_path)
    
    # Run inference
    results = model(image_path, conf=0.25, verbose=False)
    
    if not results or results[0].masks is None:
        return {"length_mm": 0.0, "avg_width_mm": 0.0, "max_width_mm": 0.0, "area_mm2": 0.0}
    
    # Get the first/largest crack mask
    masks = results[0].masks.data.cpu().numpy().astype(np.uint8)
    mask = masks[0]
    mask_bin = (mask * 255).astype(np.uint8)
    
    # Skeleton for length and orientation
    skeleton = skeletonize(mask_bin)
    length_px = float(np.count_nonzero(skeleton))
    length_mm = length_px / pixels_per_mm
    
    # Calculate orientation angle
    angle_deg, crack_type = calculate_orientation(skeleton)
    
    # Width via distance transform
    dist = cv2.distanceTransform(mask_bin, cv2.DIST_L2, 5)
    skel_mask = (skeleton > 0)
    if skel_mask.any():
        half_widths = dist[skel_mask]
        avg_width_mm = float(np.mean(half_widths)) * 2.0 / pixels_per_mm
        max_width_mm = float(np.max(half_widths)) * 2.0 / pixels_per_mm
    else:
        avg_width_mm = 0.0
        max_width_mm = 0.0
    
    # Area
    area_px = float(np.count_nonzero(mask_bin))
    area_mm2 = area_px / (pixels_per_mm * pixels_per_mm)
    
    return {
        "length_mm": round(length_mm, 2),
        "avg_width_mm": round(avg_width_mm, 2),
        "max_width_mm": round(max_width_mm, 2),
        "area_mm2": round(area_mm2, 2),
        "angle_deg": angle_deg,
        "crack_type": crack_type
    }
