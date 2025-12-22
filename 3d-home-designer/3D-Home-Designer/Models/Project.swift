import Foundation

struct Project: Identifiable {
    let id = UUID()
    let name: String
    let lastEdited: Date
    let thumbnail: String? // Future: actual image data
}
