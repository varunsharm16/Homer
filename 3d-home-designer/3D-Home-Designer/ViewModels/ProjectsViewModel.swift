import SwiftUI
internal import Combine

final class ProjectsViewModel: ObservableObject {
    
    @Published var projects: [Project] = []
    @Published var searchText: String = ""
    
    var filteredProjects: [Project] {
        if searchText.isEmpty {
            return []
        } else {
            return projects.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    init() {
        loadMockProjects()
    }
    
    private func loadMockProjects() {
        let calendar = Calendar.current
        projects = [
            Project(
                name: "Modern Kitchen",
                lastEdited: calendar.date(byAdding: .day, value: -2, to: Date()) ?? Date(),
                thumbnail: nil
            ),
            Project(
                name: "Living Room",
                lastEdited: calendar.date(byAdding: .day, value: -5, to: Date()) ?? Date(),
                thumbnail: nil
            ),
            Project(
                name: "Bedroom",
                lastEdited: calendar.date(byAdding: .weekOfYear, value: -1, to: Date()) ?? Date(),
                thumbnail: nil
            )
        ]
    }
}

