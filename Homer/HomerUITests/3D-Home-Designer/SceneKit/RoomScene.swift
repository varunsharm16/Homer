import SceneKit
import UIKit

class RoomScene {
    static func createScene() -> SCNScene {
        let scene = SCNScene()
        
        // Create camera
        let cameraNode = SCNNode()
        cameraNode.camera = SCNCamera()
        cameraNode.position = SCNVector3(x: 8, y: 8, z: 8)
        cameraNode.look(at: SCNVector3(0, 2, 0))
        scene.rootNode.addChildNode(cameraNode)
        
        // Add lights
        let ambientLight = SCNNode()
        ambientLight.light = SCNLight()
        ambientLight.light!.type = .ambient
        ambientLight.light!.intensity = 600
        scene.rootNode.addChildNode(ambientLight)
        
        let directionalLight1 = SCNNode()
        directionalLight1.light = SCNLight()
        directionalLight1.light!.type = .directional
        directionalLight1.light!.intensity = 800
        directionalLight1.position = SCNVector3(x: 10, y: 10, z: 5)
        directionalLight1.look(at: SCNVector3(0, 0, 0))
        scene.rootNode.addChildNode(directionalLight1)
        
        let directionalLight2 = SCNNode()
        directionalLight2.light = SCNLight()
        directionalLight2.light!.type = .directional
        directionalLight2.light!.intensity = 400
        directionalLight2.position = SCNVector3(x: -10, y: 10, z: -5)
        directionalLight2.look(at: SCNVector3(0, 0, 0))
        scene.rootNode.addChildNode(directionalLight2)
        
        // Create floor
        let floor = createFloor()
        scene.rootNode.addChildNode(floor)
        
        // Create walls
        let northWall = createWall(name: "North Wall", position: SCNVector3(0, 2.5, -5), size: (10, 5, 0.2))
        let southWall = createWall(name: "South Wall", position: SCNVector3(0, 2.5, 5), size: (10, 5, 0.2))
        let eastWall = createWall(name: "East Wall", position: SCNVector3(5, 2.5, 0), size: (0.2, 5, 10))
        let westWall = createWall(name: "West Wall", position: SCNVector3(-5, 2.5, 0), size: (0.2, 5, 10))
        
        scene.rootNode.addChildNode(northWall)
        scene.rootNode.addChildNode(southWall)
        scene.rootNode.addChildNode(eastWall)
        scene.rootNode.addChildNode(westWall)
        
        // Create kitchen island
        let island = createIsland()
        scene.rootNode.addChildNode(island)
        
        return scene
    }
    
    static func createFloor() -> SCNNode {
        let floorGeometry = SCNPlane(width: 10, height: 10)
        let floorMaterial = SCNMaterial()
        floorMaterial.diffuse.contents = UIColor(red: 0.76, green: 0.60, blue: 0.42, alpha: 1.0) // Oak
        floorMaterial.lightingModel = .physicallyBased
        floorGeometry.materials = [floorMaterial]
        
        let floorNode = SCNNode(geometry: floorGeometry)
        floorNode.name = "Floor"
        floorNode.eulerAngles.x = -.pi / 2
        floorNode.position = SCNVector3(0, 0, 0)
        
        return floorNode
    }
    
    static func createWall(name: String, position: SCNVector3, size: (CGFloat, CGFloat, CGFloat)) -> SCNNode {
        let wallGeometry = SCNBox(width: size.0, height: size.1, length: size.2, chamferRadius: 0)
        let wallMaterial = SCNMaterial()
        wallMaterial.diffuse.contents = UIColor.white
        wallMaterial.lightingModel = .physicallyBased
        wallGeometry.materials = [wallMaterial]
        
        let wallNode = SCNNode(geometry: wallGeometry)
        wallNode.name = name
        wallNode.position = position
        
        return wallNode
    }
    
    static func createIsland() -> SCNNode {
        let islandGeometry = SCNBox(width: 2.5, height: 1.5, length: 1.5, chamferRadius: 0.05)
        let islandMaterial = SCNMaterial()
        islandMaterial.diffuse.contents = UIColor(red: 0.18, green: 0.18, blue: 0.18, alpha: 1.0) // Charcoal
        islandMaterial.lightingModel = .physicallyBased
        islandGeometry.materials = [islandMaterial]
        
        let islandNode = SCNNode(geometry: islandGeometry)
        islandNode.name = "Kitchen Island"
        islandNode.position = SCNVector3(0, 0.75, 0)
        
        return islandNode
    }
}
