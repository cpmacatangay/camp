package com.example.qrs.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/scan/{qrToken}")
    suspend fun scanToken(@Path("qrToken") token: String): Response<ScanResponse>
}
