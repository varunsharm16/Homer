import SwiftUI

struct ProjectsView: View {
    @StateObject private var viewModel = ProjectsViewModel()
    @Binding var showUploadSheet: Bool
    @State private var isSearching = false
    @FocusState private var isFocused: Bool
    
    var body: some View {
        ZStack(alignment: .top) {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Search Bar Fixed at Top
                HStack {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search Projects", text: $viewModel.searchText)
                            .foregroundColor(.white)
                            .focused($isFocused)
                            .onChange(of: viewModel.searchText) { newValue in
                                withAnimation {
                                    isSearching = !newValue.isEmpty || isFocused
                                }
                            }
                            .onChange(of: isFocused) { focused in
                                withAnimation {
                                    isSearching = focused || !viewModel.searchText.isEmpty
                                }
                            }
                        
                        if !viewModel.searchText.isEmpty {
                            Button(action: {
                                viewModel.searchText = ""
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(10)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(10)
                    
                    if isSearching {
                        Button("Cancel") {
                            withAnimation {
                                isFocused = false
                                viewModel.searchText = ""
                                isSearching = false
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                            }
                        }
                        .foregroundColor(.white)
                        .transition(.move(edge: .trailing))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color.black)
                .zIndex(1)
                
                // Content
                ScrollView {
                    if isSearching && !viewModel.searchText.isEmpty {
                        // Search Results
                        LazyVStack(alignment: .leading, spacing: 16) {
                            ForEach(viewModel.filteredProjects) { project in
                                Button(action: {
                                    print("Selected \(project.name)")
                                }) {
                                    HStack {
                                        Text(project.name)
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.white)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.gray)
                                            .font(.system(size: 14))
                                    }
                                    .padding(16)
                                    .background(Color.white.opacity(0.05))
                                    .cornerRadius(12)
                                }
                                .padding(.horizontal, 24)
                            }
                        }
                        .padding(.top, 16)
                    } else if !isSearching {
                        // Main Content
                        VStack(alignment: .leading, spacing: 16) {
                            // Section header
                            Text("RECENT DESIGNS")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color.white.opacity(0.6))
                                .tracking(1.2)
                                .padding(.horizontal, 24)
                                .padding(.top, 8)
                            
                            // Project cards
                            ForEach(viewModel.projects) { project in
                                ProjectCard(project: project)
                                    .padding(.horizontal, 24)
                            }
                        }
                        .padding(.bottom, 100)
                    }
                }
            }
        }
        .navigationTitle("Projects")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarBackground(Color.black, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if !isSearching {
                    Button(action: { showUploadSheet = true }) {
                        Image(systemName: "plus")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 40, height: 40)
                            .liquidGlassButton()
                    }
                }
            }
        }
    }
}

struct ProjectCard: View {
    let project: Project
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Thumbnail placeholder
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.white.opacity(0.05),
                        Color.white.opacity(0.0)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                Text("3D Preview")
                    .font(.system(size: 14))
                    .foregroundColor(Color.white.opacity(0.4))
            }
            .frame(height: 200)
            .cornerRadius(20, corners: [.topLeft, .topRight])
            
            // Project info
            VStack(alignment: .leading, spacing: 8) {
                Text(project.name)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(relativeDate(from: project.lastEdited))
                    .font(.system(size: 14))
                    .foregroundColor(Color.white.opacity(0.5))
            }
            .padding(16)
        }
        .liquidGlassCard()
    }
    
    private func relativeDate(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return "Last edited \(formatter.localizedString(for: date, relativeTo: Date()))"
    }
}
