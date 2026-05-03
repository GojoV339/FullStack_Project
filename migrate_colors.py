import os

color_map = {
    "#7C9A6D": "#b50346",
    "#7c9a6d": "#b50346",
    "#B7C9A8": "#d45c7e",
    "#b7c9a8": "#d45c7e",
    "#5F7A55": "#8a0235",
    "#5f7a55": "#8a0235",
    "#FFFDF9": "#eeeeee",
    "#fffdf9": "#eeeeee",
    "#FFFFFF": "#eeeeee",
    "#ffffff": "#eeeeee",
    "#F7F4EF": "#e0e0e0",
    "#f7f4ef": "#e0e0e0",
    "#EDE7DF": "#d6d6d6",
    "#ede7df": "#d6d6d6",
    "#F0F5ED": "#e0e0e0",
    "#f0f5ed": "#e0e0e0",
    "124, 154, 109": "181, 3, 70",
    "124,154,109": "181,3,70",
    "255, 255, 255": "238, 238, 238",
    "255,255,255": "238,238,238",
    "bg-white": "bg-[#eeeeee]",
    "text-white": "text-[#eeeeee]",
    "border-white": "border-[#eeeeee]"
}

exclude_dirs = {'.git', 'node_modules', '.next'}
extensions = {'.tsx', '.ts', '.jsx', '.js', '.css', '.html'}

print("Starting migration...")
count = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in color_map.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")
                    count += 1
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"Migration completed. Updated {count} files.")
