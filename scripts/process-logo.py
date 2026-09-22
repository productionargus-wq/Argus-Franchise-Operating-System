import os
from PIL import Image
import numpy as np

src_path = "C:/Users/HP/.gemini/antigravity/brain/d9fe2ae5-245a-4a50-847f-5136cf59b6ef/.user_uploaded/media_1790071347427.jpg"
public_dir = "e:/ARGUS TECHNOLOGIES/PROJECTS/Argus Franchise Operating System/public"
os.makedirs(public_dir, exist_ok=True)

img = Image.open(src_path).convert("RGBA")
arr = np.array(img, dtype=np.float32)

# Background color is approximately [247, 247, 247]
# Let's compute distance to background [247, 247, 247]
bg_color = np.array([247.0, 247.0, 247.0])
dist = np.linalg.norm(arr[:, :, :3] - bg_color, axis=2)

# Anti-aliased alpha:
# If dist <= 6 -> fully transparent (alpha = 0)
# If dist >= 25 -> fully opaque (alpha = 255)
# Smooth linear ramp between 6 and 25
alpha = np.clip((dist - 6.0) / (25.0 - 6.0), 0.0, 1.0) * 255.0

# 1. Standard transparent logo with original colors
arr1 = arr.copy()
# Un-blend foreground from the background color: C_fg = (C_composite - C_bg*(1-a)) / a
a_norm = np.clip(alpha / 255.0, 0.001, 1.0)[:, :, np.newaxis]
arr1[:, :, :3] = np.clip((arr1[:, :, :3] - bg_color * (1.0 - a_norm)) / a_norm, 0, 255)
arr1[:, :, 3] = alpha

out1 = Image.fromarray(arr1.astype(np.uint8), mode="RGBA")
# Crop tight to bounding box with some padding
bbox = out1.getbbox()
if bbox:
    # Add a small 10px padding
    pad = 8
    bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(out1.width, bbox[2]+pad), min(out1.height, bbox[3]+pad))
    out1_cropped = out1.crop(bbox)
else:
    out1_cropped = out1

out1_path = os.path.join(public_dir, "argus-logo.png")
out1_cropped.save(out1_path, format="PNG")
print(f"Saved standard transparent logo to {out1_path} with size {out1_cropped.size}")

# 2. Dark navbar version: Orange "ARGUS" remains Orange, Dark charcoal "CNC" & tagline become White!
arr2 = arr1.copy()
# Distinguish orange pixels vs dark/charcoal pixels
# Orange has high red (R > 160) and lower blue (B < 140) and (R - B > 50)
r = arr2[:, :, 0]
g = arr2[:, :, 1]
b = arr2[:, :, 2]
a = arr2[:, :, 3]

is_orange = (r > 150) & (r - b > 40)
# Non-orange foreground pixels (charcoal text "CNC", tagline, TM, etc.)
is_dark = (a > 10) & (~is_orange)

# For dark pixels, turn them white [255, 255, 255] while preserving their alpha!
arr2[is_dark, 0] = 255
arr2[is_dark, 1] = 255
arr2[is_dark, 2] = 255

out2 = Image.fromarray(arr2.astype(np.uint8), mode="RGBA")
if bbox:
    out2_cropped = out2.crop(bbox)
else:
    out2_cropped = out2

out2_path = os.path.join(public_dir, "argus-logo-dark-navbar.png")
out2_cropped.save(out2_path, format="PNG")
print(f"Saved dark-navbar logo (orange + white text) to {out2_path} with size {out2_cropped.size}")

# 3. Clean full-color transparent logo (original) cropped
out3_path = os.path.join(public_dir, "argus-logo-original.png")
out1_cropped.save(out3_path, format="PNG")
print("Done!")
