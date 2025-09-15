package dev.adithya.aquahealth.onboarding.ui

import android.R.attr.name
import android.R.attr.onClick
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.Button
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.Divider
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.ui.navigation.NavItem

/**
 * Consists of a:
 * - Welcome message
 * - Text fields: Phone number, OTP
 * - Buttons: Send OTP, verify
 */
@Composable
fun SignOnScreen(
    navController: NavHostController,
    onSubmit: () -> Unit
) {
    var phone by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    val isVerified = remember { derivedStateOf { isOtpSent && otp == "12345" } }

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
                    text = "A Q U A H E A L T H",
                    style = MaterialTheme.typography.titleLarge
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
                OutlinedTextField(
                    value = otp,
                    onValueChange = { otp = it },
                    label = { Text("Enter OTP") },
                    singleLine = true,
                    modifier = Modifier.width(300.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
                )
            }

            FilledTonalButton(
                onClick = {
                    /* TODO */
                    if (!isOtpSent) {
                        isOtpSent = true
                    } else {
                        onSubmit()
                    }
                          },
                enabled = if (!isVerified.value) phone.length == 10 && !isOtpSent else isVerified.value
            ) {
                if (!isOtpSent) {
                    Text("Send OTP")
                } else {
                    Icon(Icons.Default.ArrowForward, contentDescription = null)
                }
            }
        }
    }
}