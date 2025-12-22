import SwiftUI

struct SceneEditorView: View {
    @StateObject private var viewModel = SceneViewModel()
    @Binding var isPresented: Bool
    @State private var showMaterialSheet = false
    
    var body: some View {
        ZStack {
            // 3D Scene
            SceneKitView(viewModel: viewModel, showMaterialSheet: $showMaterialSheet)
                .ignoresSafeArea()
            
            // Top navigation
            VStack {
                HStack {
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 40, height: 40)
                            .liquidGlassButton()
                    }
                    
                    Spacer()
                    
                    Text("3D Editor")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Placeholder for symmetry
                    Color.clear.frame(width: 40, height: 40)
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                .padding(.bottom, 12)
                .background(.ultraThinMaterial)
                .background(Color.black.opacity(0.6))
                .overlay(
                    Rectangle()
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 1),
                    alignment: .bottom
                )
                
                Spacer()
            }
            
            // Material selection sheet
            if showMaterialSheet {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        showMaterialSheet = false
                        viewModel.deselectObject()
                    }
                
                VStack {
                    Spacer()
                    MaterialSheet(viewModel: viewModel, isPresented: $showMaterialSheet)
                }
                .ignoresSafeArea()
            }
        }
        .preferredColorScheme(.dark)
    }
}
