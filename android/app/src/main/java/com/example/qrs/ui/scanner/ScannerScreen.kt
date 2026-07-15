package com.example.qrs.ui.scanner

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.qrs.ui.theme.QRSCheckinTheme
import com.example.qrs.ui.theme.ScanError
import com.example.qrs.ui.theme.ScanSuccess
import com.example.qrs.ui.theme.ScanWarning
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.delay
import java.util.concurrent.Executors
import androidx.camera.core.Preview as CameraPreview

@SuppressLint("UnsafeOptInUsageError")
private fun ImageProxy.getImageOrNull() = image

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScannerScreen(
    viewModel: ScannerViewModel = viewModel(), onLogout: () -> Unit, onSettings: () -> Unit
) {
    val scanState by viewModel.scanState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val haptic = LocalHapticFeedback.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }
    var cameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var camera by remember { mutableStateOf<Camera?>(null) }
    var torchOn by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted -> hasCameraPermission = granted }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    LaunchedEffect(scanState) {
        if (scanState.isFinal) {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            delay(3000)
            viewModel.resetState()
        }
    }

    LaunchedEffect(torchOn) {
        camera?.cameraControl?.enableTorch(torchOn)
    }

    val onQrScanned: (String) -> Unit = { token ->
        viewModel.onQrScanned(token)
    }

    DisposableEffect(Unit) {
        onDispose {
            cameraProvider?.unbindAll()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        if (hasCameraPermission) {
            AndroidView(
                modifier = Modifier.fillMaxSize(), factory = { ctx ->
                    val previewView = PreviewView(ctx).apply {
                        scaleType = PreviewView.ScaleType.FILL_CENTER
                    }

                    val future = ProcessCameraProvider.getInstance(ctx)
                    future.addListener({
                        val provider = future.get()
                        cameraProvider = provider

                        val preview = CameraPreview.Builder().build()
                        preview.surfaceProvider = previewView.surfaceProvider

                        val barcodeScanner = BarcodeScanning.getClient(
                            com.google.mlkit.vision.barcode.BarcodeScannerOptions.Builder()
                                .setBarcodeFormats(Barcode.FORMAT_QR_CODE).build()
                        )

                        val analysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()

                        analysis.setAnalyzer(Executors.newSingleThreadExecutor()) { proxy: ImageProxy ->
                            proxy.getImageOrNull()?.let { mediaImage ->
                                val inputImage = InputImage.fromMediaImage(
                                    mediaImage, proxy.imageInfo.rotationDegrees
                                )
                                barcodeScanner.process(inputImage)
                                    .addOnSuccessListener { barcodes ->
                                        barcodes.firstOrNull()?.rawValue?.let(onQrScanned)
                                    }.addOnCompleteListener { proxy.close() }
                            } ?: proxy.close()
                        }

                        try {
                            provider.unbindAll()
                            camera = provider.bindToLifecycle(
                                lifecycleOwner,
                                CameraSelector.DEFAULT_BACK_CAMERA,
                                preview,
                                analysis
                            )
                        } catch (e: Exception) {
                            Log.e("ScannerScreen", "Camera bind failed", e)
                        }
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView
                })
        }

        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer(compositingStrategy = CompositingStrategy.Offscreen)
        ) {
            val rectSize = 240.dp.toPx()
            val left = (size.width - rectSize) / 2
            val top = (size.height - rectSize) / 2
            drawRect(Color.Black.copy(alpha = 0.45f))
            drawRoundRect(
                color = Color.Transparent,
                topLeft = Offset(left, top),
                size = Size(rectSize, rectSize),
                cornerRadius = CornerRadius(12.dp.toPx()),
                blendMode = BlendMode.Clear
            )
        }

        ScanFrame(
            modifier = Modifier
                .size(240.dp)
                .align(Alignment.Center)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .align(Alignment.TopCenter),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { torchOn = !torchOn }) {
                Icon(
                    imageVector = if (torchOn) Icons.Filled.FlashOff else Icons.Filled.FlashOn,
                    contentDescription = "Flash",
                    tint = Color.White
                )
            }
            IconButton(onClick = onSettings) {
                Icon(
                    imageVector = Icons.Filled.Settings,
                    contentDescription = "Settings",
                    tint = Color.White
                )
            }
            IconButton(onClick = onLogout) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = "Logout",
                    tint = Color.White
                )
            }
        }

        Text(
            text = "Align QR code within the frame",
            color = Color.White.copy(alpha = 0.7f),
            textAlign = TextAlign.Center,
            fontSize = 14.sp,
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(bottom = 100.dp, start = 32.dp, end = 32.dp)
        )

        ScanResultOverlay(scanState)
    }

    if (!hasCameraPermission) {
        Box(
            modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Camera permission required", style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
private fun ScanFrame(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition()
    val scanLineProgress by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 1f, animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing), repeatMode = RepeatMode.Reverse
        )
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val s = 4.dp.toPx()
            val l = 28.dp.toPx()
            val w = size.width
            val h = size.height
            val c = Color.White

            drawLine(c, Offset(0f, l), Offset(0f, 0f), s)
            drawLine(c, Offset(0f, 0f), Offset(l, 0f), s)

            drawLine(c, Offset(w - l, 0f), Offset(w, 0f), s)
            drawLine(c, Offset(w, 0f), Offset(w, l), s)

            drawLine(c, Offset(0f, h - l), Offset(0f, h), s)
            drawLine(c, Offset(0f, h), Offset(l, h), s)

            drawLine(c, Offset(w - l, h), Offset(w, h), s)
            drawLine(c, Offset(w, h - l), Offset(w, h), s)

            val lineY = 4.dp.toPx() + (h - 8.dp.toPx()) * scanLineProgress
            val lineStart = 4.dp.toPx()
            val lineEnd = w - 4.dp.toPx()
            drawLine(
                color = Color.White.copy(alpha = 0.8f),
                start = Offset(lineStart, lineY),
                end = Offset(lineEnd, lineY),
                strokeWidth = 2.dp.toPx()
            )
        }
    }
}

@Composable
private fun ScanResultOverlay(state: ScanState) {
    AnimatedVisibility(
        visible = state !is ScanState.Idle && state !is ScanState.Scanning,
        enter = scaleIn(animationSpec = tween(300)) + fadeIn(tween(300)),
        exit = fadeOut(tween(200))
    ) {
        when (state) {
            is ScanState.Success -> ScanResultContent(
                color = ScanSuccess,
                icon = Icons.Filled.CheckCircle,
                title = "Checked In",
                subtitle = state.name,
                paymentStatus = state.paymentStatus
            )

            is ScanState.AlreadyIn -> ScanResultContent(
                color = ScanWarning,
                icon = Icons.Filled.HourglassEmpty,
                title = "Already Checked In",
                subtitle = state.name,
                paymentStatus = null
            )

            is ScanState.Invalid -> ScanResultContent(
                color = ScanError,
                icon = Icons.Filled.Cancel,
                title = "Invalid QR",
                subtitle = state.message,
                paymentStatus = null
            )

            is ScanState.Error -> ScanResultContent(
                color = ScanError,
                icon = Icons.Filled.Error,
                title = "Error",
                subtitle = state.message,
                paymentStatus = null
            )

            else -> {}
        }
    }

    if (state is ScanState.Scanning) {
        Box(
            modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Scanning...",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun ScanResultContent(
    color: Color, icon: ImageVector, title: String, subtitle: String?, paymentStatus: String?
) {
    var progress by remember { mutableFloatStateOf(1f) }

    LaunchedEffect(Unit) {
        val start = System.currentTimeMillis()
        while (true) {
            val elapsed = System.currentTimeMillis() - start
            if (elapsed >= 3000) {
                progress = 0f
                break
            }
            progress = 1f - elapsed / 3000f
            delay(16)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(color.copy(alpha = 0.88f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .padding(32.dp)
                .fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            )
        ) {
            Column(
                modifier = Modifier
                    .padding(28.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .background(color, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(40.dp)
                    )
                }

                Spacer(Modifier.height(16.dp))

                Text(
                    text = title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = color
                )

                if (subtitle != null && subtitle.isNotBlank()) {
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = subtitle,
                        fontSize = 16.sp,
                        color = Color.DarkGray,
                        textAlign = TextAlign.Center
                    )
                }

                if (paymentStatus != null) {
                    Spacer(Modifier.height(8.dp))
                    val isPaid = paymentStatus == "yes"
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (isPaid) ScanSuccess else ScanWarning
                        ), shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (isPaid) "Paid" else "Unpaid",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(Modifier.height(20.dp))

                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp),
                    color = color,
                    trackColor = color.copy(alpha = 0.2f),
                )
            }
        }
    }
}

@Preview(showBackground = true, name = "Scan Frame")
@Composable
private fun ScanFramePreview() {
    QRSCheckinTheme {
        Box(
            Modifier
                .fillMaxSize()
                .background(Color.DarkGray), contentAlignment = Alignment.Center
        ) {
            ScanFrame(modifier = Modifier.size(240.dp))
        }
    }
}

@Preview(showBackground = true, name = "Result: Checked In")
@Composable
private fun ScanResultCheckedInPreview() {
    QRSCheckinTheme {
        ScanResultContent(
            color = ScanSuccess,
            icon = Icons.Filled.CheckCircle,
            title = "Checked In",
            subtitle = "Juan Dela Cruz",
            paymentStatus = "yes"
        )
    }
}

@Preview(showBackground = true, name = "Result: Already In")
@Composable
private fun ScanResultAlreadyInPreview() {
    QRSCheckinTheme {
        ScanResultContent(
            color = ScanWarning,
            icon = Icons.Filled.HourglassEmpty,
            title = "Already Checked In",
            subtitle = "Maria Santos",
            paymentStatus = null
        )
    }
}

@Preview(showBackground = true, name = "Result: Invalid QR")
@Composable
private fun ScanResultInvalidPreview() {
    QRSCheckinTheme {
        ScanResultContent(
            color = ScanError,
            icon = Icons.Filled.Cancel,
            title = "Invalid QR",
            subtitle = "QR code not recognized",
            paymentStatus = null
        )
    }
}

@Preview(showBackground = true, name = "Result: Network Error")
@Composable
private fun ScanResultErrorPreview() {
    QRSCheckinTheme {
        ScanResultContent(
            color = ScanError,
            icon = Icons.Filled.Error,
            title = "Network Error",
            subtitle = "Connection refused",
            paymentStatus = null
        )
    }
}

@Preview(showBackground = true, name = "Result: Checked In (Unpaid)")
@Composable
private fun ScanResultCheckedInUnpaidPreview() {
    QRSCheckinTheme {
        ScanResultContent(
            color = ScanSuccess,
            icon = Icons.Filled.CheckCircle,
            title = "Checked In",
            subtitle = "Pedro Garcia",
            paymentStatus = "no"
        )
    }
}
