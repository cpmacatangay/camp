package com.example.qrs

import android.app.Application
import com.example.qrs.data.local.AuthStore
import com.example.qrs.data.local.SettingsStore
import com.example.qrs.data.remote.NetworkModule

class QRSApp : Application() {
    companion object {
        lateinit var instance: QRSApp
            private set
    }

    lateinit var authStore: AuthStore
        private set
    lateinit var settingsStore: SettingsStore
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        authStore = AuthStore(this)
        settingsStore = SettingsStore(this)

        val savedToken = authStore.getToken()
        if (savedToken != null) {
            NetworkModule.setToken(savedToken)
        }
    }
}
