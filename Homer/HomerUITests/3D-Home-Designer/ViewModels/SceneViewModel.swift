import SwiftUI
import SceneKit
internal import Combine

class SceneViewModel: ObservableObject {
    @Published var selectedObject: RoomObject?
    @Published var materials: [String: Color] = [
        "floor": Color(red: 0.76, green: 0.60, blue: 0.42), // Oak
        "northWall": .white,
        "southWall": .white,
        "eastWall": .white,
        "westWall": .white,
        "island": Color(red: 0.18, green: 0.18, blue: 0.18) // Charcoal
    ]
    
    func selectObject(_ object: RoomObject) {
        selectedObject = object
    }
    
    func deselectObject() {
        selectedObject = nil
    }
    
    func updateMaterial(color: Color) {
        guard let object = selectedObject else { return }
        
        let key = object.name.lowercased().replacingOccurrences(of: " ", with: "")
        materials[key] = color
    }
    
    func getMaterialOptions() -> [(name: String, color: Color)] {
        guard let object = selectedObject else { return [] }
        
        switch object.type {
        case .wall:
            return MaterialColors.wallColors
        case .floor:
            return MaterialColors.floorColors
        case .island:
            return MaterialColors.islandColors
        }
    }
}
