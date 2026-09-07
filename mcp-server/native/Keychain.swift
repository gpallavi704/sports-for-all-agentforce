import AppKit
import Foundation
import Security
import Darwin

// Fixed local-development item. No arbitrary account selection or secret argv.
let service = "com.sportcompass.agentapi.00DgL00000c7pj3UAA"
let account = "client-credentials"
func stop(_ code: String) -> Never {
    FileHandle.standardError.write(Data((code + "\n").utf8))
    exit(1)
}
func valid(_ value: String) -> Bool {
    !value.isEmpty && value.utf8.count <= 4096 &&
    value.rangeOfCharacter(from: .whitespacesAndNewlines.union(.controlCharacters)) == nil
}
let args = Array(CommandLine.arguments.dropFirst())
guard args.count == 1, ["setup", "read", "self-check"].contains(args[0]) else { stop("INVALID_MODE") }
// Self-check touches neither credentials nor the Keychain.
if args[0] == "self-check" {
    print("Sport Compass Keychain helper compiled; no Keychain access performed.")
    exit(0)
}
var query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: account
]
if args[0] == "read" {
    guard isatty(STDOUT_FILENO) == 0 else { stop("PIPE_REQUIRED") }
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    var item: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
          let data = item as? Data, data.count <= 16384 else { stop("KEYCHAIN_UNAVAILABLE") }
    // Private subprocess pipe only. Never launch read from a terminal/tool.
    FileHandle.standardOutput.write(data)
    exit(0)
}
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let alert = NSAlert()
alert.messageText = "Store Sport Compass Salesforce credentials"
alert.informativeText = "Only for Sport Compass MCP in orgfarm-4d89d5ac56. Enter the Consumer Key and Consumer Secret from that app. Stored in your macOS Keychain, not project files. Cancel if unsure."
alert.addButton(withTitle: "Store in Keychain")
alert.addButton(withTitle: "Cancel")
let view = NSView(frame: NSRect(x: 0, y: 0, width: 420, height: 112))
let key = NSSecureTextField(frame: NSRect(x: 0, y: 62, width: 420, height: 24))
let secret = NSSecureTextField(frame: NSRect(x: 0, y: 6, width: 420, height: 24))
for (title, y) in [("Consumer Key", 90.0), ("Consumer Secret", 34.0)] {
    let label = NSTextField(labelWithString: title)
    label.frame = NSRect(x: 0, y: y, width: 420, height: 20)
    view.addSubview(label)
}
key.setAccessibilityLabel("Salesforce Consumer Key")
secret.setAccessibilityLabel("Salesforce Consumer Secret")
view.addSubview(key); view.addSubview(secret)
alert.accessoryView = view
alert.window.initialFirstResponder = key
key.nextKeyView = secret
app.activate(ignoringOtherApps: true)
guard alert.runModal() == .alertFirstButtonReturn else { stop("SETUP_CANCELLED") }
guard valid(key.stringValue), valid(secret.stringValue),
      let data = try? JSONSerialization.data(withJSONObject: ["clientId": key.stringValue, "clientSecret": secret.stringValue]) else { stop("INVALID_CREDENTIALS") }
key.stringValue = ""; secret.stringValue = ""
query[kSecValueData as String] = data
query[kSecAttrLabel as String] = "Sport Compass Salesforce API (local development)"
// Default macOS file-based Keychain ACL. No all-app access or sync opt-in.
let status = SecItemAdd(query as CFDictionary, nil)
if status == errSecDuplicateItem { stop("ITEM_EXISTS_NO_OVERWRITE") }
guard status == errSecSuccess else { stop("KEYCHAIN_STORE_FAILED") }
print("Credentials stored in Keychain. No authentication request made.")
