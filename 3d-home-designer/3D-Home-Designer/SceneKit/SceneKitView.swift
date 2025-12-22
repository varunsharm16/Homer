import SwiftUI
import SceneKit

struct SceneKitView: UIViewRepresentable {
    @ObservedObject var viewModel: SceneViewModel
    @Binding var showMaterialSheet: Bool
    
    func makeUIView(context: Context) -> SCNView {
        let sceneView = SCNView()
        sceneView.scene = RoomScene.createScene()
        sceneView.allowsCameraControl = true
        sceneView.autoenablesDefaultLighting = false
        sceneView.backgroundColor = .white
        sceneView.antialiasingMode = .multisampling4X
        
        // Add tap gesture
        let tapGesture = UITapGestureRecognizer(
            target: context.coordinator,
            action: #selector(context.coordinator.handleTap(_:))
        )
        sceneView.addGestureRecognizer(tapGesture)
        
        context.coordinator.sceneView = sceneView
        
        return sceneView
    }
    
    func updateUIView(_ uiView: SCNView, context: Context) {
        // Update materials when colors change
        context.coordinator.updateMaterials()
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(viewModel: viewModel, showMaterialSheet: $showMaterialSheet)
    }
    
    class Coordinator: NSObject {
        var viewModel: SceneViewModel
        var showMaterialSheet: Binding<Bool>
        weak var sceneView: SCNView?
        
        init(viewModel: SceneViewModel, showMaterialSheet: Binding<Bool>) {
            self.viewModel = viewModel
            self.showMaterialSheet = showMaterialSheet
        }
        
        @objc func handleTap(_ gesture: UITapGestureRecognizer) {
            guard let sceneView = sceneView else { return }
            
            let location = gesture.location(in: sceneView)
            let hitResults = sceneView.hitTest(location, options: [:])
            
            if let hit = hitResults.first {
                let nodeName = hit.node.name ?? ""
                
                // Determine object type and create RoomObject
                if nodeName.contains("Wall") {
                    let obj = RoomObject(name: nodeName, type: .wall)
                    viewModel.selectObject(obj)
                    showMaterialSheet.wrappedValue = true
                } else if nodeName == "Floor" {
                    let obj = RoomObject(name: "Floor", type: .floor)
                    viewModel.selectObject(obj)
                    showMaterialSheet.wrappedValue = true
                } else if nodeName == "Kitchen Island" {
                    let obj = RoomObject(name: "Kitchen Island", type: .island)
                    viewModel.selectObject(obj)
                    showMaterialSheet.wrappedValue = true
                }
            }
        }
        
        func updateMaterials() {
            guard let scene = sceneView?.scene else { return }
            
            // Update floor
            if let floorNode = scene.rootNode.childNode(withName: "Floor", recursively: true),
               let color = viewModel.materials["floor"] {
                floorNode.geometry?.firstMaterial?.diffuse.contents = UIColor(color)
            }
            
            // Update walls
            for wallName in ["North Wall", "South Wall", "East Wall", "West Wall"] {
                let key = wallName.lowercased().replacingOccurrences(of: " ", with: "")
                if let wallNode = scene.rootNode.childNode(withName: wallName, recursively: true),
                   let color = viewModel.materials[key] {
                    wallNode.geometry?.firstMaterial?.diffuse.contents = UIColor(color)
                }
            }
            
            // Update island
            if let islandNode = scene.rootNode.childNode(withName: "Kitchen Island", recursively: true),
               let color = viewModel.materials["island"] {
                islandNode.geometry?.firstMaterial?.diffuse.contents = UIColor(color)
            }
        }
    }
}
