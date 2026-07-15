package com.example.qrs.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.qrs.QRSApp
import com.example.qrs.data.remote.LoginRequest
import com.example.qrs.data.remote.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class LoginState {
    data object Idle : LoginState()
    data object Loading : LoginState()
    data object Success : LoginState()
    data class Error(val message: String) : LoginState()
}

class LoginViewModel : ViewModel() {
    private val api get() = NetworkModule.getApi()
    private val authStore = QRSApp.instance.authStore

    private val _state = MutableStateFlow<LoginState>(LoginState.Idle)
    val state: StateFlow<LoginState> = _state.asStateFlow()

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _state.value = LoginState.Error("Email and password are required")
            return
        }

        _state.value = LoginState.Loading

        viewModelScope.launch {
            try {
                val response = api.login(LoginRequest(email.trim(), password))
                if (response.isSuccessful) {
                    val body = response.body()!!
                    if (body.mustChangePassword == true) {
                        _state.value = LoginState.Error("Please change your password via the web admin first")
                        return@launch
                    }
                    authStore.saveLogin(body.token, body.email, body.role)
                    NetworkModule.setToken(body.token)
                    _state.value = LoginState.Success
                } else {
                    val msg = when (response.code()) {
                        401 -> "Invalid email or password"
                        else -> "Login failed (${response.code()})"
                    }
                    _state.value = LoginState.Error(msg)
                }
            } catch (e: Exception) {
                val msg = when (e) {
                    is java.net.ConnectException ->
                        "Cannot connect to server (${e.message})"
                    is java.net.UnknownHostException ->
                        "Server address not found (${e.message})"
                    else -> "Network error: ${e.message}"
                }
                _state.value = LoginState.Error(msg)
            }
        }
    }

    fun reset() {
        _state.value = LoginState.Idle
    }
}
