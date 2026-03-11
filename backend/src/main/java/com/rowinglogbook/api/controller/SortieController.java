package com.rowinglogbook.api.controller;

import com.rowinglogbook.api.dto.session.SessionCloseRequest;
import com.rowinglogbook.api.dto.session.SessionCreateRequest;
import com.rowinglogbook.api.dto.session.SessionResponse;
import com.rowinglogbook.api.service.SessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping({"/api/sorties", "/api/sessions"})
public class SortieController {

    private final SessionService sessionService;

    public SortieController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<SessionResponse> create(@Valid @RequestBody SessionCreateRequest request) {
        SessionResponse response = sessionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{sessionId}/close")
    public SessionResponse close(
            @PathVariable @Positive Long sessionId,
            @RequestBody(required = false) SessionCloseRequest request
    ) {
        return sessionService.close(sessionId, request);
    }

    @GetMapping
    public List<SessionResponse> list() {
        return sessionService.listAll();
    }
}
