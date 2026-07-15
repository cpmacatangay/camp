package com.example.qrs.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.qrs.BuildConfig
import com.example.qrs.QRSApp
import com.example.qrs.data.remote.NetworkModule
import com.example.qrs.ui.theme.QRSCheckinTheme
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
    val initials = remember { email.firstOrNull()?.uppercase() ?: "?" }

    val serverUrl by settingsStore.serverBaseUrl.collectAsState(
        initial = BuildConfig.SERVER_BASE_URL
    )
    var urlInput by remember { mutableStateOf(serverUrl) }
    var saved by remember { mutableStateOf(false) }

    LaunchedEffect(serverUrl) {
        urlInput = serverUrl
        saved = false
    }

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
        SettingsContent(
            email = email,
            role = role,
            initials = initials,
            urlInput = urlInput,
            onUrlInputChange = { urlInput = it; saved = false },
            saved = saved,
            saveEnabled = urlInput != serverUrl,
            onSave = {
                scope.launch {
                    settingsStore.setServerBaseUrl(urlInput)
                    NetworkModule.baseUrl = urlInput
                    saved = true
                }
            },
            onLogout = onLogout,
            modifier = Modifier.padding(padding)
        )
    }
}

@Composable
private fun SettingsContent(
    email: String,
    role: String,
    initials: String,
    urlInput: String,
    onUrlInputChange: (String) -> Unit,
    saved: Boolean,
    saveEnabled: Boolean,
    onSave: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            )
        ) {
            Column(
                modifier = Modifier.padding(20.dp).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initials,
                        color = MaterialTheme.colorScheme.onPrimary,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(Modifier.height(12.dp))

                Text(
                    text = email,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(Modifier.height(4.dp))

                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = role.replaceFirstChar { it.uppercase() },
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }
        }

        Spacer(Modifier.height(28.dp))

        Text(
            text = "Server",
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                OutlinedTextField(
                    value = urlInput,
                    onValueChange = onUrlInputChange,
                    label = { Text("Base URL") },
                    placeholder = { Text("https://camp-96fi.onrender.com") },
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
                    enabled = saveEnabled,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (saved) "Saved!" else "Save")
                }
            }
        }

        Spacer(Modifier.height(28.dp))

        Text(
            text = "Actions",
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = null,
                    modifier = Modifier.padding(end = 8.dp)
                )
                Text("Logout")
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Settings - Admin")
@Composable
private fun SettingsAdminPreview() {
    QRSCheckinTheme {
        SettingsContent(
            email = "admin@camp.com",
            role = "admin",
            initials = "A",
            urlInput = "https://camp-96fi.onrender.com",
            onUrlInputChange = {},
            saved = false,
            saveEnabled = false,
            onSave = {},
            onLogout = {}
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
            initials = "S",
            urlInput = "https://camp-96fi.onrender.com",
            onUrlInputChange = {},
            saved = true,
            saveEnabled = false,
            onSave = {},
            onLogout = {}
        )
    }
}
