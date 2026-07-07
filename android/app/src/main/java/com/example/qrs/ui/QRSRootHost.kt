package com.example.qrs.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.qrs.QRSApp
import com.example.qrs.data.remote.NetworkModule
import com.example.qrs.ui.login.LoginScreen
import com.example.qrs.ui.scanner.ScannerScreen
import com.example.qrs.ui.settings.SettingsScreen

@Composable
fun QRSRootHost() {
    val navController = rememberNavController()
    val authStore = QRSApp.instance.authStore
    val hasToken = authStore.getToken() != null
    val startDest = if (hasToken) "scanner" else "login"

    NavHost(navController = navController, startDestination = startDest) {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("scanner") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        composable("scanner") {
            ScannerScreen(
                onLogout = {
                    authStore.clear()
                    NetworkModule.setToken(null)
                    navController.navigate("login") {
                        popUpTo("scanner") { inclusive = true }
                    }
                },
                onSettings = {
                    navController.navigate("settings")
                }
            )
        }
        composable("settings") {
            SettingsScreen(
                onLogout = {
                    authStore.clear()
                    NetworkModule.setToken(null)
                    navController.navigate("login") {
                        popUpTo("scanner") { inclusive = true }
                        popUpTo("settings") { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
