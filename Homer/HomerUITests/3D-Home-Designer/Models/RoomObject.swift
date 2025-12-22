import Foundation
import SwiftUI

enum RoomObjectType {
    case wall
    case floor
    case island
}

struct RoomObject: Identifiable, Equatable {
    let id = UUID()
    let name: String
    let type: RoomObjectType
    
    static func == (lhs: RoomObject, rhs: RoomObject) -> Bool {
        lhs.id == rhs.id
    }
}
