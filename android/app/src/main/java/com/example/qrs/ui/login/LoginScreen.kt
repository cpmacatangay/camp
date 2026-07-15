package com.example.qrs.ui.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.qrs.ui.theme.QRSCheckinTheme

@Composable
fun LoginScreen(
    viewModel: LoginViewModel = viewModel(),
    onLoginSuccess: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    LaunchedEffect(state) {
        if (state is LoginState.Success) {
            onLoginSuccess()
            viewModel.reset()
        }
    }

    LoginForm(
        email = email,
        onEmailChange = {
            email = it
            if (state is LoginState.Error) viewModel.reset()
        },
        password = password,
        onPasswordChange = {
            password = it
            if (state is LoginState.Error) viewModel.reset()
        },
        passwordVisible = passwordVisible,
        onTogglePassword = { passwordVisible = !passwordVisible },
        state = state,
        onLogin = { viewModel.login(email, password) },
        onDone = { viewModel.login(email, password) }
    )
}

@Composable
private fun LoginForm(
    email: String,
    onEmailChange: (String) -> Unit,
    password: String,
    onPasswordChange: (String) -> Unit,
    passwordVisible: Boolean,
    onTogglePassword: () -> Unit,
    state: LoginState,
    onLogin: () -> Unit,
    onDone: () -> Unit
) {
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "QRS",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = email,
            onValueChange = onEmailChange,
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            keyboardActions = KeyboardActions(
                onNext = { focusManager.moveFocus(FocusDirection.Down) }
            ),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(10.dp))

        OutlinedTextField(
            value = password,
            onValueChange = onPasswordChange,
            label = { Text("Password") },
            visualTransformation = if (passwordVisible) VisualTransformation.None
            else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
                onDone = {
                    focusManager.clearFocus()
                    onDone()
                }
            ),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            trailingIcon = {
                TextButton(onClick = onTogglePassword) {
                    Text(if (passwordVisible) "Hide" else "Show")
                }
            }
        )

        Spacer(Modifier.height(26.dp))

        Button(
            onClick = onLogin,
            enabled = state !is LoginState.Loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        ) {
            if (state is LoginState.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.height(24.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Log in", style = MaterialTheme.typography.titleMedium)
            }
        }

        if (state is LoginState.Error) {
            Spacer(Modifier.height(12.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Filled.ErrorOutline,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error,
                    modifier = Modifier.height(16.dp)
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    text = (state as LoginState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.labelMedium
                )
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Login - Idle")
@Composable
private fun LoginFormIdlePreview() {
    QRSCheckinTheme {
        LoginForm(
            email = "",
            onEmailChange = {},
            password = "",
            onPasswordChange = {},
            passwordVisible = false,
            onTogglePassword = {},
            state = LoginState.Idle,
            onLogin = {},
            onDone = {}
        )
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Login - Filled")
@Composable
private fun LoginFormFilledPreview() {
    QRSCheckinTheme {
        LoginForm(
            email = "staff@camp.com",
            onEmailChange = {},
            password = "mypassword",
            onPasswordChange = {},
            passwordVisible = false,
            onTogglePassword = {},
            state = LoginState.Idle,
            onLogin = {},
            onDone = {}
        )
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Login - Loading")
@Composable
private fun LoginFormLoadingPreview() {
    QRSCheckinTheme {
        LoginForm(
            email = "staff@camp.com",
            onEmailChange = {},
            password = "mypassword",
            onPasswordChange = {},
            passwordVisible = false,
            onTogglePassword = {},
            state = LoginState.Loading,
            onLogin = {},
            onDone = {}
        )
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Login - Error")
@Composable
private fun LoginFormErrorPreview() {
    QRSCheckinTheme {
        LoginForm(
            email = "wrong@email.com",
            onEmailChange = {},
            password = "wrong",
            onPasswordChange = {},
            passwordVisible = false,
            onTogglePassword = {},
            state = LoginState.Error("Invalid email or password"),
            onLogin = {},
            onDone = {}
        )
    }
}
