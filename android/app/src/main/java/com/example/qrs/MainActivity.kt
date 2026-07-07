package com.example.qrs

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.qrs.ui.QRSRootHost
import com.example.qrs.ui.theme.QRSCheckinTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QRSCheckinTheme {
                QRSRootHost()
            }
        }
    }
}
