import SwiftUI

// MARK: - Liquid Glass View Modifier
struct LiquidGlassModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.05))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.white.opacity(0.15), lineWidth: 1)
            )
            .cornerRadius(16)
    }
}

// MARK: - Liquid Glass Button Modifier
struct LiquidGlassButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.thinMaterial)
            .background(Color.white.opacity(0.1))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .cornerRadius(12)
    }
}

// MARK: - Liquid Glass Card Modifier
struct LiquidGlassCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.05))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
            .cornerRadius(20)
    }
}

// MARK: - View Extensions
extension View {
    func liquidGlass() -> some View {
        modifier(LiquidGlassModifier())
    }
    
    func liquidGlassButton() -> some View {
        modifier(LiquidGlassButtonModifier())
    }
    
    func liquidGlassCard() -> some View {
        modifier(LiquidGlassCardModifier())
    }
}
