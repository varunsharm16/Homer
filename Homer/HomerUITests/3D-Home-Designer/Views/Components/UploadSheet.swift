import SwiftUI
import PhotosUI

struct UploadSheet: View {
    @Binding var isPresented: Bool
    var onCameraSelected: () -> Void
    var onLibrarySelected: () -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // Drag indicator
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.white.opacity(0.3))
                .frame(width: 48, height: 5)
                .padding(.top, 12)
                .padding(.bottom, 24)
            
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Create New Project")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Choose how to capture your space")
                    .font(.system(size: 14))
                    .foregroundColor(Color.white.opacity(0.6))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
            
            // Options
            VStack(spacing: 12) {
                OptionButton(
                    icon: "camera.fill",
                    title: "Take Photo",
                    subtitle: "Use camera to capture space",
                    action: {
                        isPresented = false
                        onCameraSelected()
                    }
                )
                
                OptionButton(
                    icon: "photo.fill",
                    title: "Choose from Library",
                    subtitle: "Upload from camera roll",
                    action: {
                        isPresented = false
                        onLibrarySelected()
                    }
                )
            }
            .padding(.horizontal, 24)
            
            // Cancel button
            Button(action: { isPresented = false }) {
                Text("Cancel")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .liquidGlass()
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
            .padding(.bottom, 8)
        }
        .padding(.bottom, 24)
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

struct OptionButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.1))
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: icon)
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(subtitle)
                        .font(.system(size: 14))
                        .foregroundColor(Color.white.opacity(0.6))
                }
                
                Spacer()
            }
            .padding(16)
            .liquidGlassButton()
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// Custom corner radius extension
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
