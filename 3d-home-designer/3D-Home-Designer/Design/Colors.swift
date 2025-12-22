import SwiftUI

// MARK: - Color Palette
extension Color {
    // Monochrome Palette
    static let deepBlack = Color(red: 0, green: 0, blue: 0)
    static let pureWhite = Color(red: 1, green: 1, blue: 1)
    static let darkGrey = Color(red: 0.15, green: 0.15, blue: 0.15)
    static let mediumGrey = Color(red: 0.5, green: 0.5, blue: 0.5)
    static let lightGrey = Color(red: 0.85, green: 0.85, blue: 0.85)
}

// MARK: - Material Colors
struct MaterialColors {
    static let wallColors: [(name: String, color: Color)] = [
        ("Pure White", Color(red: 1.0, green: 1.0, blue: 1.0)),
        ("Warm Grey", Color(red: 0.9, green: 0.9, blue: 0.9)),
        ("Charcoal", Color(red: 0.18, green: 0.18, blue: 0.18)),
        ("Navy Blue", Color(red: 0.12, green: 0.23, blue: 0.37)),
        ("Sage Green", Color(red: 0.61, green: 0.69, blue: 0.53)),
        ("Terracotta", Color(red: 0.76, green: 0.31, blue: 0.18))
    ]
    
    static let floorColors: [(name: String, color: Color)] = [
        ("Oak", Color(red: 0.76, green: 0.60, blue: 0.42)),
        ("Walnut", Color(red: 0.36, green: 0.25, blue: 0.20)),
        ("White Marble", Color(red: 0.96, green: 0.96, blue: 0.96)),
        ("Black Marble", Color(red: 0.10, green: 0.10, blue: 0.10)),
        ("Grey Tile", Color(red: 0.50, green: 0.55, blue: 0.55)),
        ("Concrete", Color(red: 0.58, green: 0.65, blue: 0.65))
    ]
    
    static let islandColors: [(name: String, color: Color)] = [
        ("White", Color(red: 1.0, green: 1.0, blue: 1.0)),
        ("Black", Color(red: 0.0, green: 0.0, blue: 0.0)),
        ("Navy", Color(red: 0.12, green: 0.23, blue: 0.37)),
        ("Wood", Color(red: 0.55, green: 0.44, blue: 0.28)),
        ("Marble", Color(red: 0.93, green: 0.94, blue: 0.95)),
        ("Steel", Color(red: 0.58, green: 0.65, blue: 0.65))
    ]
}
