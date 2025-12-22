import SwiftUI

struct ProfileView: View {
    var body: some View {
        VStack {
            Text("Your profile settings...")
                .font(.system(size: 16))
                .foregroundColor(Color.white.opacity(0.6))
                .padding()
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarBackground(Color.black, for: .navigationBar)
    }
}
