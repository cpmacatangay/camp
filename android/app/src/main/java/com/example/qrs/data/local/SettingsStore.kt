package com.example.qrs.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.qrs.BuildConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsStore(private val context: Context) {
    private data object Keys {
        val SERVER_BASE_URL = stringPreferencesKey("server_base_url")
    }

    val serverBaseUrl: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[Keys.SERVER_BASE_URL] ?: BuildConfig.SERVER_BASE_URL
    }

    suspend fun getServerBaseUrlSync(): String {
        return context.dataStore.data.first()[Keys.SERVER_BASE_URL] ?: BuildConfig.SERVER_BASE_URL
    }

    suspend fun setServerBaseUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.SERVER_BASE_URL] = url.trimEnd('/')
        }
    }
}
