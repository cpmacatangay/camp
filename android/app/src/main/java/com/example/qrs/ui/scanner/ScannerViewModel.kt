package com.example.qrs.ui.scanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.qrs.QRSApp
import com.example.qrs.data.remote.NetworkModule
import com.example.qrs.data.remote.ScanResponse
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

sealed class ScanState {
    data object Idle : ScanState()
    data object Scanning : ScanState()
    data class Success(val name: String, val paymentStatus: String) : ScanState()
    data class AlreadyIn(val name: String) : ScanState()
    data class Invalid(val message: String) : ScanState()
    data class Error(val message: String) : ScanState()

    val isFinal: Boolean get() = this is Success || this is AlreadyIn || this is Invalid || this is Error
}

class ScannerViewModel : ViewModel() {
    private val api
        get() = NetworkModule.getApi()
    private val authStore = QRSApp.instance.authStore

    private val _scanState = MutableStateFlow<ScanState>(ScanState.Idle)
    val scanState: StateFlow<ScanState> = _scanState.asStateFlow()

    private val lastScanned = mutableMapOf<String, Long>()

    fun onQrScanned(token: String) {
        if (_scanState.value.isFinal) return

        val now = System.currentTimeMillis()
        if (now - (lastScanned[token] ?: 0) < 2000) return
        lastScanned[token] = now

        if (!token.matches(Regex("^[0-9a-f]{32}$"))) {
            _scanState.value = ScanState.Invalid("Invalid QR code format")
            return
        }

        _scanState.value = ScanState.Scanning

        viewModelScope.launch {
            try {
                val response = api.scanToken(token)
                if (response.isSuccessful) {
                    val body = response.body()!!
                    _scanState.value = ScanState.Success(body.name, body.paymentStatus)
                } else {
                    when (response.code()) {
                        409 -> {
                            val name = try {
                                val errBody = response.errorBody()?.string()
                                errBody?.let { Gson().fromJson(it, ScanResponse::class.java) }?.name
                            } catch (_: Exception) { null }
                            _scanState.value = ScanState.AlreadyIn(name ?: "Unknown")
                        }
                        404 -> _scanState.value = ScanState.Invalid("QR code not recognized")
                        401, 403 -> {
                            authStore.clear()
                            NetworkModule.setToken(null)
                            _scanState.value = ScanState.Error("Session expired — log in again")
                        }
                        else -> _scanState.value = ScanState.Error("Server error (${response.code()})")
                    }
                }
            } catch (e: HttpException) {
                _scanState.value = ScanState.Error("Server error (${e.code()})")
            } catch (e: Exception) {
                _scanState.value = ScanState.Error("Network error: ${e.message}")
            }
        }
    }

    fun resetState() {
        _scanState.value = ScanState.Idle
    }
}
