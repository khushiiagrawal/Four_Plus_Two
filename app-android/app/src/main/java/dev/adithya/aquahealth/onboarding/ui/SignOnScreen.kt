package dev.adithya.aquahealth.onboarding.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.R
import dev.adithya.aquahealth.onboarding.model.VerificationError
import dev.adithya.aquahealth.onboarding.model.VerificationStatus
import dev.adithya.aquahealth.onboarding.viewmodel.SignOnViewModel
import dev.adithya.aquahealth.ui.navigation.Route.Companion.MAIN_ROUTE
import dev.adithya.aquahealth.ui.navigation.Route.Companion.ONBOARDING_ROUTE

/**
 * Consists of a:
 * - Welcome message
 * - Text fields: Phone number, OTP
 * - Buttons: Send OTP, verify
 */
@Composable
fun SignOnScreen(
    navController: NavHostController,
    viewModel: SignOnViewModel = hiltViewModel(),
) {
    val verificationState by viewModel.verificationStatus.collectAsState()
    var phone by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    val isOtpSending by remember { derivedStateOf { verificationState is VerificationStatus.SendingCode } }
    val isVerifying by remember { derivedStateOf { verificationState is VerificationStatus.Verifying } }
    val errorMsg = remember {
        derivedStateOf {
            if (verificationState is VerificationStatus.Error) {
                val reason = (verificationState as VerificationStatus.Error).reason
                when (reason) {
                    is VerificationError.InvalidCredentials -> "Invalid credentials"
                    is VerificationError.RateLimited -> "Please try again later"
                    is VerificationError.Unknown -> "Unknown error: ${reason.exception?.message}"
                }
            } else {
                null
            }
        }
    }

    LaunchedEffect(verificationState) {
        if (verificationState is VerificationStatus.CodeSent) {
            isOtpSent = true
            // TODO: resend otp
        }
        if (verificationState is VerificationStatus.Verified) {
            navController.navigate(MAIN_ROUTE) {
                popUpTo(ONBOARDING_ROUTE) { inclusive = true }
            }
        }
    }

    Scaffold { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .padding(top = 64.dp)
                    .padding(bottom = 48.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.WaterDrop,
                    contentDescription = "Logo",
                    modifier = Modifier
                        .size(48.dp)
                )
                Text(
                    text = stringResource(R.string.app_name),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            Text(
                "Sign In",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier
                    .padding(bottom = 8.dp)
            )
            OutlinedTextField(
                value = phone, onValueChange = { phone = it },
                label = { Text("Mobile number") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.width(300.dp)
            )

            if (isOtpSent) {
                Text(
                    text = "Please enter the code sent via SMS."
                )
                OutlinedTextField(
                    value = otp,
                    onValueChange = { otp = it },
                    label = { Text("6-digit OTP") },
                    singleLine = true,
                    modifier = Modifier.width(300.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
                )
            }

            errorMsg.value?.let {
                Text(
                    text = it,
                    color = Color.Red
                )
            }

            FilledTonalButton(
                onClick = {
                    if (!isOtpSent) {
                        viewModel.verifyPhone(phone)
                    } else {
                        viewModel.verifyCode(otp)
                    }
                },
                enabled = if (!isOtpSent) {
                    phone.length == 10 && !isOtpSending
                } else {
                    otp.length == 6 && !isVerifying
                },
            ) {
                Text(
                    text = when {
                        isOtpSending -> "Sending OTP..."
                        isVerifying -> "Verifying..."
                        !isOtpSent -> "Next"
                        else -> "Verify"
                    }
                )
            }
        }
    }
}