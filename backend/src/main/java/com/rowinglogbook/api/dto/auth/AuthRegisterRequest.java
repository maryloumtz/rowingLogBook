package com.rowinglogbook.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
        @NotBlank(message = "firstName is required")
        @Size(max = 100, message = "firstName must not exceed 100 characters")
        String firstName,

        @NotBlank(message = "lastName is required")
        @Size(max = 100, message = "lastName must not exceed 100 characters")
        String lastName,

        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 150, message = "email must not exceed 150 characters")
        String email,

        @Size(max = 30, message = "phone must not exceed 30 characters")
        String phone,

        @NotBlank(message = "password is required")
        @Size(min = 8, max = 128, message = "password must be between 8 and 128 characters")
        String password
) {
}
