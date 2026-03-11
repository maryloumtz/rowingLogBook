package com.rowinglogbook.api.dto.session;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;

public record SessionCreateRequest(
        @NotNull(message = "boatId is required")
        @Positive(message = "boatId must be positive")
        Long boatId,

        @NotNull(message = "createdById is required")
        @Positive(message = "createdById must be positive")
        Long createdById,

        @NotNull(message = "startTime is required")
        Instant startTime
) {
}
