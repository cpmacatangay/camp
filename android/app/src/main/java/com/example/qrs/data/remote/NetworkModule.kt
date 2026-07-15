package com.example.qrs.data.remote

import com.example.qrs.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    @Volatile
    var baseUrl: String = BuildConfig.SERVER_BASE_URL
        set(value) {
            var url = value.trim().trimEnd('/')
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://$url"
            }
            field = url
            synchronized(this) { _api = null }
        }

    @Volatile
    private var token: String? = null

    @Volatile
    private var _api: ApiService? = null

    fun setToken(t: String?) {
        token = t
        synchronized(this) { _api = null }
    }

    fun getToken(): String? = token

    fun getApi(): ApiService {
        _api?.let { return it }
        synchronized(this) {
            _api?.let { return it }
            _api = buildApi()
            return _api!!
        }
    }

    private fun buildApi(): ApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
            else HttpLoggingInterceptor.Level.NONE
        }

        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                token?.let { request.addHeader("Authorization", "Bearer $it") }
                chain.proceed(request.build())
            }
            .addInterceptor(logging)
            .connectTimeout(120, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl.trimEnd('/') + "/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
