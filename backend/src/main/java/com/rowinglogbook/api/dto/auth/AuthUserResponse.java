package com.rowinglogbook.api.dto.auth;

import com.rowinglogbook.api.enums.MemberRole;

public record AuthUserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        MemberRole role
) {
}
