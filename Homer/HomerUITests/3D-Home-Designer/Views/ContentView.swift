import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showUploadSheet = false
    @State private var showLoading = false
    @State private var showEditor = false
    
    init() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = .black
        appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        UINavigationBar.appearance().tintColor = .white
    }
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            // Main tab content
            if !showEditor {
                TabContent(selectedTab: $selectedTab, showUploadSheet: $showUploadSheet)
            }
            
            // Loading screen
            if showLoading {
                LoadingView()
                    .transition(.opacity)
                    .zIndex(1)
            }
            
            // 3D Editor
            if showEditor {
                SceneEditorView(isPresented: $showEditor)
                    .transition(.move(edge: .bottom))
                    .zIndex(2)
            }
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showUploadSheet) {
            UploadSheet(
                isPresented: $showUploadSheet,
                onCameraSelected: handleCameraSelection,
                onLibrarySelected: handleLibrarySelection
            )
            .presentationDetents([.medium])
            .presentationDragIndicator(.hidden)
        }
    }
    
    private func handleCameraSelection() {
        // Future: implement camera capture
        startScanning()
    }
    
    private func handleLibrarySelection() {
        // Future: implement photo picker
        startScanning()
    }
    
    private func startScanning() {
        withAnimation {
            showLoading = true
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation {
                showLoading = false
                showEditor = true
            }
        }
    }
}

struct TabContent: View {
    @Binding var selectedTab: Int
    @Binding var showUploadSheet: Bool
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            // Tab views
            VStack(spacing: 0) {
                Group {
                    if selectedTab == 0 {
                        NavigationView {
                            ProjectsView(showUploadSheet: $showUploadSheet)
                        }
                        .navigationViewStyle(StackNavigationViewStyle())
                    } else if selectedTab == 1 {
                        NavigationView {
                            ProductsView()
                        }
                        .navigationViewStyle(StackNavigationViewStyle())
                    } else {
                        NavigationView {
                            ProfileView()
                        }
                        .navigationViewStyle(StackNavigationViewStyle())
                    }
                }
                
                Spacer()
            }
            
            // Custom glass tab bar
            VStack {
                Spacer()
                GlassTabBar(selectedTab: $selectedTab)
            }
            .ignoresSafeArea(edges: .bottom)
        }
    }
}

