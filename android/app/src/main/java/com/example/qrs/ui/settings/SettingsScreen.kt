package com.example.qrs.ui.settings

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.qrs.BuildConfig
import com.example.qrs.QRSApp
import com.example.qrs.data.remote.NetworkModule
import com.example.qrs.ui.theme.QRSCheckinTheme
import com.example.qrs.ui.theme.OnSecondaryContainer
import com.example.qrs.ui.theme.SecondaryContainer
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onLogout: () -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val settingsStore = QRSApp.instance.settingsStore
    val authStore = QRSApp.instance.authStore

    val email = remember { authStore.getEmail() ?: "" }
    val role = remember { authStore.getRole() ?: "" }

    val serverUrl by settingsStore.serverBaseUrl.collectAsState(
        initial = BuildConfig.SERVER_BASE_URL
    )
    var urlInput by remember { mutableStateOf(serverUrl) }
    var saved by remember { mutableStateOf(false) }

    LaunchedEffect(serverUrl) {
        urlInput = serverUrl
        saved = false
    }

    SettingsContent(
        email = email,
        role = role,
        urlInput = urlInput,
        onUrlInputChange = {
            urlInput = it
            saved = false
        },
        saved = saved,
        onSave = {
            scope.launch {
                settingsStore.setServerBaseUrl(urlInput)
                NetworkModule.baseUrl = urlInput
                saved = true
            }
        },
        saveEnabled = urlInput != serverUrl,
        onLogout = onLogout,
        onBack = onBack
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SettingsContent(
    email: String,
    role: String,
    urlInput: String,
    onUrlInputChange: (String) -> Unit,
    saved: Boolean,
    onSave: () -> Unit,
    saveEnabled: Boolean,
    onLogout: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "Account",
                style = MaterialTheme.typography.titleSmall
            )
            Spacer(Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = SecondaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = email,
                        style = MaterialTheme.typography.bodyLarge,
                        color = OnSecondaryContainer
                    )
                    Text(
                        text = "Role: $role",
                        style = MaterialTheme.typography.bodyMedium,
                        color = OnSecondaryContainer.copy(alpha = 0.7f)
                    )
                }
            }

            Spacer(Modifier.height(28.dp))

            Text(
                text = "Server URL",
                style = MaterialTheme.typography.titleSmall
            )
            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = urlInput,
                onValueChange = onUrlInputChange,
                label = { Text("Base URL") },
                placeholder = { Text("http://192.168.1.13:5000") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Dns,
                        contentDescription = null
                    )
                },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(8.dp))

            Button(
                onClick = onSave,
                enabled = saveEnabled
            ) {
                Text(if (saved) "Saved!" else "Save")
            }

            Spacer(Modifier.height(32.dp))

            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = null,
                    modifier = Modifier.padding(end = 8.dp)
                )
                Text("Logout")
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Settings - Admin")
@Composable
private fun SettingsAdminPreview() {
    QRSCheckinTheme {
        SettingsContent(
            email = "admin@camp.com",
            role = "admin",
            urlInput = "http://192.168.1.13:5000",
            onUrlInputChange = {},
            saved = false,
            onSave = {},
            saveEnabled = false,
            onLogout = {},
            onBack = {}
        )
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Settings - Staff")
@Composable
private fun SettingsStaffPreview() {
    QRSCheckinTheme {
        SettingsContent(
            email = "scanner@camp.com",
            role = "staff",
            urlInput = "http://localhost:5000",
            onUrlInputChange = {},
            saved = true,
            onSave = {},
            saveEnabled = false,
            onLogout = {},
            onBack = {}
        )
    }
}
