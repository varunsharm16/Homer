import SwiftUI

struct ProductsView: View {
    var body: some View {
        VStack {
            Text("Browse furniture and decor items...")
                .font(.system(size: 16))
                .foregroundColor(Color.white.opacity(0.6))
                .padding()
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Products")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarBackground(Color.black, for: .navigationBar)
    }
}
