import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController {
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)

        // Enable pinch-to-zoom by ignoring viewport scale limits
        // This makes WKWebView behave like Safari - always allowing zoom
        // regardless of the viewport meta tag's maximum-scale setting
        config.ignoresViewportScaleLimits = true

        return config
    }
}
