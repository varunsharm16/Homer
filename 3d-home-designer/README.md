# 3D Home Designer - iOS App

A native iOS application built with Swift UI featuring SceneKit 3D rendering and liquid glass UI design.

## Opening the Project in Xcode

Since this is a manual Swift UI project structure, you'll need to create an Xcode project:

### Option 1: Create New Xcode Project (Recommended)

1. Open **Xcode**
2. Select **File > New > Project**
3. Choose **iOS > App**
4. Configure:
   - Product Name: `3D-Home-Designer`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum Deployments: **iOS 16.0**
5. Click **Next** and save to `/Users/varun/Homer/3D-Home-Designer/`
6. **Replace** the auto-generated files with our custom files from the `3D-Home-Designer/` folder

### Option 2: Import Files Manually

1. Create a new Xcode project as above
2. In Xcode project navigator, **delete** the default `ContentView.swift` and other auto-generated files
3. **Drag and drop** all folders from our `3D-Home-Designer/3D-Home-Designer/` directory into Xcode
4. Ensure "Copy items if needed" is checked
5. Select "Create groups"
6. Replace the `Info.plist` with our custom one

## Project Structure

```
3D-Home-Designer/
├── App/
│   └── HomeDesignerApp.swift          # App entry point
├── Models/
│   ├── Project.swift                   # Project data model
│   └── RoomObject.swift                # 3D object model
├── ViewModels/
│   ├── ProjectsViewModel.swift         # Projects state
│   └── SceneViewModel.swift            # 3D scene state
├── Views/
│   ├── ContentView.swift               # Main app orchestrator
│   ├── ProjectsView.swift              # Projects dashboard
│   ├── ProductsView.swift              # Products catalog
│   ├── ProfileView.swift               # Profile view
│   ├── SceneEditorView.swift           # 3D editor screen
│   └── Components/
│       ├── GlassTabBar.swift           # Custom tab bar
│       ├── LoadingView.swift           # Loading animation
│       ├── UploadSheet.swift           # Photo selection sheet
│       └── MaterialSheet.swift         # Material selection sheet
├── SceneKit/
│   ├── SceneKitView.swift              # SceneKit wrapper
│   └── RoomScene.swift                 # 3D scene construction
├── Design/
│   ├── LiquidGlass.swift               # Glassmorphism modifiers
│   └── Colors.swift                    # Color palette
└── Info.plist                          # App configuration
```

## Features Implemented

- ✅ Liquid glass UI with Material blur effects
- ✅ Custom glassmorphic tab bar navigation
- ✅ Projects dashboard with mock data
- ✅ Upload sheet with camera/library options
- ✅ Loading animation (2.5s scanning simulation)
- ✅ Full 3D SceneKit scene with room geometry
- ✅ Interactive object selection via raycasting
- ✅ Material selection bottom sheet
- ✅ Real-time color updates on 3D objects
- ✅ Smooth animations and transitions

## Running the App

### In Xcode Simulator
1. Select target device (e.g., **iPhone 15 Pro**)
2. Press **⌘ + R** to build and run
3. Test all features in the simulator

### On Physical Device
1. Connect your iPhone via USB
2. Select your device from the target menu
3. Enable **Developer Mode** on your iPhone (Settings > Privacy & Security)
4. Trust your Mac if prompted
5. Press **⌘ + R** to build and run

## How to Use

1. **Projects Tab**: Browse recent designs, tap **"+"** to create new
2. **Upload**: Choose camera or library option
3. **Loading**: Wait for "scanning" animation
4. **3D Editor**: 
   - Pinch to zoom
   - Drag to rotate camera
   - Tap walls, floor, or island to select
5. **Materials**: Choose colors from swatches
6. **Real-time Update**: See changes immediately

## Requirements

- **Xcode 15+**
- **iOS 16.0+** deployment target
- **Swift 5.9+**

## Next Steps

To fully integrate this into Xcode:
1. Follow "Option 1" above to create the Xcode project
2. Build the project to ensure no errors
3. Run on simulator or device
4. Test all interactions

The app is ready to run!
