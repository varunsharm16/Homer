import SwiftUI

struct MaterialSheet: View {
    @ObservedObject var viewModel: SceneViewModel
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Drag indicator
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.white.opacity(0.3))
                .frame(width: 48, height: 5)
                .padding(.top, 12)
                .padding(.bottom, 16)
            
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(viewModel.selectedObject?.name ?? "")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Select a material")
                        .font(.system(size: 14))
                        .foregroundColor(Color.white.opacity(0.6))
                }
                
                Spacer()
                
                Button(action: { isPresented = false }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .liquidGlassButton()
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
            
            // Color swatches
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.getMaterialOptions(), id: \.name) { option in
                        VStack(spacing: 8) {
                            Button(action: {
                                viewModel.updateMaterial(color: option.color)
                            }) {
                                Circle()
                                    .fill(option.color)
                                    .frame(width: 64, height: 64)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white.opacity(0.2), lineWidth: 2)
                                    )
                                    .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                            }
                            .buttonStyle(ScaleButtonStyle())
                            
                            Text(option.name)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(Color.white.opacity(0.8))
                        }
                    }
                }
                .padding(.horizontal, 24)
            }
            .padding(.bottom, 8)
        }
        .padding(.bottom, 24)
        .frame(maxHeight: UIScreen.main.bounds.height * 0.5)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.1))
        .overlay(
            Rectangle()
                .fill(Color.white.opacity(0.2))
                .frame(height: 1),
            alignment: .top
        )
        .cornerRadius(24, corners: [.topLeft, .topRight])
    }
}

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}
