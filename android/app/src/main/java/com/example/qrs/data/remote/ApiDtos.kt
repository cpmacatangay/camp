package com.example.qrs.data.remote

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val role: String,
    val email: String
)

data class ScanResponse(
    val message: String,
    val name: String,
    val paymentStatus: String
)
