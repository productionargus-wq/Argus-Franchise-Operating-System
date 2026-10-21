# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_all, collect_submodules

datas = [
    ('dist_build/node.exe', '.'),
    ('dist_build/app_bundle.zip', '.'),
    ('public/favicon.ico', '.'),
]

binaries = [
    (r'C:\Users\HP\AppData\Local\Programs\Python\Python312\python312.dll', '.'),
    (r'C:\Users\HP\AppData\Local\Programs\Python\Python312\python3.dll', '.'),
    (r'C:\Users\HP\AppData\Local\Programs\Python\Python312\vcruntime140.dll', '.'),
    (r'C:\Users\HP\AppData\Local\Programs\Python\Python312\vcruntime140_1.dll', '.'),
    (r'C:\Windows\System32\msvcp140.dll', '.'),
]

hiddenimports = [
    'webview',
    'webview.platforms.winforms',
    'clr',
    'pythonnet',
    'urllib.request',
    'zipfile',
    'subprocess',
    'json',
    'shutil',
    'atexit',
]

# Collect all hooks for pywebview and pythonnet
tmp_datas, tmp_binaries, tmp_hidden = collect_all('webview')
datas += tmp_datas
binaries += tmp_binaries
hiddenimports += tmp_hidden

tmp_datas2, tmp_binaries2, tmp_hidden2 = collect_all('pythonnet')
datas += tmp_datas2
binaries += tmp_binaries2
hiddenimports += tmp_hidden2

a = Analysis(
    ['scripts/desktop_launcher.py'],
    pathex=['.'],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Argus_Franchise_OS',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='public/favicon.ico',
)
